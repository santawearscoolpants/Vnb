-- VNB Supabase schema
-- Run in Supabase SQL editor in this order:
-- 1) this file
-- 2) create at least one auth user, then insert into admin_users

create extension if not exists pgcrypto;

-- -----------------------------
-- Helpers
-- -----------------------------
create or replace function public.now_utc()
returns timestamptz
language sql
stable
as $$
  select timezone('utc', now());
$$;

-- Steward ops hardening (approval hold + payout batching)
alter table public.steward_commissions
  add column if not exists hold_until timestamptz;

create table if not exists public.steward_program_settings (
  id smallint primary key default 1 check (id = 1),
  approval_hold_days integer not null default 14 check (approval_hold_days >= 0 and approval_hold_days <= 90),
  payout_cadence_days integer not null default 14 check (payout_cadence_days >= 7 and payout_cadence_days <= 31),
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

insert into public.steward_program_settings (id, approval_hold_days, payout_cadence_days)
values (1, 14, 14)
on conflict (id) do update
set
  approval_hold_days = excluded.approval_hold_days,
  payout_cadence_days = excluded.payout_cadence_days,
  updated_at = public.now_utc();

create index if not exists idx_steward_commissions_hold on public.steward_commissions(status, hold_until, payout_id);

drop trigger if exists trg_steward_program_settings_updated_at on public.steward_program_settings;
create trigger trg_steward_program_settings_updated_at before update on public.steward_program_settings
for each row execute procedure public.set_updated_at();

alter table public.steward_program_settings enable row level security;

drop policy if exists "admins full steward_program_settings" on public.steward_program_settings;
create policy "admins full steward_program_settings" on public.steward_program_settings
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create or replace function public.auto_approve_steward_commissions(p_now timestamptz default public.now_utc())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  update public.steward_commissions
  set
    status = 'approved',
    approved_at = coalesce(approved_at, p_now)
  where status = 'pending'
    and payout_id is null
    and coalesce(hold_until, created_at) <= p_now;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.create_steward_payout_batch(p_period_end date default current_date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.steward_program_settings%rowtype;
  v_period_end date := coalesce(p_period_end, current_date);
  v_period_start date;
  v_group record;
  v_payout_id bigint;
  v_payout_count integer := 0;
  v_commission_count integer := 0;
begin
  select * into v_settings from public.steward_program_settings where id = 1;
  if not found then
    v_settings.approval_hold_days := 14;
    v_settings.payout_cadence_days := 14;
  end if;

  perform public.auto_approve_steward_commissions(public.now_utc());
  v_period_start := v_period_end - (greatest(v_settings.payout_cadence_days, 1) - 1);

  for v_group in
    select
      steward_id,
      sum(commission_amount)::numeric(10,2) as gross_commission,
      count(*)::integer as row_count
    from public.steward_commissions
    where status = 'approved'
      and payout_id is null
      and coalesce(approved_at, created_at)::date <= v_period_end
    group by steward_id
    having sum(commission_amount) > 0
  loop
    insert into public.steward_payouts (
      steward_id,
      period_start,
      period_end,
      scheduled_for,
      gross_commission,
      adjustments,
      total_amount,
      status
    )
    values (
      v_group.steward_id,
      v_period_start,
      v_period_end,
      v_period_end + 1,
      v_group.gross_commission,
      0,
      v_group.gross_commission,
      'pending'
    )
    returning id into v_payout_id;

    update public.steward_commissions
    set payout_id = v_payout_id
    where status = 'approved'
      and payout_id is null
      and steward_id = v_group.steward_id
      and coalesce(approved_at, created_at)::date <= v_period_end;

    v_payout_count := v_payout_count + 1;
    v_commission_count := v_commission_count + v_group.row_count;
  end loop;

  return jsonb_build_object(
    'period_start', v_period_start,
    'period_end', v_period_end,
    'payout_count', v_payout_count,
    'commission_count', v_commission_count
  );
end;
$$;

create or replace function public.mark_steward_payout_paid(p_payout_id bigint, p_reference text default '')
returns public.steward_payouts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout public.steward_payouts%rowtype;
  v_now timestamptz := public.now_utc();
begin
  select * into v_payout
  from public.steward_payouts
  where id = p_payout_id
  for update;

  if not found then
    raise exception 'Payout not found.';
  end if;

  update public.steward_payouts
  set
    status = 'paid',
    paid_at = v_now,
    payout_reference = case when trim(coalesce(p_reference, '')) <> '' then trim(p_reference) else payout_reference end
  where id = v_payout.id
  returning * into v_payout;

  update public.steward_commissions
  set
    status = 'paid',
    paid_at = v_now
  where payout_id = v_payout.id
    and status in ('approved', 'pending');

  return v_payout;
end;
$$;

create or replace function public.finalize_payment_attempt(
  p_reference text,
  p_paystack_status text default '',
  p_verified_at timestamptz default public.now_utc()
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.payment_attempts%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_commission_rate numeric(5, 4);
begin
  select *
  into v_attempt
  from public.payment_attempts
  where reference = p_reference
  for update;

  if not found then
    raise exception 'Payment reference not found.';
  end if;

  if v_attempt.order_id is not null then
    select * into v_order from public.orders where id = v_attempt.order_id;
    return v_order;
  end if;

  insert into public.orders (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    address,
    city,
    state,
    zip_code,
    country,
    subtotal,
    shipping,
    tax,
    total,
    status,
    payment_provider,
    payment_reference,
    payment_currency,
    payment_status,
    paid_at,
    notes,
    steward_id,
    referral_code,
    referral_snapshot,
    commissionable_subtotal
  )
  values (
    v_attempt.user_id,
    v_attempt.email,
    v_attempt.first_name,
    v_attempt.last_name,
    v_attempt.phone,
    v_attempt.address,
    v_attempt.city,
    v_attempt.state,
    v_attempt.zip_code,
    v_attempt.country,
    v_attempt.subtotal,
    v_attempt.shipping,
    v_attempt.tax,
    v_attempt.total,
    'processing',
    'paystack',
    v_attempt.reference,
    v_attempt.currency,
    'paid',
    coalesce(p_verified_at, public.now_utc()),
    v_attempt.notes,
    v_attempt.steward_id,
    v_attempt.referral_code,
    v_attempt.referral_snapshot,
    v_attempt.subtotal
  )
  returning * into v_order;

  for v_item in
    select * from jsonb_array_elements(v_attempt.cart_snapshot)
  loop
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);

    select *
    into v_product
    from public.products
    where id = (v_item ->> 'product_id')::bigint
      and is_active = true
    for update;

    if not found then
      raise exception 'Product no longer exists for reference %.', p_reference;
    end if;

    if v_quantity <= 0 then
      raise exception 'Invalid quantity supplied for product %.', v_product.name;
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'Insufficient stock for %.', v_product.name;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_sku,
      quantity,
      size,
      color,
      price,
      subtotal
    )
    values (
      v_order.id,
      v_product.id,
      coalesce(v_item ->> 'product_name', v_product.name),
      coalesce(v_item ->> 'product_sku', coalesce(v_product.sku, '')),
      v_quantity,
      coalesce(v_item ->> 'size', ''),
      coalesce(v_item ->> 'color', ''),
      (v_item ->> 'price')::numeric,
      (v_item ->> 'subtotal')::numeric
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product.id;
  end loop;

  if v_attempt.steward_id is not null and exists (
    select 1
    from public.vnb_stewards s
    where s.user_id = v_attempt.steward_id
      and s.status = 'active'
  ) then
    v_commission_rate := coalesce(
      nullif(v_attempt.referral_snapshot ->> 'commission_rate', '')::numeric,
      (select s.commission_rate from public.vnb_stewards s where s.user_id = v_attempt.steward_id),
      0.1000
    );

    insert into public.steward_commissions (
      steward_id,
      order_id,
      referral_code,
      basis_amount,
      commission_rate,
      commission_amount,
      status,
      hold_until
    )
    values (
      v_attempt.steward_id,
      v_order.id,
      v_attempt.referral_code,
      v_attempt.subtotal,
      v_commission_rate,
      round(v_attempt.subtotal * v_commission_rate, 2),
      'pending',
      public.now_utc() + make_interval(days => coalesce((select approval_hold_days from public.steward_program_settings where id = 1), 14))
    )
    on conflict (order_id) do nothing;
  end if;

  update public.payment_attempts
  set
    order_id = v_order.id,
    status = 'success',
    paystack_status = coalesce(nullif(p_paystack_status, ''), paystack_status),
    verified_at = coalesce(p_verified_at, public.now_utc())
  where id = v_attempt.id;

  return v_order;
end;
$$;

create or replace function public.generate_order_number()
returns text
language sql
stable
as $$
  select 'VNB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = public.now_utc();
  return new;
end;
$$;

create or replace function public.normalize_referral_code(p_code text)
returns text
language sql
immutable
as $$
  select upper(regexp_replace(coalesce(trim(p_code), ''), '[^A-Za-z0-9_-]', '', 'g'));
$$;

create or replace function public.prepare_steward_referral_code()
returns trigger
language plpgsql
as $$
begin
  new.code := public.normalize_referral_code(new.code);
  return new;
end;
$$;

-- -----------------------------
-- Core catalog
-- -----------------------------
create table if not exists public.categories (
  id bigint generated by default as identity primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.products (
  id bigint generated by default as identity primary key,
  category_id bigint not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sku text unique,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.product_images (
  id bigint generated by default as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  is_primary boolean not null default false,
  "order" integer not null default 0,
  created_at timestamptz not null default public.now_utc()
);

create table if not exists public.product_colors (
  id bigint generated by default as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  name text not null,
  hex_code text not null,
  is_available boolean not null default true,
  unique(product_id, name)
);

create table if not exists public.product_sizes (
  id bigint generated by default as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  size text not null,
  is_available boolean not null default true,
  unique(product_id, size)
);

create table if not exists public.product_details (
  id bigint generated by default as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  detail text not null,
  "order" integer not null default 0
);

-- -----------------------------
-- Comms / lead capture
-- -----------------------------
create table if not exists public.newsletters (
  id bigint generated by default as identity primary key,
  email text not null unique,
  subscribed_at timestamptz not null default public.now_utc(),
  is_active boolean not null default true
);

create table if not exists public.contact_messages (
  id bigint generated by default as identity primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null,
  message text not null,
  created_at timestamptz not null default public.now_utc(),
  is_read boolean not null default false
);

create table if not exists public.investment_inquiries (
  id bigint generated by default as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  tier text not null check (tier in ('seed', 'growth', 'strategic', 'custom')),
  message text not null default '',
  created_at timestamptz not null default public.now_utc(),
  is_contacted boolean not null default false
);

create table if not exists public.steward_waitlist (
  id bigint generated by default as identity primary key,
  full_name text not null,
  email text not null unique,
  phone text not null default '',
  location text not null default '',
  background text not null default '',
  message text not null default '',
  status text not null default 'joined' check (status in ('joined', 'reviewed', 'invited', 'archived')),
  converted_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.vnb_stewards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  status text not null default 'waitlisted' check (status in ('waitlisted', 'invited', 'active', 'paused', 'suspended', 'removed')),
  commission_tier text not null default 'standard' check (commission_tier in ('standard', 'support')),
  commission_rate numeric(5, 4) not null default 0.1000 check (commission_rate >= 0 and commission_rate <= 1),
  course_status text not null default 'not_started' check (course_status in ('not_started', 'in_progress', 'completed', 'waived')),
  payout_method text not null default '',
  payout_account_ref text not null default '',
  notes text not null default '',
  joined_at timestamptz not null default public.now_utc(),
  activated_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_referral_codes (
  id bigint generated by default as identity primary key,
  steward_id uuid not null references public.vnb_stewards(user_id) on delete cascade,
  code text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive', 'expired')),
  is_primary boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create unique index if not exists idx_steward_referral_codes_primary
on public.steward_referral_codes (steward_id)
where is_primary = true;

-- -----------------------------
-- User profile + commerce
-- -----------------------------
create table if not exists public.user_profiles (
  id bigint generated by default as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  title text not null default '',
  phone text not null default '',
  area_code text not null default '+1',
  birth_date date,
  company text not null default '',
  address text not null default '',
  address_continued text not null default '',
  city text not null default '',
  state text not null default '',
  zip_code text not null default '',
  zip_plus text not null default '',
  location text not null default 'United States',
  newsletter_subscribed boolean not null default false,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.carts (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_key text not null default '',
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.cart_items (
  id bigint generated by default as identity primary key,
  cart_id bigint not null references public.carts(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  size text not null default '',
  color text not null default '',
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc(),
  unique(cart_id, product_id, size, color)
);

create table if not exists public.orders (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique default public.generate_order_number(),
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_provider text not null default '',
  payment_reference text unique,
  payment_currency text not null default 'USD',
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  notes text not null default '',
  steward_id uuid references public.vnb_stewards(user_id) on delete set null,
  referral_code text not null default '',
  referral_snapshot jsonb not null default '{}'::jsonb,
  commissionable_subtotal numeric(10, 2) not null default 0,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.order_items (
  id bigint generated by default as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  product_sku text not null default '',
  quantity integer not null check (quantity > 0),
  size text not null default '',
  color text not null default '',
  price numeric(10, 2) not null,
  subtotal numeric(10, 2) not null
);

create table if not exists public.payment_attempts (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  order_id bigint unique references public.orders(id) on delete set null,
  reference text not null unique,
  access_code text not null default '',
  authorization_url text not null default '',
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  notes text not null default '',
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'USD',
  status text not null default 'initialized' check (status in ('initialized', 'pending', 'success', 'failed')),
  paystack_status text not null default '',
  steward_id uuid references public.vnb_stewards(user_id) on delete set null,
  referral_code text not null default '',
  referral_snapshot jsonb not null default '{}'::jsonb,
  cart_snapshot jsonb not null default '[]'::jsonb,
  cart_item_ids jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_payouts (
  id bigint generated by default as identity primary key,
  steward_id uuid not null references public.vnb_stewards(user_id) on delete cascade,
  period_start date not null,
  period_end date not null,
  scheduled_for date,
  gross_commission numeric(10, 2) not null default 0,
  adjustments numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  payout_reference text not null default '',
  notes text not null default '',
  paid_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_commissions (
  id bigint generated by default as identity primary key,
  steward_id uuid not null references public.vnb_stewards(user_id) on delete cascade,
  order_id bigint not null unique references public.orders(id) on delete cascade,
  payout_id bigint references public.steward_payouts(id) on delete set null,
  referral_code text not null default '',
  basis_amount numeric(10, 2) not null default 0,
  commission_rate numeric(5, 4) not null check (commission_rate >= 0 and commission_rate <= 1),
  commission_amount numeric(10, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed', 'void')),
  notes text not null default '',
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_milestone_definitions (
  id bigint generated by default as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  measurement_window text not null default 'weekly' check (measurement_window in ('weekly', 'all_time')),
  required_successful_orders integer not null check (required_successful_orders > 0),
  reward_type text not null default 'recognition' check (reward_type in ('recognition', 'store_credit', 'free_product', 'merchandise', 'ambassador_review')),
  reward_value text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_milestone_awards (
  id bigint generated by default as identity primary key,
  steward_id uuid not null references public.vnb_stewards(user_id) on delete cascade,
  milestone_id bigint not null references public.steward_milestone_definitions(id) on delete cascade,
  reward_status text not null default 'pending' check (reward_status in ('pending', 'issued', 'redeemed', 'cancelled')),
  reference_period_start date,
  reference_period_end date,
  notes text not null default '',
  earned_at timestamptz not null default public.now_utc(),
  issued_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

create table if not exists public.steward_reward_ledger (
  id bigint generated by default as identity primary key,
  steward_id uuid not null references public.vnb_stewards(user_id) on delete cascade,
  source_type text not null default 'manual' check (source_type in ('manual', 'milestone', 'commission_adjustment', 'campaign')),
  source_id bigint,
  reward_type text not null check (reward_type in ('store_credit', 'free_product', 'recognition', 'merchandise', 'ambassador_access')),
  amount numeric(10, 2),
  currency text not null default 'GHS',
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'issued', 'redeemed', 'cancelled')),
  fulfilled_at timestamptz,
  created_at timestamptz not null default public.now_utc(),
  updated_at timestamptz not null default public.now_utc()
);

-- -----------------------------
-- Admin users table + helper
-- -----------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default public.now_utc()
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = uid);
$$;

-- -----------------------------
-- Indexes
-- -----------------------------
create index if not exists idx_products_category_active on public.products(category_id, is_active);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index if not exists idx_investment_inquiries_created_at on public.investment_inquiries(created_at desc);
create index if not exists idx_steward_waitlist_created_at on public.steward_waitlist(created_at desc);
create index if not exists idx_vnb_stewards_status on public.vnb_stewards(status);
create index if not exists idx_steward_referral_codes_code on public.steward_referral_codes(code);
create index if not exists idx_payment_attempts_steward_id on public.payment_attempts(steward_id);
create index if not exists idx_orders_steward_id on public.orders(steward_id);
create index if not exists idx_steward_commissions_steward_id on public.steward_commissions(steward_id, created_at desc);
create index if not exists idx_steward_payouts_steward_id on public.steward_payouts(steward_id, period_end desc);

-- -----------------------------
-- Triggers for updated_at
-- -----------------------------
drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at before update on public.user_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_carts_updated_at on public.carts;
create trigger trg_carts_updated_at before update on public.carts
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at before update on public.cart_items
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_payment_attempts_updated_at on public.payment_attempts;
create trigger trg_payment_attempts_updated_at before update on public.payment_attempts
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_waitlist_updated_at on public.steward_waitlist;
create trigger trg_steward_waitlist_updated_at before update on public.steward_waitlist
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_vnb_stewards_updated_at on public.vnb_stewards;
create trigger trg_vnb_stewards_updated_at before update on public.vnb_stewards
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_referral_codes_updated_at on public.steward_referral_codes;
create trigger trg_steward_referral_codes_updated_at before update on public.steward_referral_codes
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_referral_codes_prepare on public.steward_referral_codes;
create trigger trg_steward_referral_codes_prepare before insert or update on public.steward_referral_codes
for each row execute procedure public.prepare_steward_referral_code();

drop trigger if exists trg_steward_payouts_updated_at on public.steward_payouts;
create trigger trg_steward_payouts_updated_at before update on public.steward_payouts
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_commissions_updated_at on public.steward_commissions;
create trigger trg_steward_commissions_updated_at before update on public.steward_commissions
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_milestone_definitions_updated_at on public.steward_milestone_definitions;
create trigger trg_steward_milestone_definitions_updated_at before update on public.steward_milestone_definitions
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_milestone_awards_updated_at on public.steward_milestone_awards;
create trigger trg_steward_milestone_awards_updated_at before update on public.steward_milestone_awards
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_steward_reward_ledger_updated_at on public.steward_reward_ledger;
create trigger trg_steward_reward_ledger_updated_at before update on public.steward_reward_ledger
for each row execute procedure public.set_updated_at();

-- -----------------------------
-- RLS
-- -----------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_sizes enable row level security;
alter table public.product_details enable row level security;
alter table public.newsletters enable row level security;
alter table public.contact_messages enable row level security;
alter table public.investment_inquiries enable row level security;
alter table public.user_profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.admin_users enable row level security;
alter table public.steward_waitlist enable row level security;
alter table public.vnb_stewards enable row level security;
alter table public.steward_referral_codes enable row level security;
alter table public.steward_payouts enable row level security;
alter table public.steward_commissions enable row level security;
alter table public.steward_milestone_definitions enable row level security;
alter table public.steward_milestone_awards enable row level security;
alter table public.steward_reward_ledger enable row level security;

-- Public read catalog
create policy "public read active categories" on public.categories
for select using (is_active = true);

create policy "public read active products" on public.products
for select using (is_active = true);

create policy "public read product images" on public.product_images
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.is_active = true
  )
);

create policy "public read product colors" on public.product_colors
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_colors.product_id and p.is_active = true
  )
);

create policy "public read product sizes" on public.product_sizes
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_sizes.product_id and p.is_active = true
  )
);

create policy "public read product details" on public.product_details
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_details.product_id and p.is_active = true
  )
);

-- Public inserts for lead capture
create policy "public insert newsletters" on public.newsletters
for insert with check (true);

create policy "public insert contact_messages" on public.contact_messages
for insert with check (true);

create policy "public insert investment_inquiries" on public.investment_inquiries
for insert with check (true);

create policy "public insert steward_waitlist" on public.steward_waitlist
for insert with check (true);

create policy "public read active steward milestones" on public.steward_milestone_definitions
for select using (is_active = true);

-- User profile and own commerce records
create policy "users read own profile" on public.user_profiles
for select using (auth.uid() = user_id);
create policy "users update own profile" on public.user_profiles
for update using (auth.uid() = user_id);
create policy "users insert own profile" on public.user_profiles
for insert with check (auth.uid() = user_id);

create policy "users read own carts" on public.carts
for select using (auth.uid() = user_id);
create policy "users manage own carts" on public.carts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read own cart_items" on public.cart_items
for select using (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
);
create policy "users manage own cart_items" on public.cart_items
for all using (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
);

create policy "users read own orders" on public.orders
for select using (auth.uid() = user_id);

create policy "users read own order_items" on public.order_items
for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

create policy "users read own payment_attempts" on public.payment_attempts
for select using (auth.uid() = user_id);

create policy "stewards read own steward profile" on public.vnb_stewards
for select using (auth.uid() = user_id);

create policy "stewards read own referral codes" on public.steward_referral_codes
for select using (auth.uid() = steward_id);

create policy "stewards read own payouts" on public.steward_payouts
for select using (auth.uid() = steward_id);

create policy "stewards read own commissions" on public.steward_commissions
for select using (auth.uid() = steward_id);

create policy "stewards read own milestone awards" on public.steward_milestone_awards
for select using (auth.uid() = steward_id);

create policy "stewards read own reward ledger" on public.steward_reward_ledger
for select using (auth.uid() = steward_id);

-- Admin policies
create policy "admins full categories" on public.categories
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full products" on public.products
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full product_images" on public.product_images
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full product_colors" on public.product_colors
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full product_sizes" on public.product_sizes
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full product_details" on public.product_details
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full newsletters" on public.newsletters
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full contact_messages" on public.contact_messages
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full investment_inquiries" on public.investment_inquiries
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full user_profiles" on public.user_profiles
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full carts" on public.carts
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full cart_items" on public.cart_items
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full orders" on public.orders
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full order_items" on public.order_items
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full payment_attempts" on public.payment_attempts
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full admin_users" on public.admin_users
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "admins full steward_waitlist" on public.steward_waitlist
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full vnb_stewards" on public.vnb_stewards
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_referral_codes" on public.steward_referral_codes
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_payouts" on public.steward_payouts
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_commissions" on public.steward_commissions
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_milestone_definitions" on public.steward_milestone_definitions
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_milestone_awards" on public.steward_milestone_awards
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admins full steward_reward_ledger" on public.steward_reward_ledger
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.steward_milestone_definitions (slug, name, description, measurement_window, required_successful_orders, reward_type, reward_value, is_active)
values
  ('weekly-5-sales', '5 Weekly Sales', 'Recognition inside the VNB Steward community for five successful attributed purchases in a week.', 'weekly', 5, 'recognition', 'community-recognition', true),
  ('weekly-10-sales', '10 Weekly Sales', 'Eligibility for a product reward after ten successful attributed purchases in a week.', 'weekly', 10, 'free_product', 'product-reward', true),
  ('weekly-20-sales', '20 Weekly Sales', 'Exclusive brand merchandise and ambassador review after twenty successful attributed purchases in a week.', 'weekly', 20, 'merchandise', 'exclusive-merchandise', true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  measurement_window = excluded.measurement_window,
  required_successful_orders = excluded.required_successful_orders,
  reward_type = excluded.reward_type,
  reward_value = excluded.reward_value,
  is_active = excluded.is_active;

create or replace function public.resolve_active_steward_referral_code(p_code text)
returns table (
  steward_id uuid,
  code text,
  display_name text,
  commission_tier text,
  commission_rate numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.user_id,
    rc.code,
    s.display_name,
    s.commission_tier,
    s.commission_rate
  from public.steward_referral_codes rc
  join public.vnb_stewards s on s.user_id = rc.steward_id
  where rc.code = public.normalize_referral_code(p_code)
    and rc.status = 'active'
    and s.status = 'active'
  limit 1;
$$;

create or replace function public.finalize_payment_attempt(
  p_reference text,
  p_paystack_status text default '',
  p_verified_at timestamptz default public.now_utc()
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.payment_attempts%rowtype;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_commission_rate numeric(5, 4);
begin
  select *
  into v_attempt
  from public.payment_attempts
  where reference = p_reference
  for update;

  if not found then
    raise exception 'Payment reference not found.';
  end if;

  if v_attempt.order_id is not null then
    select * into v_order from public.orders where id = v_attempt.order_id;
    return v_order;
  end if;

  insert into public.orders (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    address,
    city,
    state,
    zip_code,
    country,
    subtotal,
    shipping,
    tax,
    total,
    status,
    payment_provider,
    payment_reference,
    payment_currency,
    payment_status,
    paid_at,
    notes,
    steward_id,
    referral_code,
    referral_snapshot,
    commissionable_subtotal
  )
  values (
    v_attempt.user_id,
    v_attempt.email,
    v_attempt.first_name,
    v_attempt.last_name,
    v_attempt.phone,
    v_attempt.address,
    v_attempt.city,
    v_attempt.state,
    v_attempt.zip_code,
    v_attempt.country,
    v_attempt.subtotal,
    v_attempt.shipping,
    v_attempt.tax,
    v_attempt.total,
    'processing',
    'paystack',
    v_attempt.reference,
    v_attempt.currency,
    'paid',
    coalesce(p_verified_at, public.now_utc()),
    v_attempt.notes,
    v_attempt.steward_id,
    v_attempt.referral_code,
    v_attempt.referral_snapshot,
    v_attempt.subtotal
  )
  returning * into v_order;

  for v_item in
    select * from jsonb_array_elements(v_attempt.cart_snapshot)
  loop
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);

    select *
    into v_product
    from public.products
    where id = (v_item ->> 'product_id')::bigint
      and is_active = true
    for update;

    if not found then
      raise exception 'Product no longer exists for reference %.', p_reference;
    end if;

    if v_quantity <= 0 then
      raise exception 'Invalid quantity supplied for product %.', v_product.name;
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'Insufficient stock for %.', v_product.name;
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_sku,
      quantity,
      size,
      color,
      price,
      subtotal
    )
    values (
      v_order.id,
      v_product.id,
      coalesce(v_item ->> 'product_name', v_product.name),
      coalesce(v_item ->> 'product_sku', coalesce(v_product.sku, '')),
      v_quantity,
      coalesce(v_item ->> 'size', ''),
      coalesce(v_item ->> 'color', ''),
      (v_item ->> 'price')::numeric,
      (v_item ->> 'subtotal')::numeric
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product.id;
  end loop;

  if v_attempt.steward_id is not null and exists (
    select 1
    from public.vnb_stewards s
    where s.user_id = v_attempt.steward_id
      and s.status = 'active'
  ) then
    v_commission_rate := coalesce(
      nullif(v_attempt.referral_snapshot ->> 'commission_rate', '')::numeric,
      (select s.commission_rate from public.vnb_stewards s where s.user_id = v_attempt.steward_id),
      0.1000
    );

    insert into public.steward_commissions (
      steward_id,
      order_id,
      referral_code,
      basis_amount,
      commission_rate,
      commission_amount,
      status
    )
    values (
      v_attempt.steward_id,
      v_order.id,
      v_attempt.referral_code,
      v_attempt.subtotal,
      v_commission_rate,
      round(v_attempt.subtotal * v_commission_rate, 2),
      'pending'
    )
    on conflict (order_id) do nothing;
  end if;

  update public.payment_attempts
  set
    order_id = v_order.id,
    status = 'success',
    paystack_status = coalesce(nullif(p_paystack_status, ''), paystack_status),
    verified_at = coalesce(p_verified_at, public.now_utc())
  where id = v_attempt.id;

  return v_order;
end;
$$;
