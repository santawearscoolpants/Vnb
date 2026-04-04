# VNB Migration Plan

Target architecture:

- `www.vnbway.com` -> Hostinger
- `admin.vnbway.com` -> Hostinger
- `api.vnbway.com` -> Cloudflare Worker
- `media.vnbway.com` -> Cloudflare R2 custom domain
- `db/auth` -> Supabase

## What changed in this repo

- Frontend catalog/auth/profile/forms now read and write through Supabase.
- Storefront cart is now local browser storage, not server session storage.
- Checkout and payment verification are designed to go through the Cloudflare Worker.
- R2 is the target media host via `VITE_MEDIA_URL`.
- Supabase checkout finalization is handled by `supabase/03_checkout.sql`.

## DNS

Move DNS control for `vnbway.com` to Cloudflare, but keep Hostinger as the origin for:

- `www`
- `admin`

Add:

- `api` -> Cloudflare Worker custom domain
- `media` -> R2 custom domain

## Frontend env

Set these in your Hostinger frontend deployment:

```env
VITE_API_URL=https://api.vnbway.com
VITE_MEDIA_URL=https://media.vnbway.com
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

If you use Apache/Hostinger static hosting, keep the SPA fallback rewrite (`.htaccess`) so path routes like `/stewards` and `/account/dashboard` load `index.html` on refresh.

## Supabase

Run, in order:

1. `supabase/01_core.sql`
2. `supabase/02_rls.sql`
3. `supabase/03_checkout.sql`
4. `supabase/04_affiliates.sql`
5. `supabase/05_steward_applications.sql`
6. `supabase/06_ops_reporting.sql`
7. `supabase/07_order_tracking.sql`
7. `supabase/07_order_tracking.sql`

Then import your existing product/order/customer data.

## Worker secrets and vars

Configure these in Cloudflare:

```env
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_SECRET_KEY
PAYSTACK_BASE_URL=https://api.paystack.co
PAYSTACK_CURRENCY=GHS
PAYSTACK_CHANNELS=card,mobile_money,bank_transfer
PAYSTACK_CALLBACK_URL=https://www.vnbway.com/payment-callback?payment_callback=1
FRONTEND_ORIGIN=https://www.vnbway.com
ALLOWED_ORIGINS=https://www.vnbway.com,https://admin.vnbway.com
MEDIA_BASE_URL=https://media.vnbway.com
```

Bind:

- `MEDIA_BUCKET` -> your `vnbway-media` R2 bucket

## Admin panel

The current admin panel writes product/category records to Supabase and uploads media through:

- `POST https://api.vnbway.com/media/upload`

with an authenticated admin session bearer token.

## Safe cutover order

1. Create Supabase project and run the SQL scripts.
2. Create Cloudflare Worker and R2 bucket.
3. Put the Worker on `api.vnbway.com`.
4. Put R2 on `media.vnbway.com`.
5. Upload product images to R2 and update `image_url` values.
6. Set frontend env vars on Hostinger.
7. Rebuild and redeploy the storefront.
8. Test:
   - login/register
   - product pages
   - cart
   - checkout init
   - Paystack callback
   - order history
