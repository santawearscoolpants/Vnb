# VNB Launch Checklist

> This checklist is based on the current codebase as of April 4, 2026.

## Already In Place

- [x] Storefront reads catalog and customer data from Supabase.
- [x] Customer sign up, sign in, sign out, and password reset are wired.
- [x] Cart is persistent in local storage.
- [x] Checkout initializes Paystack through the Cloudflare Worker.
- [x] Payment callback verifies Paystack and creates orders through Supabase.
- [x] Admin panel is liveable for product, order, message, and media management.
- [x] Worker and R2 architecture exists for `api.vnbway.com` and `media.vnbway.com`.
- [x] Steward referral attribution, commission schema, payout schema, and milestone schema are scaffolded.
- [x] Manual QA checklist exists for desktop/mobile/payment-callback recovery.
- [x] Smoke harness exists for auth, checkout init, payment callback behavior, and admin login guards (`npm run smoke`).

## Must Finish Before A Serious Public Launch

- [x] Replace the custom in-memory router with canonical path routing.
- [x] Build Terms, Privacy, Legal Notices, Sitemap, and Accessibility pages.
- [x] Replace footer placeholder link toasts with real pages or remove dead links.
- [x] Add transactional emails for order confirmation and shipping/order-status updates.
- [x] Review and implement the real shipping policy.
- [x] Review and implement the real tax policy instead of the fixed `8%` placeholder logic.
- [ ] Run full checkout QA for success, cancellation, duplicate callback, and failed verification flows.
- [x] Decide whether the investment page is public-ready. If not, hide it until the numbers are real.
- [x] Remove or implement wishlist UI so it is not fake interaction.
- [x] Build the public VNB Steward waitlist/join flow.
- [x] Build first-pass steward/admin operations for steward activation, code management, commission review, and steward reporting.
- [x] Add a stricter approval workflow, fraud/returns hold logic, and payout batching for bi-weekly steward payouts.
- [x] Add baseline automated tests for routing helpers (`npm test` with Vitest).

## Should Finish Soon After Launch

- [x] Add automated smoke tests for auth, checkout, payment callback, and admin login.
- [ ] Add admin workflow support for fulfillment communication, not just order status edits.
- [x] Add steward-facing reporting or portal views for code performance, commissions, and payouts.
- [x] Improve SEO baseline beyond client-side meta updates (path URLs + sitemap + robots + canonical URL consistency).
- [x] Add a real order tracking/status communication flow.
- [ ] Reduce bundle size and split large frontend chunks.

## Optional But Valuable Polish

- [ ] Saved wishlist across sessions and devices.
- [ ] Saved payment methods if the business really needs them.
- [ ] Richer category filtering and sorting.
- [x] Better investor/admin reporting dashboards.
- [ ] Dedicated content pages for stores, repairs, personalization, careers, sustainability, and brand stories.

## My Definition Of “Complete”

The site feels complete when:

- [ ] a customer can discover products, check out, get confirmation, and track order progress without confusion
- [ ] an admin can manage catalog, media, and orders without developer help
- [ ] every visible page and footer link resolves to a real destination
- [ ] every legal, payment, and investor-facing claim is truthful and current
- [ ] the core revenue path is tested and monitored
