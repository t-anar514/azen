# Guide Availability — Design Spec

**Date:** 2026-07-25
**Branch:** `feat/sprint2-places-city-hub`
**Status:** Approved design → ready for implementation plan
**Depends on:** migration `0021_guide_booking_details` (staged booking flow), `0020_guide_studio` (`current_guide_id()`, `guide_bookings`)

---

## 1. Goal

Let a guide say which days they cannot work, and make the public booking calendar
respect it.

Today `BookGuideDialog` disables only past dates, and its "Боломжгүй" legend
therefore means nothing more than "yesterday". A traveller can request any future
day, including days the guide has already sold or is out of the country. This
spec closes that gap.

## 2. Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Default state | **Bookable unless blocked** (blocklist) | The 3 existing guides keep working with no action required; a guide who ignores the page never silently vanishes from the marketplace. |
| Confirmed bookings | **Auto-block that date** | Bookings run 3–10 h, so a guide realistically does one per day. Removes the "remember to block the day you just accepted" failure. |
| Pending requests | **Do not block** | Otherwise one traveller who never pays can hold a guide's day hostage until the request is declined. |
| Placement | **New `/studio/availability` page** | Availability changes weekly; the profile page is set-and-forget and the dashboard is already full. |
| Range blocking | **In v1** | Blocking a two-week holiday one tap at a time is the case that actually hurts. |

**Explicitly out of scope (YAGNI):** minimum booking notice ("nothing within
24 h"), per-day custom working hours, recurring weekly patterns. Each is a real
feature; none was asked for, and the chosen schema accommodates all three later
without a rewrite.

## 3. Data model

### Migration `0022_guide_availability.sql`

```sql
create table public.guide_unavailable_dates (
  guide_id   uuid not null references public.guides(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  primary key (guide_id, date)
);
```

One row per blocked day. The composite primary key does three jobs at once: it
dedupes (blocking the same day twice is a no-op), and it *is* the index every
read needs — both "all blocked dates for this guide in a range" and "is this
one date blocked".

Rejected alternatives:

- **Date ranges** `(guide_id, start_date, end_date)` — fewer rows, but blocking
  Jul 10–20 when Jul 15–25 already exists requires split/merge logic, and every
  read becomes a containment query. Real complexity for a saving that does not
  matter at this scale.
- **`date[]` column on `guides`** — no new table, but an unbounded array per
  guide, no useful index, and it sits inside the `guard_guide_columns()` trigger
  that protects guide-owned fields, so availability would need carving out as an
  exception to a security control.

### RLS

- **SELECT: public.** The booking calendar must read a guide's blocked dates for
  anonymous visitors. This does reveal which days a guide is busy — that is
  inherent to publishing a booking calendar, and is exactly what the UI renders
  anyway.
- **INSERT / DELETE: owner only**, via the existing `current_guide_id()`
  SECURITY DEFINER helper. A guide can never write another guide's dates.
- No UPDATE policy — a row's only meaning is "blocked"; changing a date is a
  delete plus an insert.

## 4. One source of truth

A single pure helper in `src/lib/guides/availability.ts`:

```ts
type DayState = "available" | "past" | "blocked" | "booked"
```

A date resolves in precedence order: **past** → **booked** (a `confirmed`
`guide_booking` on that date) → **blocked** (a `guide_unavailable_dates` row) →
otherwise **available**.

`booked` outranks `blocked` so the studio UI can render a sold day distinctly
and refuse to let the guide toggle it — "unblocking" a day they have already
sold would be a lie.

Both the studio page and the public booking calendar derive from this one
function, so the two views cannot drift.

## 5. API

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/guides/[id]/availability?from=&to=` | GET | public | `{ blocked: string[], booked: string[] }` for the booking calendar |

`[id]` is the guide **UUID**, not the slug — `BookGuideDialog` already holds
`guide.id`, and the public profile resolves slug → row before rendering it.
`from`/`to` are inclusive `YYYY-MM-DD` bounds; a missing or inverted range
returns 400 rather than scanning the whole table.

| `/api/studio/availability` | POST | guide only | `{ dates: string[], action: "block" \| "unblock" }` |

The POST handler:

- resolves the guide from the session (never trusts a `guideId` in the body),
- validates every entry against `^\d{4}-\d{2}-\d{2}$` and rejects past dates,
- refuses **either action** on a date that has a `confirmed` booking — blocking
  is redundant state, unblocking would falsely reopen a day already sold,
- caps the batch (365 dates) so a range request cannot be used to bulk-insert.

Blocking a date that has only a **pending** request is allowed and does not
touch that request. The guide declines it through the normal accept/decline
flow; silently cancelling someone's request as a side effect of a calendar tap
would be a surprise.

`unblock` on a date with no row is a no-op, not an error — the endpoint is
idempotent so a double-tap or a retried request cannot fail.

### Server-side booking guard

`POST /api/guides/bookings` re-checks the requested `tripDate` against the same
helper and returns 409 if it is blocked or already confirmed. **This is the
actual rule.** The calendar disabling a day is a convenience; without this check
anyone can `curl` a booking onto a blocked date.

## 6. UI

### `/studio/availability`

- Month calendar with prev/next navigation, capped at 12 months ahead.
- Tap a day to toggle blocked. Optimistic update, revert on error.
- Separate from/to range control for holidays, with a single "Хаах" action.
- Confirmed-booking days render saffron and are **not** interactive.
- Legend: Боломжтой / Хаасан / Захиалгатай / Өнгөрсөн.
- Reuses the `mn` locale + `formatCaption` treatment already established in
  `BookGuideDialog` ("2026 · 7-р сар"), and `weekStartsOn={1}`.

Nav: one `StudioSidebar` entry (Боломжит өдөр, `CalendarDays` icon). The mobile
`StudioTabBar` currently carries 4 tabs plus a FAB; if a 5th crowds it, the page
is reached from the dashboard on mobile instead.

### `BookGuideDialog`

Fetches availability on open for the visible window and feeds `disabled` to the
day picker. The existing "Боломжгүй" legend becomes honest, and a
"Захиалгатай" swatch is added.

Loading: the calendar renders with only past dates disabled until the fetch
resolves, then re-disables. A brief window where a day looks tappable is
acceptable because the server guard is authoritative.

## 7. Testing

- **vitest** on the availability helper: precedence (past beats booked beats
  blocked), boundary dates, empty inputs.
- **RLS harness** in the repo's established form
  (`begin; set local role authenticated; … rollback;`) proving guide A cannot
  insert or delete guide B's dates, and that public SELECT works unauthenticated.
- **API**: 409 on booking a blocked date; 400 on a malformed or past date.
- **Browser**: studio page markup at 1440 and 375; booking calendar showing a
  blocked day as disabled.

## 8. Known verification gap

Credential entry is prohibited, so the **logged-in studio page cannot be
exercised end-to-end in-session**. Assurance is: schema and RLS proven via the
SQL role-swap harness, the helper covered by unit tests, API behaviour proven by
direct calls, and page markup verified at both breakpoints. The logged-in pass
needs the user.

This is the same gap recorded for the rest of `/studio` in
`2026-07-22-guide-studio-and-profile-design.md`.
