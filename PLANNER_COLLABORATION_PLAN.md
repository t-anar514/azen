# Planner Collaboration & Budget-Splitting — Development Plan

Turns `/planner` from a solo trip-builder with a read-only share link into a
tool friends can plan and budget a trip in together, on accurate exchange
rates. Four phases, meant to ship in order — each one is buildable and
useful on its own, and each depends on the one before it.

| Phase | What it ships | Depends on | Est. effort |
|---|---|---|---|
| 0 | Real, cached exchange rates (kills the fake hardcoded FX math) | — | 0.5–1 day |
| 1 | Invite friends as real editors, live sync | Phase 0 helps but isn't required | 3–5 days |
| 2 | Who-paid / who-owes budget splitting | Phase 1 (needs real participants) | 4–6 days |
| 3 | Claim-trip flow, transfer/flight cross-linking, category breakdown | Independent — slot in anytime | 2–3 days |

**Before touching any of this:** confirm migrations `0001`–`0006` are actually
applied to the live Supabase project. Per project notes they were restored on
disk but never confirmed run — `0008` and `0009` below both hard-depend on
`public.itineraries` from `0004_itineraries.sql`, so they'll fail outright if
that isn't live yet. Check via the Supabase SQL editor (`select * from
public.itineraries limit 1;`) or `supabase migration list` before starting.

---

## Phase 0 — Real exchange rates

**Problem:** `CostFooter.tsx`, `TimelineItem.tsx`, and `SharedItineraryView.tsx`
each hardcode their own conversion (`val * 22` for MNT, `val / 150` for USD),
duplicated three times, and the code literally comments "Random static rate
for demo." Fine for a prototype, not fine once friends are splitting real
money on these numbers.

**Data source:** [`fawazahmed0/exchange-api`](https://github.com/fawazahmed0/exchange-api)
— free, no key, no rate limit, served as static JSON off jsDelivr's CDN
(daily-updated). Verified it returns MNT (confirmed today: 1 JPY ≈ 22.33–22.46
MNT depending on source/day) — Frankfurter, the other common free option,
does **not** support MNT, so it's ruled out. Cloudflare Pages fallback is
documented in case jsDelivr is ever unreachable.

```
Primary:  https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json
Fallback: https://latest.currency-api.pages.dev/v1/currencies/jpy.json
```

### 1. Migration — `supabase/migrations/0007_exchange_rates.sql`

```sql
-- Cached FX rates for the planner's budget display. Single source of truth,
-- replacing the hardcoded "val * 22" / "val / 150" guesses duplicated across
-- CostFooter/TimelineItem/SharedItineraryView. Refreshed daily by a cron
-- route hitting a free, keyless FX API — app costs are stored in JPY, so we
-- only ever need JPY as the base.

create table if not exists public.exchange_rates (
  id smallint primary key default 1 check (id = 1), -- singleton: one cached snapshot
  base_currency text not null default 'JPY',
  rates jsonb not null,          -- { "JPY": 1, "USD": 0.0067, "MNT": 22.3 }
  source text not null default 'fawazahmed0/exchange-api',
  fetched_at timestamptz not null default now()
);

-- Rough seed so the app has a sane value before the first cron run.
insert into public.exchange_rates (id, base_currency, rates)
values (1, 'JPY', '{"JPY":1,"USD":0.0067,"MNT":22.3}'::jsonb)
on conflict (id) do nothing;

alter table public.exchange_rates enable row level security;

-- Rates aren't sensitive — anyone can read. Only the cron route writes,
-- using the service-role client (src/lib/supabase/admin.ts), which bypasses
-- RLS entirely, so no insert/update policy is needed for normal users.
drop policy if exists "exchange_rates_public_read" on public.exchange_rates;
create policy "exchange_rates_public_read" on public.exchange_rates
  for select using (true);
```

### 2. Fetch logic — `src/lib/currency/fetchRates.ts`

```ts
import "server-only"

const PRIMARY = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json"
const FALLBACK = "https://latest.currency-api.pages.dev/v1/currencies/jpy.json"

export async function fetchLatestJpyRates(): Promise<Record<string, number>> {
  for (const url of [PRIMARY, FALLBACK]) {
    try {
      const res = await fetch(url, { cache: "no-store" })
      if (!res.ok) continue
      const data = await res.json()
      const jpy = data.jpy
      return { JPY: 1, USD: jpy.usd, MNT: jpy.mnt }
    } catch {
      continue // try the fallback host
    }
  }
  throw new Error("Both FX sources failed")
}
```

### 3. Cron route — `src/app/api/cron/exchange-rates/route.ts`

```ts
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchLatestJpyRates } from "@/lib/currency/fetchRates"

// Vercel Cron hits this once a day. Protected by CRON_SECRET so randoms
// can't trigger it (and hammer the upstream API on our behalf).
export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rates = await fetchLatestJpyRates()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("exchange_rates")
      .upsert({ id: 1, base_currency: "JPY", rates, fetched_at: new Date().toISOString() })

    if (error) throw error
    return NextResponse.json({ ok: true, rates })
  } catch (err) {
    // Deliberately don't touch the cached row on failure — yesterday's real
    // rate is a better fallback than no rate or a crash.
    console.error("exchange-rates cron failed:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
```

`vercel.json` (new file at repo root):

```json
{
  "crons": [
    { "path": "/api/cron/exchange-rates", "schedule": "0 3 * * *" }
  ]
}
```

Add `CRON_SECRET` to `.env.local.example` and Vercel project env vars. (If
self-hosting instead of Vercel per `DEPLOYMENT_GUIDE.md` Option B, swap the
Vercel Cron trigger for a plain system cron job that curls the route with the
same header.)

### 4. Shared conversion util — `src/lib/currency/format.ts`

```ts
export type Currency = "MNT" | "USD" | "JPY"

// Replaces the three copy-pasted formatCost/formatCurrency implementations.
// Costs are always stored in JPY; `rates` comes from the exchange_rates row.
export function formatCurrency(
  amountJpy: number,
  currency: Currency,
  rates: Record<string, number>
): string {
  const rate = rates[currency] ?? (currency === "JPY" ? 1 : null)
  if (rate == null) return `¥${amountJpy.toLocaleString("en-US")}` // safe fallback

  switch (currency) {
    case "MNT":
      return `₮ ${Math.round(amountJpy * rate).toLocaleString("en-US")}`
    case "USD":
      return `$ ${(amountJpy * rate).toFixed(2)}`
    default:
      return `¥${amountJpy.toLocaleString("en-US")}`
  }
}
```

### 5. Wiring

- `planner/page.tsx` fetches the `exchange_rates` singleton row once on
  mount (or a wrapping server component fetches it and passes it down),
  keeps it in state, and threads it as a `rates` prop through `Timeline` →
  `TimelineItem`, and into `CostFooter`.
- `planner/shared/[id]/page.tsx` (feeds `SharedItineraryView`) does the same
  server-side.
- Delete the three local `formatCost`/`formatCurrency` functions; call the
  shared util instead.
- Add a small caption near the total: "Ханшийн огноо: {fetched_at}" (rates as
  of `fetched_at`), so it's honest about not being live-market data.
- If the client-side fetch of the rates row ever fails, keep whatever rates
  are already in state (or the migration's seed values) — never show a blank
  or crash over a currency label.

**Ship this first.** Phase 2's per-person balances are only trustworthy if
the underlying FX math is real.

---

## Phase 1 — Real collaboration (not just read-only sharing)

**Problem:** `ShareModal.tsx` only toggles a trip `is_public` and hands out a
view-only link. There's no invite, no second editor, no live sync — one
owner, everyone else a spectator.

### 1. Migration — `supabase/migrations/0008_trip_collaborators.sql`

```sql
-- Turns /planner sharing from "owner edits, everyone else views" into real
-- multi-editor collaboration. A trip keeps exactly one owner
-- (itineraries.owner_id, unchanged) plus zero or more collaborators with an
-- editor/viewer role. Invites are matched by email; a collaborator row
-- starts 'pending' and flips to 'accepted' when the invited user opens the
-- invite link while logged in with a matching email.

-- profiles needs an email column so a pending invite can be matched to a
-- real account without an admin-only lookup against auth.users.
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Backfill existing accounts.
update public.profiles p set email = u.email
from auth.users u where u.id = p.id and p.email is null;

do $$ begin
  create type public.collaborator_role as enum ('editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.collaborator_status as enum ('pending', 'accepted');
exception when duplicate_object then null; end $$;

create table if not exists public.trip_collaborators (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  invited_email text not null,
  user_id uuid references public.profiles(id) on delete cascade, -- filled in on accept
  role public.collaborator_role not null default 'editor',
  status public.collaborator_status not null default 'pending',
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, invited_email)
);

drop trigger if exists trg_trip_collaborators_touch on public.trip_collaborators;
create trigger trg_trip_collaborators_touch
  before update on public.trip_collaborators
  for each row execute function public.touch_updated_at();

-- ── reusable access-check helpers (also used by Phase 2's tables) ──
create or replace function public.can_edit_trip(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.itineraries t where t.id = p_trip_id and t.owner_id = auth.uid())
    or exists (
      select 1 from public.trip_collaborators c
      where c.trip_id = p_trip_id and c.user_id = auth.uid()
        and c.status = 'accepted' and c.role = 'editor'
    )
    or public.is_admin();
$$;

create or replace function public.can_view_trip(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select public.can_edit_trip(p_trip_id)
    or exists (select 1 from public.itineraries t where t.id = p_trip_id and t.is_public = true)
    or exists (
      select 1 from public.trip_collaborators c
      where c.trip_id = p_trip_id and c.user_id = auth.uid() and c.status = 'accepted'
    );
$$;

-- ── extend itineraries RLS to use the helpers ──
drop policy if exists "itineraries_select" on public.itineraries;
create policy "itineraries_select" on public.itineraries
  for select using (public.can_view_trip(id));

drop policy if exists "itineraries_update" on public.itineraries;
create policy "itineraries_update" on public.itineraries
  for update using (public.can_edit_trip(id)) with check (public.can_edit_trip(id));

-- ── trip_collaborators RLS ──
alter table public.trip_collaborators enable row level security;

drop policy if exists "trip_collaborators_select" on public.trip_collaborators;
create policy "trip_collaborators_select" on public.trip_collaborators
  for select using (
    user_id = auth.uid()
    or invited_email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "trip_collaborators_insert" on public.trip_collaborators;
create policy "trip_collaborators_insert" on public.trip_collaborators
  for insert with check (
    exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
  );

-- Covers two very different actions under one policy: the owner managing
-- (changing role, re-sending), and the invited user accepting their own
-- pending invite by matching email — see the accept flow below.
drop policy if exists "trip_collaborators_update" on public.trip_collaborators;
create policy "trip_collaborators_update" on public.trip_collaborators
  for update using (
    invited_email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "trip_collaborators_delete" on public.trip_collaborators;
create policy "trip_collaborators_delete" on public.trip_collaborators
  for delete using (
    exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

create index if not exists idx_trip_collaborators_trip on public.trip_collaborators (trip_id);
create index if not exists idx_trip_collaborators_user on public.trip_collaborators (user_id);
create index if not exists idx_trip_collaborators_email on public.trip_collaborators (invited_email);
```

### 2. Invite UI — extend `ShareModal.tsx`

Add an "Invite a collaborator" section below the existing public-link toggle:
email input + editor/viewer select + "Create invite" button, which inserts a
`trip_collaborators` row (allowed by `trip_collaborators_insert` since the
caller owns the trip) and surfaces a copyable link:

```
/planner/invite/[collaboratorId]
```

No transactional email is wired up anywhere in the app yet, so v1 reuses the
exact pattern the public-link toggle already validated: the owner copies the
link and sends it themselves (WhatsApp, Messenger, etc.). Note for later:
wiring up Resend or Postmark to actually send the invite email is a clean,
independent follow-up — don't block this phase on it.

### 3. Accept flow — new page `src/app/[locale]/planner/invite/[id]/page.tsx`

1. Look up the `trip_collaborators` row by id.
2. If not logged in → redirect to `/login?redirectTo=/planner/invite/[id]`
   (same param the login link in `ShareModal.tsx` already uses).
3. Once logged in, run the claim as the logged-in user with the normal
   session-bound client (no admin client needed — the RLS policy above
   already allows a user to update a pending row addressed to their own
   email):

```ts
await supabase
  .from("trip_collaborators")
  .update({ user_id: currentUserId, status: "accepted" })
  .eq("id", collaboratorId)
  .eq("invited_email", currentUserEmail)
  .eq("status", "pending")
```

4. Redirect to `/planner?trip=[tripId]`.

### 4. Live sync — `src/hooks/usePlannerRealtime.ts`

The existing save is a 2-second-debounced whole-row upsert — fine for one
editor, a real race once two people can edit the same trip. Scope for v1:
**last-write-wins at the row level, but propagated within ~1 second** via
Supabase Realtime, not true conflict-free merging (no CRDT/OT). Good enough
for "planning together on a call"; flag proper per-item merge as deliberately
deferred v2 scope rather than building it now.

```ts
export function usePlannerRealtime(tripId: string | null, onRemoteChange: (row: ItineraryRow) => void) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    if (!tripId) return
    const channel = supabase
      .channel(`itinerary:${tripId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "itineraries", filter: `id=eq.${tripId}` },
        (payload) => onRemoteChange(payload.new as ItineraryRow)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId, supabase, onRemoteChange])
}
```

Wire into `planner/page.tsx`: on a remote change, merge in `items`/`title`/
`settings` unless the local client is mid-edit (e.g., skip the merge while
the debounce timer from the last local edit is still pending, to avoid
clobbering what the user is actively typing).

Stretch/optional: Supabase Presence on the same channel to show avatars of
who's currently viewing the trip. Nice polish, not required for v1.

### 5. Role-gated UI

Planner page determines the current user's role on load (owner / editor /
viewer / anonymous-public) and hides add/edit/delete/drag controls for
viewers — reuse `SharedItineraryView.tsx`'s read-only layout patterns rather
than writing a second one from scratch.

---

## Phase 2 — Group budget splitting

**Problem:** every activity has one cost, the footer shows one flat total,
and nothing tracks who paid or who owes what.

**Design note:** splitting needs a roster of *people*, which isn't quite the
same set as `trip_collaborators` (app access) — someone's partner might need
to be in the cost split without ever logging into Azen. So this phase adds a
separate, lighter `trip_participants` concept: a person in the split, who
may or may not correspond to a real account.

### 1. Migration — `supabase/migrations/0009_trip_budget_split.sql`

```sql
-- Budget splitting for /planner. Deliberately decoupled from
-- trip_collaborators (app access) — a participant can be a real Azen user
-- (user_id set) or a "ghost" person the owner adds by name only.
create table if not exists public.trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  color text, -- UI avatar chip color, assigned client-side on creation
  created_at timestamptz not null default now()
);

-- Per-item cost assignment. NOTE: items live inside itineraries.items as a
-- single jsonb array, not as their own rows, so item_id is a loose reference
-- into that array (matches ItemType.id in src/components/planner/Timeline.tsx)
-- rather than a real foreign key — Postgres can't FK into a jsonb array
-- element. The app is responsible for deleting the matching split row when
-- an item is deleted from the array. This is a deliberate shortcut to avoid
-- normalizing items into their own table right now; revisit if that jsonb
-- design ever becomes a real bottleneck.
create table if not exists public.item_cost_splits (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  item_id text not null,
  paid_by uuid references public.trip_participants(id) on delete set null,
  split_between uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, item_id)
);

drop trigger if exists trg_item_cost_splits_touch on public.item_cost_splits;
create trigger trg_item_cost_splits_touch
  before update on public.item_cost_splits
  for each row execute function public.touch_updated_at();

alter table public.trip_participants enable row level security;
alter table public.item_cost_splits enable row level security;

drop policy if exists "trip_participants_select" on public.trip_participants;
create policy "trip_participants_select" on public.trip_participants
  for select using (public.can_view_trip(trip_id));

drop policy if exists "trip_participants_write" on public.trip_participants;
create policy "trip_participants_write" on public.trip_participants
  for all using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));

drop policy if exists "item_cost_splits_select" on public.item_cost_splits;
create policy "item_cost_splits_select" on public.item_cost_splits
  for select using (public.can_view_trip(trip_id));

drop policy if exists "item_cost_splits_write" on public.item_cost_splits;
create policy "item_cost_splits_write" on public.item_cost_splits
  for all using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));

create index if not exists idx_trip_participants_trip on public.trip_participants (trip_id);
create index if not exists idx_item_cost_splits_trip on public.item_cost_splits (trip_id);
```

### 2. Balance math — `src/lib/budget/splitBalances.ts`

Computed client-side (item count per trip is small — tens, not thousands —
so a jsonb-array SQL view isn't worth the complexity):

```ts
export interface TripParticipant { id: string; displayName: string; color?: string }
export interface CostSplit { itemId: string; paidBy: string; splitBetween: string[] }

export interface Balance { participantId: string; net: number } // +net = owed money, -net = owes money
export interface Settlement { from: string; to: string; amountJpy: number }

export function computeBalances(
  items: ItemType[],
  splits: CostSplit[],
  participants: TripParticipant[]
): Balance[] {
  const net = new Map(participants.map((p) => [p.id, 0]))
  const splitByItem = new Map(splits.map((s) => [s.itemId, s]))

  for (const item of items) {
    const split = splitByItem.get(item.id)
    if (!split || !item.cost) continue
    const share = item.cost / split.splitBetween.length
    for (const participantId of split.splitBetween) {
      net.set(participantId, (net.get(participantId) ?? 0) - share)
    }
    net.set(split.paidBy, (net.get(split.paidBy) ?? 0) + item.cost)
  }

  return Array.from(net, ([participantId, amount]) => ({ participantId, net: Math.round(amount) }))
}

// Greedy debt simplification (standard Splitwise-style settle-up): match the
// biggest creditor against the biggest debtor repeatedly, instead of showing
// a full N×N "who owes whom for what" matrix.
export function simplifyDebts(balances: Balance[]): Settlement[] {
  const creditors = balances.filter((b) => b.net > 0).map((b) => ({ ...b })).sort((a, b) => b.net - a.net)
  const debtors = balances.filter((b) => b.net < 0).map((b) => ({ ...b, net: -b.net })).sort((a, b) => b.net - a.net)
  const settlements: Settlement[] = []

  let i = 0, j = 0
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].net, debtors[j].net)
    if (amount > 0) {
      settlements.push({ from: debtors[j].participantId, to: creditors[i].participantId, amountJpy: amount })
    }
    creditors[i].net -= amount
    debtors[j].net -= amount
    if (creditors[i].net === 0) i++
    if (debtors[j].net === 0) j++
  }
  return settlements
}
```

Unit-test both functions directly — pure functions, no I/O, cheap to verify
against a few hand-worked examples (see verification checklist at the end).

### 3. UI additions

- Participant chip row at the top of `Timeline.tsx`: shows current
  participants, "+ add" opens a small form (name only → creates a ghost
  `trip_participants` row; or "invite as collaborator" → hands off to the
  Phase 1 invite flow).
- `TimelineItem.tsx` edit mode gains two fields: **Paid by** (single-select
  from participants) and **Split between** (multi-select chips, defaults to
  all current participants) — persisted via an upsert to `item_cost_splits`
  alongside the existing `onUpdate` call.
- New **Balances** panel (a tab or a new modal triggered from `CostFooter.tsx`
  next to the existing Settings/Share icons): per-person net, then the
  simplified settle-up list ("Bat → Sarah: ¥18,400").

---

## Phase 3 — Polish & ecosystem integration

Lower priority, no interdependencies — slot in wherever convenient.

**Claim-trip flow for anonymous users.** Right now a guest's itinerary lives
only in `localStorage`; clearing the browser loses it silently, and there's
no bridge into an account after signup. Add a `useClaimLocalTrip()` hook that
runs once post-login: if `azen_itinerary_items` has data and the user has no
cloud trip yet, prompt "import your planned trip," push it through the
existing cloud-insert path in `planner/page.tsx`, then clear the local copy.

**Cross-link transfers/flights into the planner.** The transfer and flight
booking flows (`src/lib/transfers/`, `src/app/api/transfer/*`, the flights
pages) are already real, actively-developed features — but they're an island
from the planner even though a confirmed transfer or flight is exactly the
kind of thing that belongs on the itinerary timeline. Add an "Add to my trip
planner" action on the booking confirmation pages
(`transfer/confirmation/[id]`, flight booking confirmation) that appends a
prefilled `ItemType` (type `flight`/`car`, real cost, date, location) to the
user's active itinerary via the same update path `addItem`/`updateItem`
already use. No new tables — a small helper plus a button.

**Per-category budget breakdown.** Pure derived UI, zero schema change:
group existing `items` by `type` (the icon categories already defined in
`TimelineItem.tsx` — sights/food/transport/stay/shop/other) and show a small
bar or donut chart in the Settings or new Balances panel. Good candidate to
build alongside Phase 2's Balances panel since it's the same screen.

---

## Verification checklist

- [ ] Confirm migrations `0001`–`0006` are actually applied to the live
      Supabase project before running `0007`+ (see note at the top).
- [ ] RLS: log in as a user with no relationship to a private trip, confirm
      `select` on it returns zero rows.
- [ ] RLS: log in as a `viewer`-role collaborator, confirm an `update` on the
      trip is rejected.
- [ ] RLS: confirm a user can accept only an invite whose `invited_email`
      matches their own `profiles.email`, not anyone else's pending invite.
- [ ] Realtime: open the same trip in two browser sessions as owner +
      accepted editor, edit in one, confirm the other converges within ~1s.
- [ ] Currency: block the FX endpoints locally, confirm the app falls back to
      the last cached/seed rate instead of crashing or showing a blank.
- [ ] Budget math: unit-test `computeBalances()` and `simplifyDebts()`
      against a few hand-worked 3-person, uneven-split examples.
- [ ] Deleting an item also deletes its `item_cost_splits` row (no orphaned
      splits pointing at a since-deleted `item_id`).
