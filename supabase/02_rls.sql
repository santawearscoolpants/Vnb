-- VNB Supabase schema (RLS + policies)
-- Run after 01_core.sql
-- Safe to rerun.

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

-- Public read catalog
drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories
for select using (is_active = true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
for select using (is_active = true);

drop policy if exists "public read product images" on public.product_images;
create policy "public read product images" on public.product_images
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.is_active = true
  )
);

drop policy if exists "public read product colors" on public.product_colors;
create policy "public read product colors" on public.product_colors
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_colors.product_id and p.is_active = true
  )
);

drop policy if exists "public read product sizes" on public.product_sizes;
create policy "public read product sizes" on public.product_sizes
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_sizes.product_id and p.is_active = true
  )
);

drop policy if exists "public read product details" on public.product_details;
create policy "public read product details" on public.product_details
for select using (
  exists (
    select 1 from public.products p
    where p.id = product_details.product_id and p.is_active = true
  )
);

-- Public lead capture inserts
drop policy if exists "public insert newsletters" on public.newsletters;
create policy "public insert newsletters" on public.newsletters
for insert with check (true);

drop policy if exists "public insert contact_messages" on public.contact_messages;
create policy "public insert contact_messages" on public.contact_messages
for insert with check (true);

drop policy if exists "public insert investment_inquiries" on public.investment_inquiries;
create policy "public insert investment_inquiries" on public.investment_inquiries
for insert with check (true);

-- User self-access policies
drop policy if exists "users read own profile" on public.user_profiles;
create policy "users read own profile" on public.user_profiles
for select using (auth.uid() = user_id);

drop policy if exists "users update own profile" on public.user_profiles;
create policy "users update own profile" on public.user_profiles
for update using (auth.uid() = user_id);

drop policy if exists "users insert own profile" on public.user_profiles;
create policy "users insert own profile" on public.user_profiles
for insert with check (auth.uid() = user_id);

drop policy if exists "users read own carts" on public.carts;
create policy "users read own carts" on public.carts
for select using (auth.uid() = user_id);

drop policy if exists "users manage own carts" on public.carts;
create policy "users manage own carts" on public.carts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users read own cart_items" on public.cart_items;
create policy "users read own cart_items" on public.cart_items
for select using (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
);

drop policy if exists "users manage own cart_items" on public.cart_items;
create policy "users manage own cart_items" on public.cart_items
for all using (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
);

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders
for select using (auth.uid() = user_id);

drop policy if exists "users read own order_items" on public.order_items;
create policy "users read own order_items" on public.order_items
for select using (
  exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

drop policy if exists "users read own payment_attempts" on public.payment_attempts;
create policy "users read own payment_attempts" on public.payment_attempts
for select using (auth.uid() = user_id);

-- Admin policies
drop policy if exists "admins full categories" on public.categories;
create policy "admins full categories" on public.categories
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full products" on public.products;
create policy "admins full products" on public.products
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full product_images" on public.product_images;
create policy "admins full product_images" on public.product_images
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full product_colors" on public.product_colors;
create policy "admins full product_colors" on public.product_colors
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full product_sizes" on public.product_sizes;
create policy "admins full product_sizes" on public.product_sizes
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full product_details" on public.product_details;
create policy "admins full product_details" on public.product_details
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full newsletters" on public.newsletters;
create policy "admins full newsletters" on public.newsletters
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full contact_messages" on public.contact_messages;
create policy "admins full contact_messages" on public.contact_messages
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full investment_inquiries" on public.investment_inquiries;
create policy "admins full investment_inquiries" on public.investment_inquiries
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full user_profiles" on public.user_profiles;
create policy "admins full user_profiles" on public.user_profiles
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full carts" on public.carts;
create policy "admins full carts" on public.carts
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full cart_items" on public.cart_items;
create policy "admins full cart_items" on public.cart_items
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full orders" on public.orders;
create policy "admins full orders" on public.orders
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full order_items" on public.order_items;
create policy "admins full order_items" on public.order_items
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full payment_attempts" on public.payment_attempts;
create policy "admins full payment_attempts" on public.payment_attempts
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admins full admin_users" on public.admin_users;
create policy "admins full admin_users" on public.admin_users
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
