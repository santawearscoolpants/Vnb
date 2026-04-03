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
- [x] Audit `Navigation` — ensure all links route correctly and cart count reflects `CartContext`
- [x] Connect `SearchDialog` to `api.getProducts({ search })` — component exists, needs backend wiring

---

## Phase 2 — Post-MVP Polish

### Account Dashboard
- [x] Build logged-in account dashboard (order history, saved addresses, profile settings)
- [x] Wire `api.getOrders()` to display past orders
- [x] Persist auth session across page refreshes (currently all state is in-memory)

### Product Experience
- [x] Size guide modal on `ProductDetailPage`
- [x] Real stock/availability display (sold out states, low stock warnings)
- [x] Product image zoom on hover/click

### Homepage
- [x] Audit all homepage sections (`BrandStory`, `Newsletter`, `SandalsSection`) for visual completeness
- [x] Wire newsletter signup to `api.subscribeNewsletter()`

### Contact
- [x] Review `ContactPage` — confirm it is wired to `api.submitContact()`

---

## Phase 3 — Full Product

### Payments
- [x] Integrate payment processor (Stripe or Paystack — Paystack recommended for African market) into `CheckoutPage`
- [x] Make Apple Pay button on `ProductDetailPage` functional — replaced with express "Buy Now" (add to cart + checkout)

### Investor Page
- [x] Replace placeholder metrics (350% growth, 50K customers, 15 markets) with real figures before going public
- [x] Build downloadable investor deck — "Download Investor Deck" button currently does nothing

### Internationalisation
- [x] Currency switcher — geo-detection, prompt, navbar selector, exchange-rate conversion (GHS/USD/NGN/GBP/EUR/KES)
- [x] Multi-language support — EN/FR with i18n context, translation dictionary, and navbar language selector

### SEO & Performance
- [x] Add per-page meta tags and Open Graph tags — `usePageMeta` hook updates title, description, OG & Twitter cards per route
- [x] Lazy-load images across site — `ImageWithFallback` now uses `loading="lazy"`, `decoding="async"`, and animated skeleton placeholders

### Analytics & Operations
- [x] Add analytics — GA4 integration with page-view tracking per route (`VITE_GA_MEASUREMENT_ID` env var)
- [x] Stand up the static Supabase-backed admin panel for product/order management and Worker-backed media uploads
- [x] Transactional emails — order confirmation, shipping update, and welcome email on account creation

---

## Known Tech Debt

| Location | Issue |
|---|---|
| ~~`AccountPage`~~ | ~~`emailExists` hardcoded to `false` — login path is completely broken~~ ✓ Fixed |
| ~~`CreateAccountPage`~~ | ~~Form submit doesn't call the API~~ ✓ Fixed |
| ~~`ProductDetailPage`~~ | ~~All product data is hardcoded (4 mock products)~~ ✓ Fixed |
| ~~`CategoryPage`~~ | ~~All category/product data is hardcoded~~ ✓ Fixed |
| ~~`CartPage`~~ | ~~Checkout button leads nowhere — step 2 doesn't exist~~ ✓ Fixed |
| ~~`InvestPage`~~ | ~~"Download Investor Deck" button is a dead link~~ ✓ Fixed |
| ~~`ContactPage`~~ | ~~Not yet audited~~ ✓ Audited — centralized contact constants, added i18n, fixed phone numbers, fixed dead sidebar links |

---

## Shortest Path to Demo-Ready

1. Wire auth (AccountPage + CreateAccountPage → API)
2. Build CheckoutPage + OrderConfirmationPage
3. Connect one real product category from the backend

Everything else is already presentable visually.
