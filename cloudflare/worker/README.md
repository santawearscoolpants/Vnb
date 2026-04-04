# VNB Cloudflare Worker

This Worker handles:

- checkout initialization
- checkout quote calculation (shipping + tax policy)
- Paystack verification
- Paystack webhooks
- admin order status updates
- admin-only media uploads to R2
- VNB Steward referral code validation during checkout
- transactional email dispatch (if Resend is configured)

## Routes

- `GET /health`
- `POST /checkout/init`
- `POST /checkout/quote`
- `GET /payments/verify?reference=...`
- `POST /webhooks/paystack`
- `POST /orders/status`
- `POST /media/upload`

## Local setup

1. Copy `.dev.vars.example` to `.dev.vars`
2. Fill in your Supabase and Paystack secrets
3. Install dependencies inside this folder:

```bash
npm install
```

4. Run locally:

```bash
npm run dev
```

## Production

- Attach the Worker to `api.vnbway.com`
- Bind the `MEDIA_BUCKET` R2 bucket
- Set `MEDIA_BASE_URL=https://media.vnbway.com`
- Set `ALLOWED_ORIGINS=https://www.vnbway.com,https://admin.vnbway.com`
- Set `PAYSTACK_CALLBACK_URL=https://www.vnbway.com/payment-callback?payment_callback=1`
- Optional email vars: `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`
- Configure pricing vars for shipping/tax policy (`SHIPPING_*`, `TAX_*`)

## Notes

- Product images should be stored in R2, not in the database.
- The Worker writes orders and payment attempts with the Supabase service role key.
- Steward referral attribution is validated here and persisted to payment attempts before payment completes.
- Customer-facing reads still go directly to Supabase from the frontend.
- Order status updates can be routed through this Worker so customer status emails are sent centrally.
