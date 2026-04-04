# Supabase Migration Plan (VNB)

This repo now includes:

- `supabase/schema.sql` -> schema snapshot (use numbered scripts below as source of truth for latest rollout)
- `supabase/01_core.sql` -> core tables/functions/triggers (run first)
- `supabase/02_rls.sql` -> RLS + policies, rerun-safe with `drop policy if exists`
- `supabase/03_checkout.sql` -> payment finalization RPC for Worker-driven checkout
- `supabase/04_affiliates.sql` -> VNB Steward waitlist, referral, commission, payout, and milestone module
- `supabase/05_steward_applications.sql` -> steward application workflow + invite-code validation RPC
- `supabase/06_ops_reporting.sql` -> steward ops hardening + investor reporting snapshots/RPCs
- `supabase/07_order_tracking.sql` -> order tracking fields for carrier, tracking number/url, and fulfillment timestamps
- `admin-panel/` -> deployable admin website for `admin.vnbway.com`

## Immediate goal achieved

You no longer need the previous backend/admin stack for day-to-day operations.
Use the admin site + Supabase dashboard for auth/user management.

## Migration steps

1. Create Supabase project
2. Run `supabase/01_core.sql`
3. Run `supabase/02_rls.sql`
4. Run `supabase/03_checkout.sql`
5. Run `supabase/04_affiliates.sql`
6. Run `supabase/05_steward_applications.sql`
7. Run `supabase/06_ops_reporting.sql`
8. Run `supabase/07_order_tracking.sql`
9. Create an auth admin user
10. Insert that user into `public.admin_users`
11. Configure and deploy `admin-panel/` to `admin.vnbway.com`
12. Import your legacy catalog/order/customer data into Supabase tables

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

Your customer frontend now uses:

- direct Supabase queries for catalog/auth/profile/forms/orders
- a Cloudflare Worker for checkout/payment/media secure actions
- steward referral capture via URL + checkout attribution

Recommended order:

1. read-only catalog endpoints (categories/products)
2. contact/newsletter/investment inserts
3. auth/session swap to Supabase Auth
4. Worker-driven checkout and Paystack verification

## Hosting notes

- `admin.vnbway.com` can be static hosting (Hostinger/Netlify/Vercel)
- main storefront can remain where it is
- no VPS needed for admin panel
