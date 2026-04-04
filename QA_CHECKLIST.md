# VNB QA Checklist

> Manual verification checklist for launch readiness.

## Desktop Smoke

- [ ] Home page loads, navigation works, and all top-level links open real pages.
- [ ] Search opens and can navigate to a product detail page.
- [ ] Category page loads products and product detail page supports size/color selection.
- [ ] Cart add/update/remove works and totals update correctly.
- [ ] Checkout validates required fields and blocks invalid steward code submissions.
- [ ] Checkout quote updates shipping/tax when country changes.
- [ ] Payment callback page handles `success`, `cancelled`, and invalid/missing reference states.
- [ ] Order confirmation page renders order number, email, and totals.
- [ ] Account dashboard tabs load (`orders`, `addresses`, `payments`, `steward`, `profile`).

## Mobile Smoke

- [ ] Navigation menu opens/closes correctly on small screens.
- [ ] Category/product cards are readable and tappable without overlap.
- [ ] Checkout form fields are usable and not clipped.
- [ ] Footer links remain accessible and route correctly.
- [ ] Steward page sections are readable with no overflow or crammed layout.

## Payment State QA

- [ ] Success path: complete one Paystack test payment and confirm order row + order items + payment attempt status.
- [ ] Cancel path: cancel at Paystack and confirm callback route shows cancelled state without creating an order.
- [ ] Failed verification path: force invalid reference verify call and confirm graceful error handling.
- [ ] Duplicate callback path: call verify twice for same successful reference and confirm idempotent order handling.

## Admin QA

- [ ] Admin login works only for users in `admin_users`.
- [ ] Orders status update works and triggers status email when configured.
- [ ] Product/category CRUD works, including media upload to Worker/R2.
- [ ] Steward waitlist, steward profile updates, commission updates, payout updates all work.
- [ ] Steward ops buttons work: auto-approve, reconciliation, milestone issuance, payout batching.
- [ ] Investor snapshot capture works and updates Invest metrics source data.

## Recovery / Regression

- [ ] Refresh on path routes (`/stewards`, `/account/dashboard`, `/payment-callback`) does not 404 on Hostinger.
- [ ] Callback URL (`/payment-callback?payment_callback=1...`) remains reachable after deploy.
- [ ] `robots.txt` and `sitemap.xml` are publicly accessible.
- [ ] Build deploy keeps current JS/CSS asset references in `index.html`.
