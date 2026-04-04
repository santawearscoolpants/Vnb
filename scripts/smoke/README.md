# Smoke Test Harness

Run the production/staging smoke checks:

```bash
npm run smoke
```

Required environment variables:

```env
SMOKE_FRONTEND_URL=https://www.vnbway.com
SMOKE_API_URL=https://api.vnbway.com
SMOKE_SUPABASE_URL=https://your-project-ref.supabase.co
SMOKE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional variables for deeper checks:

```env
SMOKE_CHECKOUT_PRODUCT_ID=1
SMOKE_ADMIN_EMAIL=admin@your-domain.com
SMOKE_ADMIN_PASSWORD=your-admin-password
```

What it validates:

- Storefront and Worker health endpoints are reachable
- Customer sign-up and sign-in work through Supabase Auth
- Checkout init works (when product id is supplied)
- Payment callback invalid-reference behavior is handled
- Admin sign-in and Worker admin auth guard work (when admin creds are supplied)

Notes:

- The paid-success callback state still requires one manual Paystack sandbox payment.
- Use test/sandbox credentials only for smoke runs.
