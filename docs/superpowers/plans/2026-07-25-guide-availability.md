# Guide Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a guide block the days they cannot work in `/studio/availability`, and make the public booking calendar and booking API refuse those days.

**Architecture:** One row per blocked day in a new `guide_unavailable_dates` table (PK `(guide_id, date)`). A single pure helper resolves a date to `past | booked | blocked | available`, and both the studio page and the public booking calendar derive from it so they cannot drift. The `POST /api/guides/bookings` server guard is the authoritative rule; calendar disabling is convenience.

**Tech Stack:** Next.js 16 (App Router, RSC), Supabase Postgres + RLS, TypeScript, Tailwind v4, react-day-picker v9, vitest.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-25-guide-availability-design.md`. Every decision there is binding.
- Migration files are numbered `00NN_name.sql`; apply via `execute_sql` and insert the ledger row manually (`insert into supabase_migrations.schema_migrations (version, name) values ('0022', 'guide_availability')`). Do **not** use MCP `apply_migration` — it writes timestamp versions that disagree with the `00NN` file naming.
- Supabase project id: `kcelklggeywamljaivhm`.
- Studio routes use plain `next/link`, **not** the i18n `Link`, and are **not** registered in `src/i18n/routing.ts`. Follow that.
- Dates are plain `YYYY-MM-DD` strings everywhere. Never use `toISOString()` to derive one — it shifts the day for UTC-behind zones. Use the local-date helper defined in Task 2.
- All UI copy is Mongolian.
- Tests are `*.test.ts` beside the source. Run with `npm test`.
- `tsc --noEmit` must be clean before every commit.

---

### Task 1: Migration + RLS for `guide_unavailable_dates`

**Files:**
- Create: `supabase/migrations/0022_guide_availability.sql`

**Interfaces:**
- Consumes: `public.current_guide_id()` and `public.guides` from `0020_guide_studio.sql`.
- Produces: table `public.guide_unavailable_dates(guide_id uuid, date date, created_at timestamptz)`, PK `(guide_id, date)`.

- [ ] **Step 1: Write the migration file**

```sql
-- 0022 — guide availability (design: /studio/availability)
--
-- Blocklist model: a guide is bookable unless a row here says otherwise.
-- One row per blocked day. The composite PK is both the dedupe rule and the
-- only index the reads need — "all blocked dates for a guide in a range" and
-- "is this one date blocked" are both covered by it.

create table if not exists public.guide_unavailable_dates (
  guide_id   uuid not null references public.guides(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  primary key (guide_id, date)
);

alter table public.guide_unavailable_dates enable row level security;

-- Public read: the booking calendar must resolve availability for anonymous
-- visitors. This exposes which days a guide is busy, which is exactly what the
-- calendar renders anyway.
drop policy if exists "gud_public_read" on public.guide_unavailable_dates;
create policy "gud_public_read" on public.guide_unavailable_dates
  for select using (true);

-- Owner-only writes. No UPDATE policy: a row's only meaning is "blocked", so
-- changing a date is a delete plus an insert.
drop policy if exists "gud_owner_insert" on public.guide_unavailable_dates;
create policy "gud_owner_insert" on public.guide_unavailable_dates
  for insert with check (guide_id = public.current_guide_id());

drop policy if exists "gud_owner_delete" on public.guide_unavailable_dates;
create policy "gud_owner_delete" on public.guide_unavailable_dates
  for delete using (guide_id = public.current_guide_id());

comment on table public.guide_unavailable_dates is
  'Days a guide cannot work. Absence of a row means bookable.';
```

- [ ] **Step 2: Apply it and record the ledger row**

Run the file's contents through `execute_sql` against project `kcelklggeywamljaivhm`, followed by:

```sql
insert into supabase_migrations.schema_migrations (version, name)
values ('0022', 'guide_availability')
on conflict (version) do nothing;
```

- [ ] **Step 3: Prove RLS with the role-swap harness**

Run via `execute_sql`. Replace `<GUIDE_A_PROFILE>` / `<GUIDE_B_ID>` with real values from
`select id, profile_id from guides limit 2;`.

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"<GUIDE_A_PROFILE>","role":"authenticated"}';

-- own row: allowed
insert into public.guide_unavailable_dates (guide_id, date)
values (public.current_guide_id(), '2099-01-01');

-- another guide's row: must raise insufficient_privilege
insert into public.guide_unavailable_dates (guide_id, date)
values ('<GUIDE_B_ID>', '2099-01-02');
rollback;
```

Expected: the first insert succeeds, the second fails with a row-level security violation.

- [ ] **Step 4: Verify public read works unauthenticated**

```sql
begin;
set local role anon;
select count(*) from public.guide_unavailable_dates;
rollback;
```

Expected: returns a count (no permission error).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0022_guide_availability.sql
git commit -m "feat(guides): add guide_unavailable_dates table with owner-only writes"
```

---

### Task 2: Availability helper + unit tests

**Files:**
- Create: `src/lib/guides/availability.ts`
- Test: `src/lib/guides/availability.test.ts`

**Interfaces:**
- Produces:
  - `type DayState = "past" | "booked" | "blocked" | "available"`
  - `toDateKey(d: Date): string` — local `YYYY-MM-DD`
  - `resolveDayState(date: string, opts: { today: string; blocked: Set<string>; booked: Set<string> }): DayState`
  - `MAX_MONTHS_AHEAD = 12`
  - `MAX_BATCH_DATES = 365`
  - `isValidDateKey(v: unknown): v is string`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest"
import { resolveDayState, toDateKey, isValidDateKey } from "./availability"

const opts = (blocked: string[] = [], booked: string[] = []) => ({
  today: "2026-07-25",
  blocked: new Set(blocked),
  booked: new Set(booked),
})

describe("resolveDayState", () => {
  it("returns past for a date before today", () => {
    expect(resolveDayState("2026-07-24", opts())).toBe("past")
  })
  it("treats today as available, not past", () => {
    expect(resolveDayState("2026-07-25", opts())).toBe("available")
  })
  it("returns available when nothing applies", () => {
    expect(resolveDayState("2026-08-01", opts())).toBe("available")
  })
  it("returns blocked when the guide blocked it", () => {
    expect(resolveDayState("2026-08-01", opts(["2026-08-01"]))).toBe("blocked")
  })
  it("returns booked when a confirmed booking exists", () => {
    expect(resolveDayState("2026-08-01", opts([], ["2026-08-01"]))).toBe("booked")
  })
  it("ranks booked above blocked so a sold day is never editable", () => {
    expect(
      resolveDayState("2026-08-01", opts(["2026-08-01"], ["2026-08-01"]))
    ).toBe("booked")
  })
  it("ranks past above everything", () => {
    expect(
      resolveDayState("2026-07-01", opts(["2026-07-01"], ["2026-07-01"]))
    ).toBe("past")
  })
})

describe("toDateKey", () => {
  it("uses local calendar fields, not UTC", () => {
    // 2026-08-01T00:30 local must stay Aug 1 even in a UTC-behind zone
    expect(toDateKey(new Date(2026, 7, 1, 0, 30))).toBe("2026-08-01")
  })
  it("zero-pads month and day", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05")
  })
})

describe("isValidDateKey", () => {
  it("accepts a well-formed key", () => {
    expect(isValidDateKey("2026-08-01")).toBe(true)
  })
  it("rejects junk", () => {
    expect(isValidDateKey("2026-8-1")).toBe(false)
    expect(isValidDateKey("not-a-date")).toBe(false)
    expect(isValidDateKey(20260801)).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/guides/availability.test.ts`
Expected: FAIL — cannot resolve `./availability`.

- [ ] **Step 3: Write the implementation**

```ts
/**
 * Availability model for guide bookings.
 *
 * Blocklist: a guide is bookable unless a `guide_unavailable_dates` row says
 * otherwise. `resolveDayState` is the single source of truth — both the studio
 * editor and the public booking calendar derive from it, so the two views
 * cannot disagree about whether a day is open.
 */

export type DayState = "past" | "booked" | "blocked" | "available"

/** How far ahead the calendar lets anyone look or block. */
export const MAX_MONTHS_AHEAD = 12

/** Upper bound on one block/unblock request, so a range can't bulk-insert. */
export const MAX_BATCH_DATES = 365

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export function isValidDateKey(v: unknown): v is string {
  return typeof v === "string" && DATE_KEY.test(v)
}

/**
 * Local "YYYY-MM-DD". Deliberately not toISOString().slice(0,10) — that
 * converts to UTC first, so 00:30 on Aug 1 in a UTC-behind zone becomes
 * Jul 31 and the guide blocks the wrong day.
 */
export function toDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Precedence: past → booked → blocked → available.
 *
 * `booked` outranks `blocked` so a day the guide already sold renders as sold
 * and stays non-interactive; letting them "unblock" it would reopen a day
 * that is genuinely gone.
 *
 * Date keys are zero-padded and fixed-width, so string comparison is
 * chronological and no Date parsing is needed here.
 */
export function resolveDayState(
  date: string,
  opts: { today: string; blocked: Set<string>; booked: Set<string> }
): DayState {
  if (date < opts.today) return "past"
  if (opts.booked.has(date)) return "booked"
  if (opts.blocked.has(date)) return "blocked"
  return "available"
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/lib/guides/availability.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/guides/availability.ts src/lib/guides/availability.test.ts
git commit -m "feat(guides): add availability day-state helper"
```

---

### Task 3: Server-side availability loader

**Files:**
- Create: `src/lib/guides/availabilityData.ts`

**Interfaces:**
- Consumes: `toDateKey`, `MAX_MONTHS_AHEAD` from Task 2; `createClient` from `@/lib/supabase/server`.
- Produces:
  - `loadAvailability(guideId: string, from: string, to: string): Promise<{ blocked: string[]; booked: string[] }>`
  - `isDateBookable(guideId: string, date: string): Promise<boolean>`

- [ ] **Step 1: Write the module**

```ts
import "server-only"
import { createClient } from "@/lib/supabase/server"
import { resolveDayState, toDateKey } from "@/lib/guides/availability"

/**
 * Blocked + booked date keys for one guide inside an inclusive window.
 *
 * `booked` is derived from confirmed guide_bookings rather than stored, so
 * accepting a trip closes the day with no extra write and declining reopens it.
 * Pending requests deliberately do not appear — otherwise one traveller who
 * never pays could hold a guide's day hostage.
 */
export async function loadAvailability(
  guideId: string,
  from: string,
  to: string
): Promise<{ blocked: string[]; booked: string[] }> {
  const supabase = await createClient()

  const [{ data: blockedRows }, { data: bookedRows }] = await Promise.all([
    supabase
      .from("guide_unavailable_dates")
      .select("date")
      .eq("guide_id", guideId)
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("guide_bookings")
      .select("trip_date")
      .eq("guide_id", guideId)
      .eq("status", "confirmed")
      .gte("trip_date", from)
      .lte("trip_date", to),
  ])

  return {
    blocked: (blockedRows ?? []).map((r: { date: string }) => r.date),
    booked: (bookedRows ?? []).map((r: { trip_date: string }) => r.trip_date),
  }
}

/**
 * Authoritative check used by the booking API. The calendar disabling a day is
 * a convenience; this is the rule.
 */
export async function isDateBookable(guideId: string, date: string): Promise<boolean> {
  const { blocked, booked } = await loadAvailability(guideId, date, date)
  const state = resolveDayState(date, {
    today: toDateKey(new Date()),
    blocked: new Set(blocked),
    booked: new Set(booked),
  })
  return state === "available"
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/guides/availabilityData.ts
git commit -m "feat(guides): add server-side availability loader"
```

---

### Task 4: Public GET availability route

**Files:**
- Create: `src/app/api/guides/[id]/availability/route.ts`

**Interfaces:**
- Consumes: `loadAvailability` (Task 3), `isValidDateKey` (Task 2).
- Produces: `GET /api/guides/[id]/availability?from=&to=` → `{ blocked: string[], booked: string[] }`.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server"
import { loadAvailability } from "@/lib/guides/availabilityData"
import { isValidDateKey } from "@/lib/guides/availability"

// Public: the booking calendar resolves availability for anonymous visitors.
// `id` is the guide UUID (BookGuideDialog already holds guide.id).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // Bounded window only — an unbounded query would scan every row for a guide.
  if (!isValidDateKey(from) || !isValidDateKey(to) || from > to) {
    return NextResponse.json({ error: "invalid range" }, { status: 400 })
  }

  const data = await loadAvailability(id, from, to)
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Verify the happy path**

Get a real guide id first — `select id, name from guides limit 1;` via
`execute_sql` — and substitute it for `GUIDE_UUID` below. With the dev server
running:

```bash
curl -s "http://localhost:3000/api/guides/GUIDE_UUID/availability?from=2026-07-01&to=2026-12-31"
```

Expected: HTTP 200 and JSON carrying both keys, e.g. `{"blocked":[],"booked":[]}`.

- [ ] **Step 3: Verify the guard rejects a bad range**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/guides/GUIDE_UUID/availability?from=2026-12-31&to=2026-01-01"
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/guides/GUIDE_UUID/availability"
```

Expected: `400` for both — inverted range and missing range.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/guides/[id]/availability/route.ts"
git commit -m "feat(guides): add public availability endpoint"
```

---

### Task 5: Studio POST availability route

**Files:**
- Create: `src/app/api/studio/availability/route.ts`

**Interfaces:**
- Consumes: `isValidDateKey`, `MAX_BATCH_DATES`, `toDateKey` (Task 2).
- Produces: `POST /api/studio/availability` with body `{ dates: string[], action: "block" | "unblock" }` → `{ ok: true, changed: number }`.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  isValidDateKey,
  MAX_BATCH_DATES,
  toDateKey,
} from "@/lib/guides/availability"

/**
 * Block or unblock days for the *session's own* guide. The guide id is never
 * read from the body — RLS would reject a foreign write anyway, but resolving
 * it server-side means the request can't even be shaped to try.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 })

  const { data: guide } = await supabase
    .from("guides").select("id").eq("profile_id", user.id).single()
  if (!guide) return NextResponse.json({ error: "not a guide" }, { status: 403 })

  const { dates, action } = await req.json().catch(() => ({}))
  if (action !== "block" && action !== "unblock")
    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  if (!Array.isArray(dates) || dates.length === 0)
    return NextResponse.json({ error: "no dates" }, { status: 400 })
  if (dates.length > MAX_BATCH_DATES)
    return NextResponse.json({ error: "too many dates" }, { status: 400 })

  const today = toDateKey(new Date())
  const clean = [...new Set(dates)].filter(
    (d): d is string => isValidDateKey(d) && d >= today
  )
  if (clean.length === 0)
    return NextResponse.json({ error: "no valid dates" }, { status: 400 })

  // A day with a confirmed booking is already closed. Blocking it is redundant
  // state; unblocking it would falsely reopen a day the guide has sold. Refuse
  // both rather than silently dropping the request.
  const { data: confirmed } = await supabase
    .from("guide_bookings")
    .select("trip_date")
    .eq("guide_id", guide.id)
    .eq("status", "confirmed")
    .in("trip_date", clean)

  if (confirmed && confirmed.length > 0) {
    return NextResponse.json(
      { error: "confirmed booking", dates: confirmed.map((r: { trip_date: string }) => r.trip_date) },
      { status: 409 }
    )
  }

  if (action === "block") {
    const { error } = await supabase
      .from("guide_unavailable_dates")
      .upsert(
        clean.map((date) => ({ guide_id: guide.id, date })),
        { onConflict: "guide_id,date", ignoreDuplicates: true }
      )
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else {
    // Idempotent: deleting rows that aren't there is a no-op, so a double-tap
    // or a retried request can't fail.
    const { error } = await supabase
      .from("guide_unavailable_dates")
      .delete()
      .eq("guide_id", guide.id)
      .in("date", clean)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, changed: clean.length })
}
```

- [ ] **Step 2: Verify it rejects an unauthenticated caller**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/studio/availability \
  -H 'Content-Type: application/json' -d '{"dates":["2099-01-01"],"action":"block"}'
```

Expected: `401`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/studio/availability/route.ts
git commit -m "feat(studio): add availability block/unblock endpoint"
```

---

### Task 6: Booking API guard

**Files:**
- Modify: `src/app/api/guides/bookings/route.ts` (inside `POST`, after the guide lookup, before the insert)

**Interfaces:**
- Consumes: `isDateBookable` (Task 3).

- [ ] **Step 1: Add the import**

```ts
import { isDateBookable } from "@/lib/guides/availabilityData"
```

- [ ] **Step 2: Insert the guard immediately after the `if (!guide) return … 404` line**

```ts
  // Authoritative availability check. The calendar disabling a day is a
  // convenience; without this anyone can curl a booking onto a blocked date.
  if (!(await isDateBookable(guideId, tripDate))) {
    return NextResponse.json({ error: "date unavailable" }, { status: 409 })
  }
```

- [ ] **Step 3: Confirm the auth gate still fires first**

`POST /api/guides/bookings` requires a session, so the 409 path **cannot** be
reached logged-out and credential entry is prohibited. Verify only what is
reachable:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/guides/bookings \
  -H 'Content-Type: application/json' \
  -d '{"guideId":"x","tripDate":"2099-01-01","hours":5}'
```

Expected: `401` — the guard sits after auth and does not change that.

The 409 branch's correctness rests on `isDateBookable`, which is built from the
unit-tested `resolveDayState` (Task 2). Record in Task 10 that the end-to-end
409 needs the user's logged-in pass. Do **not** claim it was verified.

- [ ] **Step 4: Typecheck and commit**

```bash
npx tsc --noEmit
git add src/app/api/guides/bookings/route.ts
git commit -m "feat(guides): reject bookings on unavailable dates"
```

---

### Task 7: Studio availability page

**Files:**
- Create: `src/components/studio/AvailabilityCalendar.tsx`
- Create: `src/app/[locale]/(studio)/studio/availability/page.tsx`

**Interfaces:**
- Consumes: `resolveDayState`, `toDateKey`, `MAX_MONTHS_AHEAD` (Task 2); `loadAvailability` (Task 3); `getCurrentGuide` from `@/lib/guides/current`; `POST /api/studio/availability` (Task 5).
- Produces: `<AvailabilityCalendar guideId={string} initialBlocked={string[]} booked={string[]} />`

- [ ] **Step 1: Write the client component**

```tsx
"use client"

import * as React from "react"
import { mn } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  MAX_MONTHS_AHEAD,
  resolveDayState,
  toDateKey,
} from "@/lib/guides/availability"

const SWATCH = {
  available: "bg-card border border-border",
  blocked: "bg-primary",
  booked: "bg-saffron",
  past: "bg-muted",
} as const

export function AvailabilityCalendar({
  initialBlocked,
  booked,
}: {
  initialBlocked: string[]
  booked: string[]
}) {
  const [blocked, setBlocked] = React.useState<Set<string>>(
    () => new Set(initialBlocked)
  )
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [rangeFrom, setRangeFrom] = React.useState("")
  const [rangeTo, setRangeTo] = React.useState("")

  const bookedSet = React.useMemo(() => new Set(booked), [booked])
  const today = toDateKey(new Date())
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_AHEAD)

  async function send(dates: string[], action: "block" | "unblock") {
    if (dates.length === 0) return
    setBusy(true)
    setError(null)

    // Optimistic — the calendar must feel instant; reverted on failure.
    const snapshot = new Set(blocked)
    const next = new Set(blocked)
    for (const d of dates) action === "block" ? next.add(d) : next.delete(d)
    setBlocked(next)

    try {
      const res = await fetch("/api/studio/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates, action }),
      })
      if (!res.ok) {
        setBlocked(snapshot)
        setError(
          res.status === 409
            ? "Захиалгатай өдрийг өөрчлөх боломжгүй."
            : "Хадгалахад алдаа гарлаа. Дахин оролдоно уу."
        )
      }
    } catch {
      setBlocked(snapshot)
      setError("Сүлжээний алдаа гарлаа.")
    } finally {
      setBusy(false)
    }
  }

  // onDayClick, not onSelect: in react-day-picker's single mode, clicking the
  // already-selected day fires onSelect with `undefined`, so a day could be
  // blocked but never unblocked by clicking it again.
  function toggle(day: Date) {
    const key = toDateKey(day)
    const state = resolveDayState(key, { today, blocked, booked: bookedSet })
    // past and booked days are not the guide's to change
    if (state === "past" || state === "booked") return
    void send([key], state === "blocked" ? "unblock" : "block")
  }

  function blockRange() {
    if (!rangeFrom || !rangeTo || rangeFrom > rangeTo) {
      setError("Огнооны мужаа зөв сонгоно уу.")
      return
    }
    const dates: string[] = []
    const cursor = new Date(`${rangeFrom}T00:00:00`)
    const end = new Date(`${rangeTo}T00:00:00`)
    while (cursor <= end) {
      const key = toDateKey(cursor)
      const state = resolveDayState(key, { today, blocked, booked: bookedSet })
      if (state === "available") dates.push(key)
      cursor.setDate(cursor.getDate() + 1)
    }
    if (dates.length === 0) {
      setError("Сонгосон мужид нээлттэй өдөр алга.")
      return
    }
    void send(dates, "block")
    setRangeFrom("")
    setRangeTo("")
  }

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-border bg-card p-4">
        <Calendar
          mode="single"
          onDayClick={toggle}
          locale={mn}
          weekStartsOn={1}
          // Sold days are disabled, not merely ignored on click — a day that
          // looks tappable but silently does nothing reads as a broken UI.
          disabled={(day: Date) => {
            if (day > maxDate) return true
            const s = resolveDayState(toDateKey(day), {
              today,
              blocked,
              booked: bookedSet,
            })
            return s === "past" || s === "booked"
          }}
          formatters={{
            formatCaption: (month: Date) =>
              `${month.getFullYear()} · ${month.getMonth() + 1}-р сар`,
          }}
          modifiers={{
            blocked: (d: Date) => blocked.has(toDateKey(d)),
            booked: (d: Date) => bookedSet.has(toDateKey(d)),
          }}
          modifiersClassNames={{
            blocked: "bg-primary text-white rounded-md",
            booked: "bg-saffron text-white rounded-md",
          }}
          className="w-full"
        />

        <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
          {(
            [
              ["available", "Боломжтой"],
              ["blocked", "Хаасан"],
              ["booked", "Захиалгатай"],
              ["past", "Өнгөрсөн"],
            ] as const
          ).map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-[3px]", SWATCH[key])} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Хугацаа хаах
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={rangeFrom}
            min={today}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="rounded-well border border-border bg-card px-2.5 py-1.5 text-[13px]"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={rangeTo}
            min={rangeFrom || today}
            onChange={(e) => setRangeTo(e.target.value)}
            className="rounded-well border border-border bg-card px-2.5 py-1.5 text-[13px]"
          />
          <Button variant="message" size="sm" onClick={blockRange} disabled={busy}>
            Хаах
          </Button>
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          Амралт, аялалд явах өдрүүдээ нэг дор хаана.
        </p>
      </div>

      {error && <p className="text-[12.5px] text-destructive">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Write the page**

```tsx
import { redirect } from "next/navigation"

import { getCurrentGuide } from "@/lib/guides/current"
import { loadAvailability } from "@/lib/guides/availabilityData"
import { AvailabilityCalendar } from "@/components/studio/AvailabilityCalendar"
import { MAX_MONTHS_AHEAD, toDateKey } from "@/lib/guides/availability"

/**
 * `/studio/availability` (Боломжит өдөр) — blocklist editor. A guide is
 * bookable unless they say otherwise; confirmed bookings close their day
 * automatically and are not editable here.
 */
export default async function StudioAvailabilityPage() {
  const ctx = await getCurrentGuide()
  if (!ctx) redirect("/guides/apply")

  const from = toDateKey(new Date())
  const end = new Date()
  end.setMonth(end.getMonth() + MAX_MONTHS_AHEAD)
  const to = toDateKey(end)

  const { blocked, booked } = await loadAvailability(ctx.guide.id, from, to)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold md:text-3xl">
          Боломжит өдөр
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ажиллах боломжгүй өдрөө хаана. Хаагаагүй өдөр бүр захиалгад нээлттэй.
        </p>
      </header>

      <AvailabilityCalendar initialBlocked={blocked} booked={booked} />
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/components/studio/AvailabilityCalendar.tsx "src/app/[locale]/(studio)/studio/availability/page.tsx"
git commit -m "feat(studio): add availability page"
```

---

### Task 8: Studio navigation entry

**Files:**
- Modify: `src/components/studio/StudioSidebar.tsx:58-63` (the nav item array)
- Modify: `src/components/studio/StudioTabBar.tsx:18-24` (only if a 5th tab fits)

**Interfaces:**
- Consumes: the `/studio/availability` route from Task 7.

- [ ] **Step 1: Add the sidebar entry**

Import `CalendarDays` from `lucide-react`, then insert directly after the
`/studio/bookings` item so availability sits beside Захиалга:

```tsx
    { href: "/studio/availability", label: "Боломжит өдөр", icon: CalendarDays },
```

- [ ] **Step 2: Check whether the mobile tab bar can take a 5th tab**

Read `StudioTabBar.tsx`. It currently renders 4 tabs split around a centre FAB.
If adding a 5th unbalances that split, **do not add it** — the page is reachable
from the sidebar on desktop and from the dashboard on mobile. Record the choice
in the commit message.

- [ ] **Step 3: Verify the route renders**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/studio/availability
```

Expected: `307` (redirect to `/login`) when logged out — proving the guard runs
and the route exists. A `404` means the route was not created correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/studio/StudioSidebar.tsx src/components/studio/StudioTabBar.tsx
git commit -m "feat(studio): link availability page in studio nav"
```

---

### Task 9: Wire availability into the booking calendar

**Files:**
- Modify: `src/components/guides/BookGuideDialog.tsx` (the `Calendar` block and the legend)

**Interfaces:**
- Consumes: `GET /api/guides/[id]/availability` (Task 4); `resolveDayState`, `toDateKey`, `MAX_MONTHS_AHEAD` (Task 2).

- [ ] **Step 1: Add availability state and the fetch**

Inside the component, after the existing `useState` declarations:

```tsx
  const [blocked, setBlocked] = React.useState<Set<string>>(new Set())
  const [booked, setBooked] = React.useState<Set<string>>(new Set())

  // Fetch when the dialog opens, not on mount — a guide card that is never
  // clicked should cost nothing.
  React.useEffect(() => {
    if (!open) return
    const from = toDateKey(new Date())
    const end = new Date()
    end.setMonth(end.getMonth() + MAX_MONTHS_AHEAD)
    let cancelled = false

    fetch(`/api/guides/${guide.id}/availability?from=${from}&to=${toDateKey(end)}`)
      .then((r) => (r.ok ? r.json() : { blocked: [], booked: [] }))
      .then((d: { blocked: string[]; booked: string[] }) => {
        if (cancelled) return
        setBlocked(new Set(d.blocked))
        setBooked(new Set(d.booked))
      })
      .catch(() => {
        // Availability unknown → calendar stays open; the API guard still
        // rejects an unavailable date on submit.
      })

    return () => {
      cancelled = true
    }
  }, [open, guide.id])
```

- [ ] **Step 2: Feed it to the day picker**

Replace the existing `disabled={{ before: new Date() }}` with:

```tsx
                    disabled={(day: Date) =>
                      resolveDayState(toDateKey(day), {
                        today: toDateKey(new Date()),
                        blocked,
                        booked,
                      }) !== "available"
                    }
```

- [ ] **Step 3: Add the Захиалгатай swatch to the legend**

After the existing "Боломжгүй" legend entry:

```tsx
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[3px] bg-saffron" />
                    Захиалгатай
                  </span>
```

- [ ] **Step 4: Add the import**

```tsx
import {
  MAX_MONTHS_AHEAD,
  resolveDayState,
  toDateKey,
} from "@/lib/guides/availability"
```

Remove the local `toDateKey` defined in this file and use the shared one, so
the studio editor and the booking calendar cannot disagree about what day a
`Date` is.

- [ ] **Step 5: Verify a blocked date is disabled in the browser**

Get the guide id shown first on `/guides` (`select id, name from guides limit 1;`),
pick a date ~1 week out, and block it via `execute_sql`. Then open `/guides`,
click Захиалах, and check that day is not selectable:

```sql
insert into public.guide_unavailable_dates (guide_id, date)
values ('GUIDE_UUID', 'YYYY-MM-DD') on conflict do nothing;
```

In the browser console (via `javascript_tool`), after opening the dialog:

```js
[...document.querySelectorAll('[role="dialog"] button')]
  .filter(b => b.textContent.trim() === 'DAY_NUMBER')
  .map(b => b.disabled)
```

(`DAY_NUMBER` is the day-of-month you blocked, e.g. `'3'`.)
Expected: `[true]`. Then delete the row again:

```sql
delete from public.guide_unavailable_dates
where guide_id = 'GUIDE_UUID' and date = 'YYYY-MM-DD';
```

- [ ] **Step 6: Typecheck and commit**

```bash
npx tsc --noEmit
git add src/components/guides/BookGuideDialog.tsx
git commit -m "feat(guides): respect guide availability in the booking calendar"
```

---

### Task 10: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Unit tests**

Run: `npm test`
Expected: all suites pass, including the 11 new `availability.test.ts` cases.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Production build**

Run: `npx next build`
Expected: exit 0. A pre-existing `INVALID_MESSAGE: INVALID_TAG` warning from
the `Privacy.*.content` messages in `mn.json` is expected and unrelated — it is
non-fatal and predates this work.

- [ ] **Step 4: Lint the new files**

Run: `npx eslint src/lib/guides/availability.ts src/lib/guides/availabilityData.ts src/components/studio/AvailabilityCalendar.tsx "src/app/api/studio/availability/route.ts" "src/app/api/guides/[id]/availability/route.ts"`
Expected: no findings.

- [ ] **Step 5: Check the studio page markup at both breakpoints**

The page is auth-gated, so it cannot be loaded logged-out. Verify the layout on
the component instead: render `AvailabilityCalendar` on a scratch route with
fixture props (`initialBlocked` = 2 dates, `booked` = 1 date), then at 1440×900
and 375×812 confirm via `javascript_tool`:

```js
JSON.stringify({
  docW: document.documentElement.scrollWidth,
  viewportW: window.innerWidth,
  overflow: document.documentElement.scrollWidth > window.innerWidth,
  legend: [...document.querySelectorAll('span')].map(s=>s.textContent.trim())
    .filter(t=>['Боломжтой','Хаасан','Захиалгатай','Өнгөрсөн'].includes(t)),
})
```

Expected: `overflow: false` at both widths and all four legend labels present.

**Delete the scratch route immediately afterwards**, and confirm with
`git status` that nothing under `src/app` is left untracked. A scratch route
under `/studio` needs no `i18n/routing.ts` entry; one under a public segment
would — do not add one.

- [ ] **Step 6: Confirm no stray rows were left by testing**

```sql
select guide_id, date from public.guide_unavailable_dates order by date;
```

Expected: only rows the user intentionally created. Delete any left over from
Task 6 / Task 9 verification.

- [ ] **Step 7: Report the verification gap**

State plainly that the logged-in studio page was **not** exercised end-to-end
(credential entry is prohibited), and that the user needs to confirm:

- toggling a day persists across a reload,
- the range control blocks a holiday,
- a sold day renders saffron and is not clickable,
- `POST /api/guides/bookings` returns 409 for a blocked date (the guard from
  Task 6, whose 409 branch is unreachable logged-out).

Do not describe any of these as verified.
