# VNB — Verified Status And Roadmap

> Status verified against the codebase on April 3, 2026.

This file is intentionally stricter than a hype roadmap. It reflects what is actually implemented in `src/`, `admin-panel/`, `cloudflare/worker/`, and `supabase/`.

## Verified Working Now

### Storefront
- [x] Home page, category pages, product detail pages, search dialog, cart, checkout, payment callback, and order confirmation all exist in the React app.
- [x] Catalog data is read from Supabase through [src/services/api.ts](/Users/solideogloria/development/Websites/Vnb/src/services/api.ts).
- [x] Cart is local-storage based through [src/context/CartContext.tsx](/Users/solideogloria/development/Websites/Vnb/src/context/CartContext.tsx).
- [x] Product detail pages support gallery images, stock messaging, size selection, image zoom, add-to-cart, and buy-now flow.
- [x] Newsletter, contact, and investment inquiry forms submit data to Supabase.

### Customer Accounts
- [x] Sign up, sign in, sign out, password reset request, and password update are wired to Supabase Auth.
- [x] Auth state persists across refresh through [src/context/AuthContext.tsx](/Users/solideogloria/development/Websites/Vnb/src/context/AuthContext.tsx).
- [x] Account dashboard shows order history, profile editing, and address editing.
- [x] Customer orders are read from Supabase with `order_items` included.

### Payments And Orders
- [x] Checkout initializes Paystack through the Cloudflare Worker.
- [x] Payment callback verifies Paystack through the Worker and converts successful attempts into orders.
- [x] Supabase checkout finalization exists in [supabase/03_checkout.sql](/Users/solideogloria/development/Websites/Vnb/supabase/03_checkout.sql).
- [x] Admin panel can review orders and payment attempts.

### Admin And Operations
- [x] Admin panel signs in with Supabase Auth and checks `admin_users`.
- [x] Admin panel supports category CRUD, product CRUD, order status edits, message/investment/newsletter review, and inline product image/color/size/detail management.
- [x] Admin panel uploads media to R2 through the Worker and writes returned URLs into forms.
- [x] Steward program schema, referral attribution plumbing, and commission ledger foundation exist.

### Brand And Marketing
- [x] Currency switching, exchange-rate loading, and geo-based currency prompt exist.
- [x] English and French translation support exists.
- [x] Client-side page meta updates and GA page-view tracking exist.
- [x] Footer links now route to real content pages (legal + service/about information pages), not toast-only dead ends.

## Partial Or Misleading Today

These areas exist, but they are not complete enough to describe as fully finished.

- [ ] Routing is still custom in-memory state in [src/context/RouterContext.tsx](/Users/solideogloria/development/Websites/Vnb/src/context/RouterContext.tsx), not real URL-backed routing.
- [ ] SEO is only partially addressed. Meta tags are client-side only, and deep links are weak because routing is not URL-native.
- [ ] Shipping and tax are simplistic. The Worker currently uses `shipping = 0` and a fixed `tax = 8%`.
- [ ] The dashboard payments tab is mostly placeholder UI. It does not manage real saved payment methods.
- [ ] The investor page and generated investor deck use hardcoded metrics and narrative claims, not live business data.
- [ ] The Steward program now has a public waitlist page, a steward dashboard tab, and basic admin stewardship tools, but approval workflow depth, payout batching, and fraud/returns handling are still incomplete.
- [ ] Several non-footer interactions still use placeholder toasts (for example live chat/social prompts) and should be converted to real destinations as the product scope matures.
- [ ] Wishlist hearts are local UI state only. There is no real wishlist model or persistence.
- [ ] The storefront says confirmation and shipping emails will happen, but there is no current transactional email pipeline in the Worker or frontend repo.
- [ ] There is no automated test suite covering checkout, auth, admin CRUD, or payment callback.

## Launch-Critical Next Steps

If the goal is a credible public launch, this is the order I would use.

### 1. Trust And Navigation
- [ ] Replace the custom router with URL-backed routing so refresh, deep linking, and analytics are reliable.
- [x] Build real legal pages and wire footer links to actual routes.
- [x] Remove or replace footer/service/about placeholder link toasts with real pages.

### 2. Commerce Reliability
- [ ] Review shipping and tax rules and encode the real business policy in the Worker and order records.
- [ ] Add transactional emails for order confirmation and fulfillment updates.
- [ ] Test the three core payment states end to end: success, cancelled, and failed verification.
- [ ] Decide whether the dashboard “Payments” tab should become real saved methods functionality or be removed from the account area for now.
- [ ] Tighten steward payout operations, commission review workflow, steward activation workflow, and milestone issuance workflow on top of the new ledger tables.

### 3. Brand Honesty
- [ ] Replace investor metrics and deck claims with real numbers, or hide the investment page until the business data is defensible.
- [ ] Audit every user-facing promise in copy against what the platform actually does today.

### 4. Engineering Hardening
- [ ] Add automated smoke tests for sign up, sign in, checkout init, payment callback, and admin login.
- [ ] Add a small QA checklist for mobile, desktop, and payment callback recovery.
- [ ] Trim obviously unused dependencies like `next` from the Vite app unless there is a near-term plan to use them.

## What “Complete” Should Mean For This Website

A complete VNB website should not just look polished. It should satisfy these conditions:

- [ ] Every visible navigation item leads to a real page, not a toast or placeholder.
- [ ] Every commerce promise is backed by working operations: payment verification, order creation, order emails, and order-status updates.
- [ ] Every important page has a stable URL and survives refresh/share/back navigation cleanly.
- [ ] Every customer-facing number on the investment page and deck is real, current, and defensible.
- [ ] Every critical flow has at least smoke-test coverage and a manual QA script.
- [ ] The admin team can manage products, orders, and media without touching the database directly.
- [ ] The steward team can review waitlist entries, activate stewards, rotate codes, review commissions, and manage payouts without raw SQL or manual data cleanup.
- [ ] The storefront copy, account dashboard, and footer do not claim features that are not actually implemented.
