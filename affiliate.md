# VNB Steward Program Architecture

This document turns the overview in [affiliate.txt](/Users/solideogloria/development/Websites/Vnb/affiliate.txt) into an implementation model for the current VNB stack.

## Terminology

- Program name: `VNB Affiliate Community Program`
- Public participant name: `VNB Steward`
- Pre-launch state: `waitlist`
- Launch state: `steward account + referral code + commission ledger`

## Recommended System Design

The Steward program should be treated as a financial attribution system, not just a marketing form.

That means separating the feature into six layers:

1. `Waitlist`
   Collect pre-launch interest from the public without requiring an account.

2. `Steward profile`
   Once approved, a person becomes a steward tied to a real auth user.

3. `Referral code`
   Each steward gets one or more managed codes. Codes can be rotated or disabled without losing history.

4. `Checkout attribution`
   A valid steward code is captured before payment, stored on the payment attempt, and carried onto the final order.

5. `Commission ledger`
   Successful attributed orders create immutable commission records. This is the source of truth for payouts.

6. `Payouts and rewards`
   Bi-weekly payouts, milestone awards, store credits, and recognition should all be separate records, not inferred ad hoc.

## Why This Design Fits The Current Stack

- `Supabase` is the source of truth for steward records, codes, ledgers, payouts, and rewards.
- `Cloudflare Worker` is the correct place to validate referral codes during checkout and persist attribution to payment attempts.
- `Supabase SQL` is the correct place to finalize commissions atomically at the same time an order is created.
- `Hostinger storefront` only needs light client plumbing:
  - capture steward code from URL
  - persist it locally
  - send it during checkout

This keeps commission logic out of the browser and avoids trusting the client for money logic.

## Core Tables

The codebase now scaffolds the Steward module around these tables:

- `steward_waitlist`
- `vnb_stewards`
- `steward_referral_codes`
- `steward_payouts`
- `steward_commissions`
- `steward_milestone_definitions`
- `steward_milestone_awards`
- `steward_reward_ledger`

It also extends:

- `payment_attempts`
- `orders`

## Commission Model

Recommended basis:

- commission should be calculated from `subtotal`
- not from `tax`
- not from `shipping`

Reason:

- tax is not revenue
- shipping may be pass-through or promotional
- subtotal is the cleanest commissionable sale basis

The current schema stores:

- steward tier
- steward commission rate
- referral snapshot on the payment attempt
- commissionable subtotal on the order
- final commission row per successful attributed order

## Tier Model

The current recommended tiering is:

- `standard` -> default 10%
- `support` -> default 15%

The schema stores the actual `commission_rate` directly on the steward row so future policy changes do not require code rewrites.

## Milestones And Rewards

Milestones should stay data-driven, not hardcoded in frontend copy.

Recommended milestone examples:

- 5 successful purchases in a weekly window -> recognition
- 10 successful purchases -> product reward
- 20 successful purchases -> merchandise / ambassador review

The schema separates:

- milestone definitions
- milestone awards
- reward ledger entries

This gives you room for:

- store credits
- complimentary products
- manual recognition
- future ambassador upgrades

## Rollout Order

1. Run the new SQL module `supabase/04_affiliates.sql`
2. Capture referral codes from storefront URLs
3. Send the stored code into Worker checkout init
4. Let checkout finalization create commission records automatically
5. Build admin stewardship tools after the ledger is live
6. Add public waitlist / steward landing pages after the backend model is stable

## What Is Intentionally Not Built Yet

The current restructuring lays the foundation, but does not yet include:

- a public steward waitlist page
- a steward dashboard portal
- admin UI tabs for stewards, payouts, and milestones
- payout execution integrations
- course delivery / completion tracking beyond status fields

Those should be built on top of the ledger and attribution model, not before it.
