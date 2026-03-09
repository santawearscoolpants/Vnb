# Supabase Migration Plan (VNB)

This repo now includes:

- `supabase/schema.sql` -> complete database schema + RLS policies
- `supabase/01_core.sql` -> core tables/functions/triggers (run first)
- `supabase/02_rls.sql` -> RLS + policies, rerun-safe with `drop policy if exists`
- `admin-panel/` -> deployable admin website for `admin.vnbway.com`

## Immediate goal achieved

You no longer need Django admin for day-to-day operations.
Use the admin site + Supabase dashboard for auth/user management.

## Migration steps

1. Create Supabase project
2. Run `supabase/01_core.sql`
3. Run `supabase/02_rls.sql`
4. Create an auth admin user
5. Insert that user into `public.admin_users`
6. Configure and deploy `admin-panel/` to `admin.vnbway.com`
7. Export Django data and import into Supabase tables

## Data import order

Import in this order to satisfy foreign keys:

1. `categories`
2. `products`
3. `product_images`, `product_colors`, `product_sizes`, `product_details`
4. `newsletters`, `contact_messages`, `investment_inquiries`
5. `orders`
6. `order_items`
7. `payment_attempts`

## Frontend cutover (storefront)

Your customer frontend still calls Django right now.
Next step is replacing `src/services/api.ts` with Supabase queries.

Recommended order:

1. read-only catalog endpoints (categories/products)
2. contact/newsletter/investment inserts
3. auth/session swap to Supabase Auth
4. cart/order/payment flows (edge functions for Paystack verification)

## Hosting notes

- `admin.vnbway.com` can be static hosting (Hostinger/Netlify/Vercel)
- main storefront can remain where it is
- no VPS needed for admin panel
