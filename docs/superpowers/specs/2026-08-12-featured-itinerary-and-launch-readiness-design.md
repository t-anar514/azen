# Featured itinerary data + launch readiness

Date: 2026-08-12
Branch: `feat/sprint2-places-city-hub`

## Problem

The homepage banner "Намрийн 14 хоног аялал" advertises a 14-day autumn trip
through Tokyo · Hakone · Kyoto · Osaka · Hiroshima for ¥285,000. Clicking
"Төлөвлөгчид нэмэх" drops the visitor into the planner's hardcoded default
itinerary — three items: Narita arrival, an Asakusa hotel check-in, and
Senso-ji. Nothing the banner promised.

### Root cause

`FeaturedItinerary.tsx:34` links to a bare `/planner`. The planner already
supports templates (`planner/page.tsx:120`, `?template=<id>`), so with no
param it falls through to branch 3, the default initialisation.

### Why wiring the link alone is not enough

The template the banner refers to is `golden-route` — `mn.json` titles it
exactly "Намрийн 14 Хоног Аялал" and its summary lists the banner's cities
word-for-word. That record is not fit to ship:

| Defect | Detail |
| --- | --- |
| Sparse | 7 activities covering a 14-day trip; days 3, 5, 8, 9, 11, 13, 14 empty |
| Past dates | Hardcoded `2025-05-01`…`2025-05-12`; today is 2026-08-12 |
| Wrong season | May is spring; the trip is named "Намрийн" (autumn) |
| Three prices | Items sum to ¥32,000, `basePrice` is ¥250,000, banner says ¥285,000 |
| Date desync | Loader sets trip settings to today→+14d but leaves item dates at 2025-05, so the timeline renders May 2025 items inside an Aug 2026 trip |
| Wrong language | Activity titles are English ("Arrival at Narita") on a Mongolian-only site |

## Goals

1. The banner CTA opens a complete, correctly-dated 14-day autumn itinerary.
2. The advertised price equals what the planner's cost footer computes.
3. The trip can never go stale or drift from the banner again.
4. Produce a prioritised pre-launch checklist for the owner to triage.

## Non-goals

- Moving templates into the database. They stay as typed data in
  `src/data/templates.ts`; there is no admin UI need yet, and the file is
  already the established pattern.
- Reworking the other three templates' content. Only the shared type change
  and mechanical `date` → `dayOffset` conversion touch them.
- Multi-locale support. `routing.ts` declares a single locale, `mn`.

## Design

### 1. Single source of truth

`golden-route` in `src/data/templates.ts` becomes the canonical record for
this trip: `duration: 14`, `basePrice: 285000`, and the full activity list.

`FeaturedItinerary.tsx` stops hardcoding "14 хоног" and "¥285,000" and reads
`duration` and `basePrice` from that record. Its CTA becomes
`/planner?template=golden-route`.

Consequence: the banner cannot disagree with the planner, because both render
from the same object. The existing `SampleItineraries.tsx` card already reads
`basePrice`, so it stays consistent for free.

### 2. Relative dates

Templates stop carrying absolute dates. A new type:

```ts
export type TemplateActivity = Omit<ItemType, "date"> & {
  /** 0 = arrival day. Materialised against the trip start date at load. */
  dayOffset: number
}
```

`SampleItinerary.activities` becomes `TemplateActivity[]`.

The planner computes each item's real `date` when applying a template, from
the same start date it writes into trip settings. This fixes the desync
(settings and items now derive from one value) and makes past dates
structurally impossible.

**Start date anchoring.** The trip anchors to the next 15 October rather than
today, so a trip named "autumn" is actually in autumn and the foliage notes
stay truthful. If clicked on or after 15 October, it rolls to the following
year. A small pure helper:

```ts
function nextAutumnStart(today: Date): Date  // → 15 Oct, this year or next
```

Kept pure and exported so it is unit-testable without mocking the clock.

### 3. Itinerary content

14 days (`dayOffset` 0–13), open-jaw: into Narita, out of Kansai. Written in
Mongolian, with a `notes` entry per stop giving opening hours, booking
warnings, and transport hints.

| Day | Base | Focus |
| --- | --- | --- |
| 0 | Tokyo | Arrive Narita, N'EX into the city, check in |
| 1 | Tokyo | Shinjuku, Shibuya crossing, Yoyogi |
| 2 | Tokyo | Asakusa, Senso-ji, Skytree |
| 3 | Tokyo | Kamakura day trip (Daibutsu, Hokoku-ji) |
| 4 | Hakone | Transfer, Hakone Open-Air Museum |
| 5 | Hakone | Lake Ashi, Owakudani, onsen night |
| 6 | Kyoto | Shinkansen, Higashiyama evening |
| 7 | Kyoto | Fushimi Inari, Gion, Jidai Matsuri |
| 8 | Kyoto | Arashiyama bamboo grove, Kinkaku-ji |
| 9 | Nara | Day trip: Nara Park, Todai-ji |
| 10 | Osaka | Transfer, Dotonbori, Kuromon market |
| 11 | Osaka | Osaka Castle, Umeda |
| 12 | Hiroshima | Day trip: Peace Park, Miyajima |
| 13 | — | Departure from Kansai |

**Budget.** In-Japan costs for one traveller, excluding the international
flight (travellers book that via the existing `/flights` page).

| Bucket | Amount |
| --- | --- |
| Accommodation, 13 nights | ¥110,000 |
| 14-day JR Pass, Hakone Free Pass, local transit | ¥95,000 |
| Meals | ¥43,500 |
| Entry fees & activities | ¥26,500 |
| Buffer / misc | ¥10,000 |
| **Total** | **¥285,000** |

Transport is the largest single line because the 14-day ordinary JR Pass is
¥80,000 on its own and the Hakone Free Pass (¥6,100) is not covered by it.

Costs attach to concrete items — a per-city accommodation item, transfer
items for each intercity leg, and individual entry fees — so the planner's
footer sums to ¥285,000 exactly. This is verified by a test, not by eye.

### 4. Testing

`src/data/templates.test.ts` (vitest is already a dependency and
`npm test` is wired):

Scoped to `golden-route`:

- activity costs sum to `basePrice` (¥285,000)
- at least one activity for each of days 0–13
- every activity has coordinates and a note

Applied to all templates:

- `dayOffset` stays within `0..duration - 1`
- activity ids are unique within a template; template ids are globally unique

And for the date helpers:

- `nextAutumnStart` returns 15 Oct of the current year before that date, and
  of the next year on or after it
- `toIsoDate` formats in local time, not UTC

The cost-reconciliation check is deliberately **not** applied to all templates.
It currently fails for all three others — `tokyo-deep-dive` items sum to ¥0
against a ¥120,000 `basePrice`, `kyoto-zen` ¥3,500 against ¥85,000,
`classic-japan-14` ~¥57,000 against ¥265,000. Enforcing it globally would mean
repricing them, which the non-goals above rule out. They are listed as a known
gap instead.

## Part B — Pre-launch checklist

Reported for triage; implemented only on approval. Build and typecheck both
pass, so nothing here blocks a deploy mechanically.

| # | Issue | Severity | Effort |
| --- | --- | --- | --- |
| 1 | No `error.tsx` / `global-error.tsx` anywhere — a runtime error shows the raw Next.js error screen | High | S |
| 2 | No `not-found.tsx` — default 404 on a content site | High | S |
| 3 | No `sitemap.ts` / `robots.ts` — the site is invisible to crawlers at launch | High | S |
| 4 | 15 SECURITY DEFINER functions with mutable `search_path` | Medium | M |
| 5 | Trigger functions (`handle_new_user`, `sync_guide_role`, `prevent_role_self_promotion`, …) callable via RPC by `anon` | Medium | S |
| 6 | Supabase leaked-password protection disabled | Low | XS |
| 7 | 25+ hotlinked third-party image hosts in `next.config.ts` — legal and reliability risk | Medium | M |
| 8 | Template activity titles in English on a Mongolian-only site | Medium | S |

Items 4–6 come from the Supabase security advisor against project
`kcelklggeywamljaivhm`. Item 8 is resolved for `golden-route` by Part A; the
other three templates would still carry English titles.

Note: `wire_webhook_events` is flagged as "RLS enabled, no policy". That is
correct and intentional — deny-all to API clients, written only by the
service role. No action.

## Risks

- **Cost figures are estimates.** Japanese prices move, and ¥285,000 is a
  reasonable mid-range 2026 figure rather than a quoted rate. The banner says
  "Зардал ойролцоогоор" (approximate cost), which carries this honestly.
- **Jidai Matsuri on 22 October** is a real fixture but can shift; the note
  is written to suggest checking rather than to promise.
- **Changing `SampleItinerary.activities`' type** touches all four templates.
  The compiler catches every site, and the only consumer that reads
  `activities` is the planner's template branch.
