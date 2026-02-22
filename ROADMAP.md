# VNB — Product Roadmap

> From MVP to Full Product. Status reflects codebase as of Feb 2026.

---

## Phase 1 — MVP (Launch-Ready Core)

### Auth & Accounts
- [x] Wire `AccountPage` login to `api.checkEmail()` and `api.login()` — `emailExists` is hardcoded `false`, login never works
- [x] Wire `CreateAccountPage` submit to `api.register()` — currently just fires a toast, no API call
- [x] Add logged-in user session (store user in context after login)
- [x] Add password reset flow (forgot password page + email trigger)

### Product Data
- [x] Replace hardcoded products in `ProductDetailPage` with real `api.getProduct()` calls
- [x] Replace hardcoded category products in `CategoryPage` with `api.getProducts({ category__slug })` calls
- [x] Replace mock data in `FeaturedCollection`, `SandalsSection`, `ProductCategories` with `api.getFeaturedProducts()` and `api.getCategories()`

### Checkout Flow
- [x] Build `CheckoutPage` — cart already has a 3-step progress indicator (Cart → Checkout → Confirmation) but step 2 doesn't exist
- [x] Build `OrderConfirmationPage` — step 3 of the cart flow
- [x] Wire `api.createOrder()` through the checkout form (method already exists in `api.ts`)

### Navigation
- [ ] Audit `MenuSidebar` and `Navigation` — ensure all links route correctly and cart count reflects `CartContext`
- [ ] Connect `SearchDialog` to `api.getProducts({ search })` — component exists, needs backend wiring

---

## Phase 2 — Post-MVP Polish

### Account Dashboard
- [ ] Build logged-in account dashboard (order history, saved addresses, profile settings)
- [ ] Wire `api.getOrders()` to display past orders
- [ ] Persist auth session across page refreshes (currently all state is in-memory)

### Wishlist / Favorites
- [ ] Heart/favorite button in `CategoryPage` is local state only — build real wishlist backed by user account

### Product Experience
- [ ] Size guide modal on `ProductDetailPage`
- [ ] Real stock/availability display (sold out states, low stock warnings)
- [ ] Product image zoom on hover/click

### Homepage
- [ ] Audit all homepage sections (`BrandStory`, `Newsletter`, `SandalsSection`) for visual completeness
- [ ] Wire newsletter signup to `api.subscribeNewsletter()`

### Contact
- [ ] Review `ContactPage` — confirm it is wired to `api.submitContact()`

---

## Phase 3 — Full Product

### Payments
- [ ] Integrate payment processor (Stripe or Paystack — Paystack recommended for African market) into `CheckoutPage`
- [ ] Make Apple Pay button on `ProductDetailPage` functional (currently a placeholder)

### Investor Page
- [ ] Replace placeholder metrics (350% growth, 50K customers, 15 markets) with real figures before going public
- [ ] Build downloadable investor deck — "Download Investor Deck" button currently does nothing

### Internationalisation
- [ ] Currency switcher — all prices currently in `$`; add GHS/NGN support for African market
- [ ] Multi-language support if targeting Francophone Africa

### SEO & Performance
- [ ] Add per-page meta tags and Open Graph tags (currently a SPA with no per-route meta)
- [ ] Consider SSR (Next.js or Vite SSR) for product and category page SEO
- [ ] Lazy-load images across site — no loading states on most image components

### Analytics & Operations
- [ ] Add analytics (Google Analytics or Plausible)
- [ ] Confirm Django admin covers product/order management, or build admin UI
- [ ] Transactional emails: order confirmation, shipping updates, welcome email on account creation

---

## Known Tech Debt

| Location | Issue |
|---|---|
| ~~`AccountPage`~~ | ~~`emailExists` hardcoded to `false` — login path is completely broken~~ ✓ Fixed |
| ~~`CreateAccountPage`~~ | ~~Form submit doesn't call the API~~ ✓ Fixed |
| ~~`ProductDetailPage`~~ | ~~All product data is hardcoded (4 mock products)~~ ✓ Fixed |
| ~~`CategoryPage`~~ | ~~All category/product data is hardcoded~~ ✓ Fixed |
| ~~`CartPage`~~ | ~~Checkout button leads nowhere — step 2 doesn't exist~~ ✓ Fixed |
| `InvestPage` | "Download Investor Deck" button is a dead link |
| `ContactPage` | Not yet audited |

---

## Shortest Path to Demo-Ready

1. Wire auth (AccountPage + CreateAccountPage → API)
2. Build CheckoutPage + OrderConfirmationPage
3. Connect one real product category from the backend

Everything else is already presentable visually.
