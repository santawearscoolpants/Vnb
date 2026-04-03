# Vines & Branches - Luxury E-commerce Platform

This repository is now oriented around a low-cost production setup:

- `www.vnbway.com` on Hostinger
- `admin.vnbway.com` on Hostinger
- `api.vnbway.com` on Cloudflare Workers
- `media.vnbway.com` on Cloudflare R2
- catalog, orders, and auth on Supabase

## Features

### Storefront
- React + TypeScript + Vite frontend
- product catalog, categories, search, and product detail pages
- local cart with checkout flow
- customer account, profile, and order history
- newsletter, contact, and investment forms

### Platform
- Supabase for Postgres, auth, and row-level security
- Cloudflare Worker for Paystack checkout, verification, webhooks, and secure actions
- Cloudflare R2 for product media
- static admin panel for product and order management

## Quick Start

### Prerequisites
- Node.js 18+
- a Supabase project
- a Cloudflare account for Workers + R2

### Frontend
```bash
npm install
cp .env.example .env
npm run dev
```

Set these in `.env`:

```env
VITE_API_URL=https://api.vnbway.com
VITE_MEDIA_URL=https://media.vnbway.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```text
├── admin-panel/          # Static admin app hosted on Hostinger
├── cloudflare/worker/    # Worker backend for payments and uploads
├── src/                  # React storefront
├── supabase/             # Schema, RLS, and checkout SQL
└── package.json          # Frontend dependencies
```

## Documentation

- [HOSTINGER_CLOUDFLARE_SUPABASE_MIGRATION.md](HOSTINGER_CLOUDFLARE_SUPABASE_MIGRATION.md)
- [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md)
- [cloudflare/worker/README.md](cloudflare/worker/README.md)
- [admin-panel/README.md](admin-panel/README.md)

## Production Notes

- Hostinger continues serving the storefront and admin panel.
- Supabase is the source of truth for application data.
- The Worker is the only place that should hold Paystack and service-role secrets.
- Images should live in R2, with only URLs stored in the database.

## Building

```bash
npm run build
```

## Support

Original design: https://www.figma.com/design/yEQRJL1JxCwhZDgKncQYdu/E-commerce-Motion-Landing-Page

## License

All rights reserved - Vines & Branches 2025
