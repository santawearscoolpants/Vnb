# VNB Admin Panel (Supabase)

This folder is a standalone admin website you can deploy to `admin.vnbway.com`.

## What this gives you

- Email/password admin login via Supabase Auth
- Admin-only access check via `admin_users` table
- CRUD for:
  - categories
  - products
- Operations management for:
  - orders (status + payment status)
  - contact messages (mark read/unread)
  - investment inquiries (mark contacted)
  - newsletter subscribers (activate/deactivate)

## 1) Set up Supabase schema

1. Open Supabase project
2. SQL Editor
3. Run `supabase/schema.sql`

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
};
```

## 4) Deploy to `admin.vnbway.com`

Since this is static HTML/CSS/JS, you can host it on:
- Hostinger static hosting
- Netlify
- Vercel

### DNS (Hostinger)

Add a DNS record:
- `admin` -> target hosting provider (CNAME/A record as required)

Result:
- `https://admin.vnbway.com`

## 5) Migrate existing Django data

If you want historical data from Django:

1. Export your current PostgreSQL tables to CSV
2. Import into matching Supabase tables:
   - categories, products, product_images, product_colors, product_sizes, product_details
   - newsletters, contact_messages, investment_inquiries
   - orders, order_items, payment_attempts
3. Keep IDs where possible to preserve relationships

## Security notes

- Keep RLS enabled (already in schema)
- Do not use service role key in this admin frontend
- Only users listed in `admin_users` can access data/actions
