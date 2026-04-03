-- VNB checkout finalization helpers
-- Run after 01_core.sql and 02_rls.sql

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
    notes
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
    v_attempt.notes
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
