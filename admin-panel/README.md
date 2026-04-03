# VNB Admin Panel (Supabase)

This folder is a standalone admin website you can deploy to `admin.vnbway.com`.

## What this gives you

- Email/password admin login via Supabase Auth
- Admin-only access check via `admin_users` table
- **Categories:** create, list, edit (name, slug, description, image_url, is_active), activate/deactivate, delete
- **Products:** create, list, edit (name, slug, sku, category, price, stock, image_url, description, is_active, is_featured), and in **Edit product**: manage **images** (add/delete, alt text, primary, order), **colors** (name, hex, available), **sizes** (size, available), **details** (bullet points with order); activate/deactivate, feature/unfeature, delete
- **Orders:** list, edit status + payment status, **View** (order items + shipping address)
- **Payment attempts:** read-only list (reference, email, total, currency, status, Paystack status)
- **Contact messages:** list (with phone), **View** (full message), mark read/unread
- **Investment inquiries:** list (with phone), **View** (full message), mark contacted
- **Newsletter:** list, activate/deactivate

## 1) Set up Supabase schema

1. Open Supabase project
2. SQL Editor: run `supabase/01_core.sql`, then `supabase/02_rls.sql`, then `supabase/03_checkout.sql`

## 2) Create admin user

1. In Supabase Auth, create/sign up your admin account
2. In SQL editor, run:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID');
```

You can find the UUID in `auth.users`.

## 3) Configure admin panel

Inside `admin-panel/`:

1. Copy `config.example.js` to `config.js`
2. Fill:

```js
window.VNB_ADMIN_CONFIG = {
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  API_BASE_URL: 'https://api.vnbway.com', // required for Worker-backed media uploads
};
```

`API_BASE_URL` should point at your Cloudflare Worker. The admin panel now uploads category and product images through `POST /media/upload`, then writes the returned URL into the form field automatically.

## 4) Deploy via GitHub Actions (optional)

A workflow at the repo root (`.github/workflows/deploy-admin-hostinger.yml`) deploys `admin-panel/` to Hostinger on push to `main` when files under `admin-panel/` change, or when run manually. It deploys the folder as-is, including your existing `config.js` (Supabase URL and anon key).

**Secrets to set in the repo (Settings → Secrets and variables → Actions):**

| Secret | Description |
|--------|-------------|
| `ADMIN_HOSTINGER_FTP_USERNAME` | FTP username for Hostinger |
| `ADMIN_HOSTINGER_FTP_PASSWORD` | FTP password for Hostinger |

## 5) Deploy to `admin.vnbway.com` (manual)

Since this is static HTML/CSS/JS, you can host it on:
- Hostinger static hosting
- Netlify
- Vercel

### DNS (Hostinger)

Add a DNS record:
- `admin` -> target hosting provider (CNAME/A record as required)

Result:
- `https://admin.vnbway.com`

## 6) Import legacy data

If you want historical data from your previous backend/export:

1. Export your current PostgreSQL tables to CSV
2. Import into matching Supabase tables:
   - categories, products, product_images, product_colors, product_sizes, product_details
   - newsletters, contact_messages, investment_inquiries
   - orders, order_items, payment_attempts
3. Keep IDs where possible to preserve relationships

## Testing the admin panel locally

1. Copy `config.example.js` to `config.js` and add your Supabase URL + anon key.
2. Serve the folder (e.g. `npx serve -p 3333` in `admin-panel/`).
3. Open `http://localhost:3333`, sign in with an admin user (one that exists in `admin_users`).
4. Test each tab: Dashboard, Categories (create/edit), Products (create/edit), Orders (View + Save), Payments, Contact (View), Invest (View), Newsletter.

### Inputs to test

- **Login:** email (required), password (required).
- **Create category:** name, slug (required), image URL or image upload, description, Active checkbox.
- **Create product:** name, slug, SKU, category (required), price, stock, image URL or image upload, Active, Featured, description (required).
- **Edit product images:** paste a URL or upload a file, then add alt text / primary / order.
- **Edit category / Edit product:** same fields; **Update** saves, **Cancel** hides the form.
- **Orders:** change status and payment dropdowns, click **Save**.
- **Contact / Invest:** click **View** to open the full message in a modal; **Mark read** / **Mark contacted** toggles.
- **Modal:** click backdrop or × to close.

## Common errors and what to do

| What you see | What to do |
|--------------|------------|
| **Missing config** | Copy `config.example.js` to `config.js` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. |
| **You are not in admin_users** | In Supabase SQL Editor: `insert into public.admin_users (user_id) values ('your-auth-user-uuid');` (get UUID from Auth → Users). |
| **Permission denied** or **RLS** on a table | In Supabase, ensure RLS policies allow `admin_users` (e.g. `is_admin(auth.uid())`) to SELECT/INSERT/UPDATE/DELETE on that table. Run `supabase/02_rls.sql` if you haven’t. |
| **payment_attempts** or other table not found | Run the full Supabase schema (`01_core.sql` then `02_rls.sql`). Table names must match: `payment_attempts`, `order_items`, `contact_messages`, `investment_inquiries`, `newsletters`. |
| **Categories/Products dropdown empty** | Create at least one category first; the product form needs a category. |
| **Edit category/product form doesn’t open** | Ensure the Edit button’s row has a valid `id`; check browser console for JS errors. |

## Security notes

- Keep RLS enabled (already in schema)
- Do not use service role key in this admin frontend
- Only users listed in `admin_users` can access data/actions
