# VNB Launch Checklist

> This checklist is based on the current codebase as of April 3, 2026.

## Already In Place

- [x] Storefront reads catalog and customer data from Supabase.
- [x] Customer sign up, sign in, sign out, and password reset are wired.
- [x] Cart is persistent in local storage.
- [x] Checkout initializes Paystack through the Cloudflare Worker.
- [x] Payment callback verifies Paystack and creates orders through Supabase.
- [x] Admin panel is liveable for product, order, message, and media management.
- [x] Worker and R2 architecture exists for `api.vnbway.com` and `media.vnbway.com`.

## Must Finish Before A Serious Public Launch

- [ ] Replace the custom in-memory router with URL-backed routing.
- [ ] Build Terms, Privacy, Legal Notices, Sitemap, and Accessibility pages.
- [ ] Replace footer placeholder toasts with real pages or remove the dead links.
- [ ] Add transactional emails for order confirmation and shipping/order-status updates.
- [ ] Review and implement the real shipping policy.
- [ ] Review and implement the real tax policy instead of the fixed `8%` placeholder logic.
- [ ] Run full checkout QA for success, cancellation, duplicate callback, and failed verification flows.
- [ ] Decide whether the investment page is public-ready. If not, hide it until the numbers are real.
- [ ] Remove or implement wishlist UI so it is not fake interaction.

## Should Finish Soon After Launch

- [ ] Add automated smoke tests for auth, checkout, payment callback, and admin login.
- [ ] Add admin workflow support for fulfillment communication, not just order status edits.
- [ ] Improve SEO beyond client-side meta updates.
- [ ] Add a real order tracking/status communication flow.
- [ ] Reduce bundle size and split large frontend chunks.

## Optional But Valuable Polish

- [ ] Saved wishlist across sessions and devices.
- [ ] Saved payment methods if the business really needs them.
- [ ] Richer category filtering and sorting.
- [ ] Better investor/admin reporting dashboards.
- [ ] Dedicated content pages for stores, repairs, personalization, careers, sustainability, and brand stories.

## My Definition Of “Complete”

The site feels complete when:

- [ ] a customer can discover products, check out, get confirmation, and track order progress without confusion
- [ ] an admin can manage catalog, media, and orders without developer help
- [ ] every visible page and footer link resolves to a real destination
- [ ] every legal, payment, and investor-facing claim is truthful and current
- [ ] the core revenue path is tested and monitored
