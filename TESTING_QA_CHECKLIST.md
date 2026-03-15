# VNB — Testing & QA Checklist

> Manual and automated testing guide for the Vines & Branches e-commerce site.

---

## How to Use This Checklist

Test each section before a release. Mark items with `[x]` as you go. Reset for each release cycle.

**Environments:**
- **Dev:** `npm run dev` (frontend on `localhost:3000`) + `python manage.py runserver` (backend on `localhost:8000`)
- **Staging:** Deploy to a preview/staging URL before production
- **Production:** Final verification after deploy

---

## 1. Authentication

### Registration (`/create-account`)
- [x] Can create account with valid email and password
- [x] Shows validation errors for invalid email format
- [x] Shows validation errors for weak passwords
- [x] Duplicate email returns appropriate error message
- [ ] Supabase confirmation/welcome email is sent on successful registration
- [ ] If email confirmation is required, user can only sign in after confirming email
- [ ] If email confirmation is disabled, user can sign in immediately after registration
- [x] Auth state persists on page refresh

### Login (`/account`)
- [x] Correct password logs in successfully
- [x] Incorrect password shows generic error (no user enumeration)
- [x] Supabase session is stored and used for subsequent auth-protected API calls
- [x] Session persists across page refresh
- [x] Logout clears session and redirects appropriately

### Password Reset
- [x] "Forgot password" link navigates to reset page
- [ ] Email is sent with reset link
- [ ] Reset link redirects to `?page=reset-password` and allows setting new password
- [ ] Expired/used reset links are rejected
- [ ] Can log in with new password after reset

---

## 2. Product Browsing

### Homepage
- [x] Hero section renders with correct tagline and "Shop Now" button
- [x] "Shop Now" smooth-scrolls to collection section
- [x] Featured collection loads products from API
- [x] Product categories load from API with correct images
- [x] Sandals section loads featured products with correct prices
- [x] Brand story section renders fully
- [x] Newsletter section is visible and functional
- [x] Footer links work correctly

### Category Page (`/category/:slug`)
- [x] Products load for each category
- [x] Product cards show correct image, name, price
- [x] Prices display in the selected currency
- [x] Clicking a product navigates to its detail page
- [x] Empty category shows appropriate message
- [x] Loading state displays correctly

### Product Detail Page (`/product/:id`)
- [x] Product data loads from API (name, price, description, images)
- [x] Image gallery works (thumbnail selection, main image swap)
- [x] Image zoom opens and closes correctly
- [x] Color selector works (shows available colors)
- [x] Size selector works (shows available sizes)
- [x] Size guide modal opens and closes
- [x] "Add to Cart" requires size selection (shows toast if missing)
- [x] "Add to Cart" works and shows success toast
- [x] "Buy Now" requires size selection
- [x] "Buy Now" adds item to cart and navigates to checkout
- [x] Out-of-stock products show disabled buttons
- [x] Price displays in selected currency
- [x] Back button navigates correctly

### Search
- [x] Search dialog opens from navbar icon
- [x] Typing queries the API and shows results
- [x] Clicking a result navigates to the product page
- [x] No results shows appropriate message
- [x] Search works with partial product names

---

## 3. Cart & Checkout

### Cart (`/cart`)
- [x] Cart shows all added items with correct details (name, size, color, quantity, price)
- [x] Quantity can be increased and decreased
- [x] Item can be removed from cart
- [x] Cart total updates correctly
- [x] Empty cart shows appropriate message with "Continue Shopping" link
- [x] "Proceed to Checkout" navigates to checkout page
- [x] Prices display in selected currency

### Checkout (`/checkout`)
- [x] Step indicator shows correct progress
- [x] Contact information form validates required fields
- [x] Shipping address form validates required fields
- [x] Order summary shows correct items and total
- [x] "Place Order" initiates Paystack payment
- [x] Paystack popup opens with correct amount and currency
- [x] Successful payment redirects to confirmation page
- [x] Failed/cancelled payment shows error message
- [x] Order is created in the backend database
adm
### Order Confirmation (`/order-confirmation`)
- [x] Order details display correctly (order number, items, total)
- [x] Order confirmation email is sent to the customer
- [x] "Continue Shopping" navigates to homepage
- [x] Order appears in the user's account dashboard

---

## 4. Payments (Paystack)

### Test Mode
- [x] Test public key is set in frontend `.env`
- [x] Test secret key is set in backend `.env`
- [x] Paystack test cards work:
  - Success: `4084 0840 8408 4081` (any future expiry, any CVV)
  - Failed: `4084 0840 8408 4085`
  - Timeout: `5060 6611 1111 1119`
- [x] Payment verification endpoint confirms transaction server-side
- [x] Transaction amount matches order total (no tampering possible)
- [x] Payment channels are configured (card, bank, mobile_money)

### Live Mode (pre-launch)
- [ ] Live keys are set in both frontend and backend
- [ ] Test with a real card for a small amount
- [ ] Verify funds appear in Paystack dashboard
- [ ] Refund the test transaction

---

## 5. Account Dashboard (`/account-dashboard`)

- [x] Dashboard loads for authenticated users
- [x] Profile tab shows correct user information
- [x] Profile can be updated (name, phone, etc.)
- [x] Order history tab shows past orders with correct details
- [x] Address book tab is accessible
- [x] Payments tab is accessible
- [x] Unauthenticated users are redirected to login

---

## 6. Internationalisation

### Currency
- [x] Default currency is GHS
- [x] Currency prompt appears for non-Ghana visitors (test with VPN or mock)
- [x] "Switch to [Currency]" updates all prices on the site
- [x] "Keep GH₵" dismisses prompt and stores preference
- [x] Prompt does not appear again after user makes a choice
- [x] Navbar currency selector switches currency correctly
- [x] All product prices, cart totals, and checkout amounts update
- [x] Currency preference persists across page refreshes
- [x] Supported currencies: GHS, USD, NGN, GBP, EUR, KES

### Language
- [x] Default language is English
- [x] Navbar language selector switches to French
- [x] All translated UI strings update correctly in French
- [x] Language preference persists across page refreshes
- [x] Untranslated keys fall back to English gracefully

---

## 7. SEO & Meta Tags

- [x] Each page has a unique `<title>` tag
- [x] Each page has a `<meta name="description">` tag
- [x] Open Graph tags are set (`og:title`, `og:description`, `og:image`, `og:url`)
- [x] Twitter Card tags are set
- [x] `theme-color` meta tag is present
- [x] No duplicate or conflicting meta tags in the `<head>`

### Verify with tools:
- [x] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) shows correct preview
- [x] [Twitter Card Validator](https://cards-dev.twitter.com/validator) shows correct preview
- [x] Google Lighthouse SEO score ≥ 90

---

## 8. Analytics (Google Analytics 4)

- [x] `VITE_GA_MEASUREMENT_ID` is set
- [x] GA4 script loads (check Network tab for `gtag/js`)
- [x] Page views are tracked on navigation (check GA4 Real-time report)
- [x] No GA tracking fires when measurement ID is unset (privacy safe)
- [x] No console errors related to analytics

---

## 9. Investor Page (`/invest`)

- [x] Page loads with correct metrics and investment tiers
- [x] Investment interest form submits successfully
- [x] "Download Investor Deck" generates and downloads a PDF
- [x] PDF contains all 6 slides with correct information
- [x] Form validation works (required fields)

---

## 10. Contact Page (`/contact`)

**Where to find it:** Click **Contact Us** in the main navigation (top right), or open the hamburger menu → **Contact Us**, or go to `?page=contact`.

- [x] Contact form loads with all fields
- [x] Form validates required fields
- [x] Successful submission shows confirmation
- [ ] Message appears in backend (Django admin `ContactMessages` or Supabase — verify after submitting)
- [x] Contact information (address, phone, email, hours) is displayed

---

## 11. Newsletter

**Where to find it:** Homepage — scroll to the newsletter section (“Join the Vines & Branches Circle”). The footer “Subscribe” link is a placeholder; use the homepage form to test.

- [x] Email input validates format
- [x] Successful subscription shows confirmation toast
- [x] Duplicate subscription is handled gracefully (API error shown via toast)
- [ ] Subscription appears in backend (Django admin or Supabase — verify after submitting)

---

## 12. Cross-Browser & Device Testing

### Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS and iOS)
- [ ] Edge (latest)

### Devices
- [ ] Desktop (1920×1080, 1440×900)
- [ ] Tablet (768×1024 — iPad)
- [ ] Mobile (375×812 — iPhone, 360×800 — Android)

### Checks per device
- [ ] Navigation menu works (hamburger on mobile)
- [ ] Images load and are not stretched/cropped incorrectly
- [ ] Buttons and links are tappable (minimum 44×44px touch target)
- [ ] Modals and overlays are dismissible
- [ ] Forms are usable (keyboard doesn't cover inputs on mobile)
- [ ] Scroll performance is smooth (no jank)
- [ ] Animations run at 60fps

---

## 13. Performance

- [ ] Google Lighthouse Performance score ≥ 80
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Images are lazy-loaded (check `loading="lazy"` attribute)
- [ ] No unnecessary network requests on page load
- [ ] Bundle size is reasonable (`npm run build` output)
- [ ] Gzip/Brotli compression is enabled on the server

---

## 14. Accessibility (a11y)

- [ ] All images have `alt` text
- [ ] Form inputs have associated `<label>` elements
- [ ] Colour contrast meets WCAG AA (4.5:1 for text)
- [ ] Site is navigable with keyboard only (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader can announce page content logically
- [ ] Modals trap focus correctly
- [ ] ARIA roles are used where appropriate

### Verify with tools:
- [ ] Google Lighthouse Accessibility score ≥ 85
- [ ] [axe DevTools](https://www.deque.com/axe/) browser extension shows no critical issues

---

## 15. Error Handling

- [ ] API failure on product load shows user-friendly error
- [ ] API failure on checkout shows error and doesn't lose cart data
- [ ] Network offline shows appropriate feedback
- [ ] 404 / unknown routes show a fallback or redirect
- [ ] No unhandled promise rejections in console
- [ ] Backend 500 errors don't expose stack traces to the user

---

## 16. Django Admin

- [ ] Admin login works at `/admin/`
- [ ] Products can be created, edited, and deleted
- [ ] Product images upload correctly
- [ ] Categories can be managed
- [ ] Orders are listed with correct status, total, and customer
- [ ] Order status can be updated
- [ ] User accounts are listed and manageable
- [ ] Contact messages are viewable
- [ ] Newsletter subscriptions are viewable
- [ ] Investment inquiries are viewable

---

## Quick Smoke Test (5 minutes)

For rapid verification after a deploy:

1. [ ] Homepage loads with real products
2. [ ] Click a product → detail page loads
3. [ ] Select size → "Add to Cart" → cart updates
4. [ ] Go to cart → "Proceed to Checkout"
5. [ ] Fill checkout form → "Place Order" → Paystack popup
6. [ ] Complete test payment → order confirmation page
7. [ ] Check Django admin → order exists
8. [ ] Register new account → welcome email received
9. [ ] Switch currency → prices update
10. [ ] Switch language → UI updates
