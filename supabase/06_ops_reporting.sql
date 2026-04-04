-- VNB operations hardening + investor reporting source of truth
-- Run after 01_core.sql, 02_rls.sql, 03_checkout.sql, 04_affiliates.sql, and 05_steward_applications.sql

alter table public.steward_commissions
  add column if not exists reversed_at timestamptz,
  add column if not exists reversal_reason text not null default '';

create unique index if not exists idx_steward_awards_weekly_unique
on public.steward_milestone_awards (steward_id, milestone_id, reference_period_start, reference_period_end)
where reference_period_start is not null and reference_period_end is not null;

create unique index if not exists idx_steward_awards_all_time_unique
on public.steward_milestone_awards (steward_id, milestone_id)
where reference_period_start is null and reference_period_end is null;

create or replace function public.update_my_steward_payout_profile(
  p_payout_method text default '',
  p_payout_account_ref text default ''
)
returns public.vnb_stewards
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.vnb_stewards%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  update public.vnb_stewards
  set
    payout_method = trim(coalesce(p_payout_method, '')),
    payout_account_ref = trim(coalesce(p_payout_account_ref, ''))
  where user_id = v_uid
  returning * into v_row;

  if not found then
    raise exception 'not_steward';
  end if;

  return v_row;
end;
$$;

create or replace function public.reconcile_steward_commissions_from_orders(p_limit integer default 500)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_reversed integer := 0;
  v_manual integer := 0;
  v_now timestamptz := public.now_utc();
  v_limit integer := greatest(coalesce(p_limit, 500), 1);
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'admin_required';
  end if;

  for v_row in
    select
      sc.id,
      sc.payout_id,
      sc.commission_amount,
      coalesce(sp.status, '') as payout_status
    from public.steward_commissions sc
    join public.orders o on o.id = sc.order_id
    left join public.steward_payouts sp on sp.id = sc.payout_id
    where sc.status in ('pending', 'approved')
      and o.status = 'cancelled'
    order by sc.created_at desc
    limit v_limit
  loop
    if v_row.payout_id is not null and v_row.payout_status = 'paid' then
      v_manual := v_manual + 1;
      continue;
    end if;

    if v_row.payout_id is not null then
      update public.steward_payouts
      set
        gross_commission = greatest(0, gross_commission - v_row.commission_amount),
        total_amount = greatest(0, total_amount - v_row.commission_amount),
        updated_at = public.now_utc()
      where id = v_row.payout_id;
    end if;

    update public.steward_commissions
    set
      status = 'reversed',
      payout_id = null,
      reversed_at = v_now,
      reversal_reason = 'order_cancelled',
      notes = trim(concat_ws(' | ', nullif(notes, ''), 'Auto reversed: order cancelled'))
    where id = v_row.id;

    v_reversed := v_reversed + 1;
  end loop;

  return jsonb_build_object(
    'reversed_count', v_reversed,
    'manual_review_count', v_manual
  );
end;
$$;

create or replace function public.issue_steward_milestone_awards(p_period_end date default current_date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period_end date := coalesce(p_period_end, current_date);
  v_period_start date := v_period_end - 6;
  v_inserted integer := 0;
  v_count integer := 0;
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'admin_required';
  end if;

  with weekly_counts as (
    select
      o.steward_id,
      count(*)::integer as successful_orders
    from public.orders o
    where o.steward_id is not null
      and o.payment_status = 'paid'
      and o.status in ('processing', 'shipped', 'delivered')
      and o.created_at::date between v_period_start and v_period_end
    group by o.steward_id
  )
  insert into public.steward_milestone_awards (
    steward_id,
    milestone_id,
    reward_status,
    reference_period_start,
    reference_period_end,
    notes
  )
  select
    wc.steward_id,
    md.id,
    'pending',
    v_period_start,
    v_period_end,
    ''
  from weekly_counts wc
  join public.steward_milestone_definitions md
    on md.is_active = true
   and md.measurement_window = 'weekly'
   and wc.successful_orders >= md.required_successful_orders
  where not exists (
    select 1
    from public.steward_milestone_awards a
    where a.steward_id = wc.steward_id
      and a.milestone_id = md.id
      and a.reference_period_start = v_period_start
      and a.reference_period_end = v_period_end
  );

  get diagnostics v_count = row_count;
  v_inserted := v_inserted + v_count;

  with all_time_counts as (
    select
      o.steward_id,
      count(*)::integer as successful_orders
    from public.orders o
    where o.steward_id is not null
      and o.payment_status = 'paid'
      and o.status in ('processing', 'shipped', 'delivered')
    group by o.steward_id
  )
  insert into public.steward_milestone_awards (
    steward_id,
    milestone_id,
    reward_status,
    reference_period_start,
    reference_period_end,
    notes
  )
  select
    atc.steward_id,
    md.id,
    'pending',
    null,
    null,
    ''
  from all_time_counts atc
  join public.steward_milestone_definitions md
    on md.is_active = true
   and md.measurement_window = 'all_time'
   and atc.successful_orders >= md.required_successful_orders
  where not exists (
    select 1
    from public.steward_milestone_awards a
    where a.steward_id = atc.steward_id
      and a.milestone_id = md.id
      and a.reference_period_start is null
      and a.reference_period_end is null
  );

  get diagnostics v_count = row_count;
  v_inserted := v_inserted + v_count;

  return v_inserted;
end;
$$;

create or replace function public.run_steward_ops_cycle(
  p_period_end date default current_date,
  p_reversal_limit integer default 500
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_approved integer := 0;
  v_reconcile jsonb;
  v_milestones integer := 0;
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'admin_required';
  end if;

  v_approved := public.auto_approve_steward_commissions(public.now_utc());
  v_reconcile := public.reconcile_steward_commissions_from_orders(p_reversal_limit);
  v_milestones := public.issue_steward_milestone_awards(p_period_end);

  return jsonb_build_object(
    'auto_approved', v_approved,
    'reconcile', v_reconcile,
    'milestones_issued', v_milestones
  );
end;
$$;

create table if not exists public.investor_reporting_snapshots (
  id bigint generated by default as identity primary key,
  as_of_date date not null unique,
  active_categories integer not null default 0,
  active_products integer not null default 0,
  featured_products integer not null default 0,
  paid_orders_30d integer,
  monthly_revenue numeric(12, 2),
  notes text not null default '',
  is_public boolean not null default true,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

drop trigger if exists trg_investor_reporting_snapshots_updated_at on public.investor_reporting_snapshots;
create trigger trg_investor_reporting_snapshots_updated_at before update on public.investor_reporting_snapshots
for each row execute procedure public.set_updated_at();

alter table public.investor_reporting_snapshots enable row level security;

drop policy if exists "public read investor snapshots" on public.investor_reporting_snapshots;
create policy "public read investor snapshots" on public.investor_reporting_snapshots
for select using (is_public = true);

drop policy if exists "admins full investor snapshots" on public.investor_reporting_snapshots;
create policy "admins full investor snapshots" on public.investor_reporting_snapshots
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create or replace function public.capture_investor_snapshot_from_live(p_as_of_date date default current_date)
returns public.investor_reporting_snapshots
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.investor_reporting_snapshots%rowtype;
begin
  if auth.uid() is not null and not public.is_admin(auth.uid()) then
    raise exception 'admin_required';
  end if;

  insert into public.investor_reporting_snapshots (
    as_of_date,
    active_categories,
    active_products,
    featured_products,
    paid_orders_30d,
    monthly_revenue,
    notes,
    is_public
  )
  values (
    coalesce(p_as_of_date, current_date),
    (select count(*)::integer from public.categories where is_active = true),
    (select count(*)::integer from public.products where is_active = true),
    (select count(*)::integer from public.products where is_active = true and is_featured = true),
    (
      select count(*)::integer
      from public.orders
      where payment_status = 'paid'
        and created_at >= (public.now_utc() - interval '30 days')
    ),
    (
      select coalesce(sum(total), 0)::numeric(12, 2)
      from public.orders
      where payment_status = 'paid'
        and created_at >= (public.now_utc() - interval '30 days')
    ),
    '',
    true
  )
  on conflict (as_of_date) do update
  set
    active_categories = excluded.active_categories,
    active_products = excluded.active_products,
    featured_products = excluded.featured_products,
    paid_orders_30d = excluded.paid_orders_30d,
    monthly_revenue = excluded.monthly_revenue,
    updated_at = public.now_utc()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.get_latest_public_investor_metrics()
returns table (
  as_of_date date,
  active_categories integer,
  active_products integer,
  featured_products integer,
  paid_orders_30d integer,
  monthly_revenue numeric,
  source text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.investor_reporting_snapshots where is_public = true) then
    return query
    select
      s.as_of_date,
      s.active_categories,
      s.active_products,
      s.featured_products,
      s.paid_orders_30d,
      s.monthly_revenue,
      'snapshot'::text
    from public.investor_reporting_snapshots s
    where s.is_public = true
    order by s.as_of_date desc
    limit 1;
    return;
  end if;

  return query
  select
    current_date as as_of_date,
    (select count(*)::integer from public.categories where is_active = true) as active_categories,
    (select count(*)::integer from public.products where is_active = true) as active_products,
    (select count(*)::integer from public.products where is_active = true and is_featured = true) as featured_products,
    (
      select count(*)::integer
      from public.orders
      where payment_status = 'paid'
        and created_at >= (public.now_utc() - interval '30 days')
    ) as paid_orders_30d,
    (
      select coalesce(sum(total), 0)::numeric
      from public.orders
      where payment_status = 'paid'
        and created_at >= (public.now_utc() - interval '30 days')
    ) as monthly_revenue,
    'live_fallback'::text as source;
end;
$$;

grant execute on function public.update_my_steward_payout_profile(text, text) to authenticated;
grant execute on function public.reconcile_steward_commissions_from_orders(integer) to authenticated;
grant execute on function public.issue_steward_milestone_awards(date) to authenticated;
grant execute on function public.run_steward_ops_cycle(date, integer) to authenticated;
grant execute on function public.capture_investor_snapshot_from_live(date) to authenticated;
grant execute on function public.get_latest_public_investor_metrics() to anon, authenticated;
