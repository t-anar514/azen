# Guide Booking Payments (Wire) — Design

**Goal:** Travelers pay for a guide booking up front through Wire. A paid booking
is final — the guide cannot decline it.

**Decided by the owner:**
1. Pay upfront, always. The request/approve step is removed.
2. The FX rate is locked at booking time; Azen absorbs later movement.

## Why the guide can't decline

The availability calendar (spec 2026-07-25-guide-availability) is the guide's
only way to say no, and it must be used in advance. Once a date is open and a
traveler has paid, the guide is committed.

That rule removes the safety net that made a missing constraint survivable.
Today two travelers can request the same date and the guide declines one.
With no decline, both would be paid and the guide double-booked.

## The race, and how it is actually closed

`isDateBookable()` checks and then inserts. Two concurrent requests both pass
the check before either writes — a TOCTOU race. Human review used to absorb it.
Money does not.

Fix is a partial unique index, not a check:

```sql
create unique index uq_gb_guide_date_active
  on public.guide_bookings (guide_id, trip_date)
  where status in ('awaiting_payment','confirmed','completed');
```

The database refuses the second row no matter the concurrency. `declined`,
`cancelled` and `expired` are excluded so a dead booking never blocks a date.

**One booking per guide per date** is intentional and already implied by the
availability model, which is date-granular.

### Holds

Creating a booking takes a hold with `hold_expires_at = now() + 15 min`, which
occupies the unique index. Unpaid holds expire and free the date; this mirrors
Wire auto-cancelling unpaid invoices after its TTL.

`create_booking_hold()` (SECURITY DEFINER) sweeps expired holds for that
guide+date and inserts in one transaction, so a stale hold can never block a
legitimate booking, and the sweep cannot race the insert.

```
hold (awaiting_payment) ──15 min, unpaid──> expired ──> date reopens
        │
   webhook: payment_intent.succeeded
        │
        v
    confirmed  (guide sees it for the first time)
```

## Reusing the existing payments table

Migration 0005 already created `public.payments` as an explicit stub — "no real
gateway wired up yet ... flipped to 'paid' manually by an admin once QPay (or
whatever's chosen later) is integrated". It already carries `provider`,
`reference`, and a `payment_status` enum of pending/paid/failed/refunded.

Wire is that gateway. A second table would mean two reconciliation surfaces and
a second integration when transfers eventually move off the manual flip, so
`payments` is generalized instead of duplicated:

- `booking_id` becomes nullable (it references transfer `bookings`)
- `+ guide_booking_id` referencing `guide_bookings`
- `check (num_nonnulls(booking_id, guide_booking_id) = 1)` — exactly one parent
- `+ wire_payment_intent_id text unique`, `+ wire_checkout_session_id text`,
  `+ amount_mnt bigint`

`payments_select` is extended so a traveler sees their own guide payments and a
guide sees payments for their bookings. `payments_insert` is narrowed to
`guide_booking_id is null`, which preserves the transfer flow byte-for-byte
while making guide payment rows service-role-only — a client must never be able
to write a row that says "paid".

**Pre-existing issue, deliberately not changed here:** `payments_insert` is
`with check (true)`, so any authenticated client can insert a transfer payment
row claiming `paid`. Out of scope for this spec; tracked separately.

## Currency

Prices are stored in JPY. Wire charges MNT. The rate comes from the
`exchange_rates` row (migration 0007; fallback `MNT: 22.3` per ¥1).

At booking time the rate is read once and written to the booking as `fx_rate` /
`fx_locked_at`, alongside the resulting `amount_mnt`. The traveler sees one
final ₮ figure that never changes. Azen carries movement between booking and
payout, per the owner's decision.

### The minor-unit contradiction

Wire's docs disagree with themselves:

| Source | Claim |
|---|---|
| Quickstart, "Money and time" | integer **minor units**; `50000` = 500.00 ₮ |
| "Payment links" | "Amounts are whole tögrög (**MNT has no minor unit**)" |

Getting this wrong charges 100× too much or too little. MNT has no circulating
subunit, so whole tögrög is almost certainly correct and the minor-unit wording
looks inherited from Stripe's docs. It is isolated to one constant:

```ts
export const MNT_UNITS_PER_TOGROG = 1
```

**Must be confirmed by one sandbox charge before going live.** Not a guess to
ship on.

## No SDK

`fetch` + `node:crypto`, no `@buildry-wire/wire`. Checkout sessions are
REST-only in Wire's own docs, signature verification is a documented ten-line
HMAC, and this keeps an unaudited third-party package out of the deploy.

## Endpoints

**`POST /api/bookings/checkout`** — authenticated. Amount is computed
server-side from `guides.price`; the client body is never trusted for money.
Locks FX, calls `create_booking_hold`, creates the PaymentIntent and checkout
session (idempotency keys `booking-{id}` / `sess-{id}`), returns the hosted URL.
Releases the hold if Wire fails.

**`POST /api/webhooks/wire`** — unauthenticated by design; the signature *is*
the authentication. `middleware.ts` already excludes `/api`, so no change is
needed there.

1. read the **raw** body via `req.text()` — parsing first changes the bytes and
   breaks the HMAC
2. verify `WirePayment-Signature`: HMAC-SHA256 over `"<t>.<rawbody>"`, hex,
   `timingSafeEqual`, 300s tolerance
3. dedupe on event id (`wire_webhook_events`) — Wire's docs warn events are
   redelivered
4. on `payment_intent.succeeded`: booking → `confirmed`, payment row → `paid`
5. return 2xx quickly

The redirect is never trusted; only the verified webhook confirms.

## UI changes

- Booking dialog's final step redirects to Wire checkout.
- A return page reads pending-vs-confirmed, because the webhook can land after
  the traveler is redirected back.
- Studio "Ирсэн хүсэлт" becomes confirmed upcoming trips; `AcceptDeclineButtons`
  leaves that panel.

## Testing

Unit: FX and unit conversion, rounding, and signature verification against a
tampered body, wrong secret, stale timestamp, and malformed header.

Sandbox magic inputs: `42` → `amount_too_small`, `42424` → operator timeout,
charge id containing `decline` → declined. Note these collide with real prices
in test mode only.

The race gets a concurrency test issuing two simultaneous bookings for one
guide+date and asserting exactly one survives.

## Out of scope

- **Refunds.** Absent from Wire's documentation entirely. Schema leaves room
  (`payment_status` already has `refunded`); traveler cancellations are manual
  until Wire's refund story is known.
- **Guide payouts.** Wire settles to Azen's account. Paying guides stays
  offline; the earnings page reports what is owed.
- Transfers moving from the manual admin flip onto Wire.
