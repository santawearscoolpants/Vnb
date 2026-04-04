# VNB Copy Promise Audit

> Completed on April 4, 2026 against current storefront/admin code paths.

## What was corrected

- Removed fixed timing guarantee language in investment inquiry success messaging.
- Removed hard claim that steward application confirmation email is always sent.
- Removed hard claim that order confirmation emails are always sent.
- Replaced remaining `href="#"` legal/service links in checkout/cart/order-confirmation/create-account with real in-app routes.
- Updated newsletter success copy to avoid promising an unimplemented automatic discount-code email.
- Updated FAQ tracking answer to match actual current behavior (account order status + optional email updates).

## Current truth constraints

- Order confirmation/status emails are conditional on Worker email vars (`RESEND_API_KEY`, `EMAIL_FROM`).
- Payment success path still depends on live Paystack verification.
- Real shipment tracking links are not yet implemented as a dedicated feature.

## Remaining copy review cadence

- Re-run this audit after each release that changes checkout, fulfillment, steward payouts, or investor pages.
