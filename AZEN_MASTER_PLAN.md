# Azen — Development Master Plan

Derived from the Gaido teardown (`GAIDO_TEARDOWN.md`) mapped against the actual Azen codebase and Supabase project `kcelklggeywamljaivhm`.

---

## 0. Where Azen actually stands today

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Radix/shadcn primitives · next-intl (`mn` only) · Supabase SSR · MapLibre + react-map-gl · Cloudinary · framer-motion · fuse.js · dnd-kit.

**Routes live:** `/`, `/about`, `/contact`, `/essentials(/[id])`, `/experiences(/[id])`, `/flights`, `/guides`, `/hacks(/[id])`, `/learn`, `/planner(+shared,invite)`, `/transfer(+history,confirmation,trip)`, `/driver(+apply,history)`, `/account(+messages)`, `/admin/*` (cities, guides, hacks, learn, flights, drivers, users, transfers, transfer-pricing).

**Schema:** 18 tables, all present in the remote DB — `profiles, cities, hacks, guides, phrase_collections, itineraries, messages, drivers, vehicle_options, bookings, payments, flight_deals, transfer_zones, route_prices, exchange_rates, trip_collaborators, trip_participants, item_cost_splits`.

### Two blockers found during the audit — fix before anything else

**0.1 — The migration ledger is empty.**
`supabase_migrations.schema_migrations` returns `[]`, yet all 18 tables exist. Migrations `0001`–`0010` were applied out-of-band (SQL editor / MCP `execute_sql`), not through the CLI. Consequence: `supabase db push` will attempt to replay `0001_init.sql` from scratch. Most statements are `if not exists`-guarded, but `0002_seed.sql` and the enum/RLS blocks are not fully idempotent.

*Fix:* baseline the ledger before writing migration `0011`.

```bash
# marks existing migrations as already applied, runs nothing
supabase migration repair --status applied 0001 0002 0003 0004 0005 \
                                          0006 0007 0008 0009 0010
supabase migration list   # verify local and remote now agree
```

**0.2 — Content tables are empty.** `cities: 0`, `hacks: 0`, `guides: 0`, `phrase_collections: 0`. The homepage runs three `.eq("published", true)` queries that all return `[]`, so `HomeCarousel` renders empty rails and `FeaturedGuides` renders nothing. `0002_seed.sql` has never run.

*Fix:* run the seed, **then** add empty-state components so this failure mode is visible rather than silent.

```tsx
// components/home/HomeCarousel.tsx — guard before render
if (!items.length) return null   // or <EmptyRail label={…} />
```

> Reminder from prior sessions: **no `git stash` / `checkout` / `reset` on this mount.** Use `git archive` if you need to recover a file.

---

## 1. Gap analysis — Gaido vs Azen

| Gaido capability | Azen today | Gap |
|---|---|---|
| City hub with category tabs | `/essentials/[id]` — encyclopedia only (history, culture, climate, districts) | **No POI layer at all** |
| Things to do / Eat / Nightlife | — | **Missing entirely** ← your priority |
| Guide-attributed recs ("Recommended by Alfonso") | `guides` table exists, unlinked to content | **Missing — this is the trust moat** |
| Save to folders | — | **Missing — biggest retention gap** |
| Blog | `/hacks` — step-guide format, DB-backed | Rename + expand to editorial ← your priority |
| Custom tour wizard | — | Missing |
| Map discovery | MapLibre installed, `ExperienceMap.tsx` exists | Partial — no clustering, no bottom sheet |
| Booking marketplace | `bookings`, `payments`, `drivers`, `vehicle_options` | **Ahead of Gaido** (real payment rails) |
| Collaborative planner | `itineraries`, `trip_collaborators`, `trip_participants`, `item_cost_splits` | **Well ahead of Gaido** |
| Airport transfer w/ distance pricing | `transfer_zones`, `route_prices` | **Gaido has nothing like this** |

**Strategic read:** Azen's planner + transfer + budget-splitting stack is *stronger* than Gaido's. What Azen lacks is the top of the funnel — a reason to arrive, browse, and fall in love before committing. Gaido's whole design is a discovery-to-trust machine. Build that layer on top of the transaction machine you already have.

---

## 2. Phase 1 — Design system retune (Gaido feel, Eternal Sky palette)

Keep your brand colours. Change the *shape language*, which is where Gaido's premium read comes from.

### 2.1 Token changes — `src/app/globals.css`

```css
@theme inline {
  /* --- radii: Gaido runs much rounder --- */
  --radius-card: 1.5rem;      /* 24px  — was 0.75rem */
  --radius-thumb: 1rem;       /* 16px */
  --radius-well: 0.75rem;     /* icon wells */
  --radius-pill: 9999px;      /* ALL buttons */

  /* --- pastel badge tints (Gaido's persona chips, Azen-hued) --- */
  --color-tint-sky:     #E4EEFB;
  --color-tint-saffron: #FCF2E3;
  --color-tint-sage:    #E3F1EC;
  --color-tint-lilac:   #ECEAF7;

  /* --- section rhythm --- */
  --space-section:    6rem;   /* mobile */
  --space-section-lg: 8rem;   /* desktop */
  --width-content:  80rem;    /* 1280px */
}

:root { --radius: 1rem; }      /* base bump from 0.75rem */
```

### 2.2 Typography scale — new utilities

```css
@layer utilities {
  .text-display  { font-size: clamp(2.75rem, 6vw, 4.5rem); font-weight: 800;
                   letter-spacing: -0.02em; line-height: 1.05; }
  .text-section  { font-size: clamp(2rem, 3.5vw, 2.75rem); font-weight: 800;
                   letter-spacing: -0.015em; line-height: 1.15; }
  .text-eyebrow  { font-size: 0.8125rem; font-weight: 600; text-transform: uppercase;
                   letter-spacing: 0.12em; color: var(--muted-foreground); }
  .text-lead     { font-size: 1.125rem; line-height: 1.6; color: var(--muted-foreground); }
}
```

### 2.3 The signature headline device

Gaido's `Skip the generic **in Barcelona**` — ink weight-800 + italic accent in brand blue. Works in Mongolian:

```tsx
// components/home/Hero.tsx
<h1 className="text-display text-foreground">
  {t("headlinePrefix")}{" "}
  <span className="italic text-primary">{cityName}</span>
</h1>
```

Make `cityName` rotate with the hero carousel — one component, infinite perceived freshness.

### 2.4 New primitives to build — `src/components/ui/`

| File | Purpose |
|---|---|
| `eyebrow.tsx` | Uppercase tracked section label |
| `pill-badge.tsx` | Pastel badge, `variant: sky \| saffron \| sage \| lilac` |
| `section.tsx` | Wraps `--space-section` + max-width + optional tint bg |
| `arrow-link.tsx` | Text link with trailing `→`, used everywhere |
| `inline-cta-banner.tsx` | Tinted rounded bar, copy left + pill button right |
| `process-row.tsx` | Ghost-numeral `01 02 03` step row |
| `icon-list.tsx` | Tinted icon well + bold title + description |
| `image-mosaic.tsx` | 2×2 rounded photo grid |
| `save-heart.tsx` | Optimistic heart toggle (used by Phase 4) |

### 2.5 Button policy change

Gaido uses **zero solid buttons in the nav** — outlined pills only — and reserves solid fill for the single in-page primary action. Apply this: your saffron `variant="reserve"` becomes rarer and therefore louder. Nav "Transfer" CTA → outlined pill. Solid saffron reserved for *Book / Request / Confirm* only.

**Effort:** 2–3 days. **Do this first** — everything downstream inherits it.

---

## 3. Phase 2 — `/hacks` → `/blog`

### 3.1 Decision: don't just rename, evolve the model

`hacks` is a step-guide table (`steps jsonb`, `pro_tip`, `trap_alternative`, `hack_category` enum). Gaido's blog is 7–8 minute editorial. Renaming the route without changing the model gives you a "Blog" that contains only numbered how-tos.

**Recommended:** one `posts` table with a `type` discriminator. Hacks become a *post type*, and you gain the ability to publish longform.

### 3.2 Migration `0011_posts.sql`

```sql
-- 0011_posts.sql
create type public.post_type as enum ('article', 'hack', 'guide_story');

create table if not exists public.posts (
  id            text primary key,
  slug          text unique not null,
  type          public.post_type not null default 'article',
  title         text not null,
  excerpt       text,
  cover_image   text,
  body_md       text,                                   -- articles
  steps         jsonb not null default '[]'::jsonb,     -- hacks (preserved)
  pro_tip       text,
  trap_alternative text,
  category      text,                                   -- was hack_category
  tags          text[] not null default '{}',
  city_id       text references public.cities(id) on delete set null,
  author_guide_id uuid references public.guides(id) on delete set null,
  read_minutes  int,
  related_ids   text[] not null default '{}',
  published     boolean not null default false,
  published_at  timestamptz,
  order_index   int not null default 0,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.posts (published, published_at desc);
create index on public.posts (city_id) where published;
create index on public.posts using gin (tags);

-- backfill from hacks (safe: hacks is currently empty, but keep it correct)
insert into public.posts (id, slug, type, title, excerpt, cover_image, steps,
                          pro_tip, trap_alternative, category, related_ids,
                          published, published_at, order_index, created_by)
select id, id, 'hack', title, summary, cover_image, steps,
       pro_tip, trap_alternative, category::text, related_ids,
       published, created_at, order_index, created_by
from public.hacks
on conflict (id) do nothing;

alter table public.posts enable row level security;
create policy "posts public read" on public.posts
  for select using (published = true);
create policy "posts admin write" on public.posts
  for all using (
    exists (select 1 from public.profiles p
            where p.id = auth.uid() and p.role = 'admin')
  );
```

Keep `hacks` in place for one release as a fallback, then drop in `0013`.

### 3.3 Files to change

| File | Change |
|---|---|
| `src/i18n/routing.ts` | `/hacks` → `/blog`, `/hacks/[id]` → `/blog/[slug]`; same for `/admin/hacks*` → `/admin/blog*` |
| `src/app/[locale]/hacks/` | → `src/app/[locale]/blog/` (`page.tsx`, `[slug]/page.tsx`) |
| `src/app/[locale]/admin/hacks/` | → `admin/blog/` |
| `src/app/api/admin/hacks/` | → `api/admin/blog/` |
| `src/components/hacks/` | → `src/components/blog/`; add `PostCard.tsx`, `PostBody.tsx`, `PostMeta.tsx` |
| `src/components/layout/Navbar.tsx` | `{ href: "/hacks", labelKey: "hacks" }` → `{ href: "/blog", labelKey: "blog" }` |
| `Footer.tsx`, `AccountMenu.tsx`, `GlobalSearch.tsx`, `admin/layout.tsx`, `ui/page-header.tsx` | label + href updates |
| `src/data/search-data.ts` | re-point search index at posts |
| `src/messages/mn.json` | `Navigation.hacks` → `Navigation.blog`; new `Blog` namespace; keep `Hacks` keys until copy is migrated |
| `src/lib/supabase/types.ts` | regenerate after migration |

### 3.4 Redirects — `next.config.ts`

```ts
async redirects() {
  return [
    { source: '/hacks',      destination: '/blog', permanent: true },
    { source: '/hacks/:id',  destination: '/blog/:id', permanent: true },
    { source: '/mn/hacks',   destination: '/mn/blog', permanent: true },
    { source: '/mn/hacks/:id', destination: '/mn/blog/:id', permanent: true },
  ]
}
```

### 3.5 Blog index — Gaido pattern

Eyebrow (`СТОРИС ЛОКАЛУУДААС`) + "View all posts →" right-aligned · 3-col `PostCard` grid · card = image / city tag pill + read-time / title / 3-line clamped excerpt / hairline rule / date + "Read more". Add filter chips for city and type.

Compute `read_minutes` on save: `Math.ceil(wordCount / 200)`.

**Effort:** 3–4 days including content migration.

---

## 4. Phase 3 — "Things to do" (the big one)

This is the feature you flagged, and it's Gaido's actual product. It also gives Azen a reason to exist between bookings.

### 4.1 Migration `0012_places.sql`

```sql
create type public.place_category as enum
  ('things_to_do', 'places_to_eat', 'nightlife', 'shopping', 'day_trip');

create table if not exists public.places (
  id            text primary key,
  city_id       text not null references public.cities(id) on delete cascade,
  slug          text not null,
  name          text not null,
  category      public.place_category not null,
  subcategory   text,                       -- "Museums", "Casual Eats", "Ramen"
  neighborhood  text,
  lat           double precision,
  lng           double precision,
  address       text,
  cover_image   text,
  gallery       text[] not null default '{}',
  short_desc    text,
  long_desc     text,
  price_band    smallint check (price_band between 1 and 4),
  hours         jsonb not null default '{}'::jsonb,
  booking_url   text,
  google_place_id text,
  tags          text[] not null default '{}',
  is_hidden_gem boolean not null default false,
  published     boolean not null default true,
  order_index   int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (city_id, slug)
);

create index on public.places (city_id, category) where published;
create index on public.places (lat, lng);
create index on public.places using gin (tags);

-- the trust device: a named guide vouches for a place, in their own words
create table if not exists public.place_recommendations (
  id          uuid primary key default gen_random_uuid(),
  place_id    text not null references public.places(id) on delete cascade,
  guide_id    uuid not null references public.guides(id) on delete cascade,
  quote       text not null,
  created_at  timestamptz not null default now(),
  unique (place_id, guide_id)
);
create index on public.place_recommendations (place_id);

alter table public.places enable row level security;
alter table public.place_recommendations enable row level security;
create policy "places public read" on public.places
  for select using (published = true);
create policy "recs public read" on public.place_recommendations
  for select using (true);
```

### 4.2 Consolidate the city IA

Right now `/essentials/[id]` holds encyclopedia content and there's nowhere for POIs. Merge into one hub, matching Gaido:

```
/city/[slug]
  ├── ?tab=overview     ← existing CityDetailTabs content (history, culture, climate…)
  ├── ?tab=do           ← Things to do          ★ new
  ├── ?tab=eat          ← Places to eat         ★ new
  ├── ?tab=nightlife    ← Nightlife             ★ new
  └── ?tab=practical    ← getting around, expenses, districts
```

Redirect `/essentials/[id]` → `/city/[slug]` (permanent). Add `cities.slug` in the same migration — use Gaido's `ulaanbaatar-mn` pattern for SEO.

### 4.3 Components — `src/components/places/`

| Component | Notes |
|---|---|
| `CityHub.tsx` | Tab shell, syncs `?tab=` to URL so tabs are shareable and indexable |
| `CategoryTabs.tsx` | Things to do / Eat / Nightlife — underline-active, Gaido style |
| `PlaceFilterBar.tsx` | Neighborhood select · price band · tags · Sort by. Reuse `fuse.js` for in-tab search |
| `PlaceCard.tsx` | Image, category pill overlay top-left, save heart top-right, name, neighborhood · hours · price band, **guide attribution strip** |
| `GuideQuote.tsx` | Avatar + name + "Licensed Tour Guide" badge + italic quote + "View Guide Profile →" |
| `PlaceDetail.tsx` | Gallery, breadcrumb (`CASUAL EATS · BORN`), quote block, hours, map, booking CTA |
| `PlaceMap.tsx` | MapLibre + clustering + category-coloured pins. Extend `components/experiences/ExperienceMap.tsx` |
| `MapBottomSheet.tsx` | Mobile: sheet with horizontally scrollable cards synced to pin selection |
| `PlaceCount.tsx` | "32 Hidden Gems" header chip — cheap, effective |

### 4.4 Clustering

MapLibre has clustering natively — no extra dependency:

```ts
map.addSource('places', {
  type: 'geojson',
  data: geojson,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
})
```

### 4.5 Admin

`/admin/places` with city filter, bulk CSV import (you'll be entering hundreds of POIs — build the importer on day one, not day thirty), Cloudinary upload (`/api/cloudinary/sign` already exists), and a guide-recommendation attach UI.

**Effort:** 8–12 days. Split: schema + admin + importer (4d) → city hub + tabs + cards (4d) → map + clustering + sheet (3d).

---

## 5. Phase 4 — Saves, folders, and the planner bridge

Gaido's strongest retention mechanic, and Azen is uniquely placed to beat it because **you already have a collaborative planner with budget splitting**. Gaido's folders dead-end; yours can flow into a real trip.

### 5.1 Migration `0013_saves.sql`

```sql
create type public.saveable_type as enum
  ('place', 'post', 'experience', 'guide', 'city');

create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  itinerary_id uuid references public.itineraries(id) on delete set null,
  name        text not null,
  cover_image text,
  created_at  timestamptz not null default now()
);

create table if not exists public.saved_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  folder_id   uuid references public.folders(id) on delete cascade,
  item_type   public.saveable_type not null,
  item_id     text not null,
  note        text,
  created_at  timestamptz not null default now(),
  unique (user_id, folder_id, item_type, item_id)
);

create index on public.saved_items (user_id, item_type);
create index on public.folders (user_id);

alter table public.folders enable row level security;
alter table public.saved_items enable row level security;
create policy "own folders" on public.folders
  for all using (user_id = auth.uid());
create policy "own saves" on public.saved_items
  for all using (user_id = auth.uid());
```

### 5.2 The loop that makes Azen different

```
Browse places  →  ♥ Save  →  Folder "Токио – Өдөр 1"
                                    ↓
                        "Аяллын төлөвлөгөөнд нэмэх"
                                    ↓
             Existing planner (dnd-kit day builder)
                                    ↓
        trip_collaborators  +  item_cost_splits  ← already built
                                    ↓
                    Transfer booking between saved places
```

That last arrow is the unlock: a saved place has `lat`/`lng`, and `route_prices` already prices point-to-point transfers. **"Get a transfer to this place" on a place detail page** is a booking conversion Gaido structurally cannot offer.

### 5.3 Components

`SaveHeart.tsx` (optimistic, prompts auth when logged out) · `SaveToFolderSheet.tsx` · `FolderGrid.tsx` · `/account/saved` page · `AddFolderToTripDialog.tsx` (the bridge).

**Effort:** 5–6 days.

---

## 6. Phase 5 — Custom tour builder

Mirrors Gaido's `Create Custom Tour`, but generates from *your* `places` + `experiences` and hands off to `bookings` + `messages`, which already exist.

### 6.1 Migration `0014_tour_requests.sql`

```sql
create table if not exists public.tour_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  city_id       text references public.cities(id),
  contact_email text,
  prefs         jsonb not null default '{}'::jsonb,
    -- { pace, interests[], group_size, dates, budget_band, languages[] }
  generated_itinerary jsonb not null default '[]'::jsonb,
    -- [{ order, place_id, title, note, duration_min }]
  matched_guide_id uuid references public.guides(id),
  status        text not null default 'draft',
    -- draft | requested | matched | confirmed | declined
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.tour_requests (status, created_at desc);
```

### 6.2 Flow

`/tours/custom` — 4-step wizard (pace → interests → group size + dates → budget), each step one question, progress dots, no account required until submit. Generate a numbered itinerary card (Gaido's exact layout: rank number, thumbnail, place name, rows stacked) with the two-button footer: light `Өөрчлөх` + solid saffron `Захиалга илгээх`.

Matching: v1 = rank guides by `city_id` + language overlap + rating. Don't build ML. A `SELECT … ORDER BY rating DESC LIMIT 3` and a human in the loop beats a bad recommender.

**Effort:** 6–8 days.

---

## 7. Phase 6 — Homepage rebuild

Restructure `src/app/[locale]/page.tsx` to Gaido's proven section order:

1. **HeroSplit** — rotating italic city name, search pill, image carousel with dots, floating guide testimonial card
2. **3-up feature cards** with phone mockups → Discover / Book / Plan
3. **Custom tour split** — copy + itinerary mockup + `Build My Tour`
4. **Process row** — `01 Таны сонголт · 02 Бид бүтээнэ · 03 Та амсана`
5. **Available Cities grid** — 4-col, persona badge overlay, flag + name + one-liner
6. **Who are our guides** — 2×2 mosaic + icon list + `Apply to be a Guide` banner
7. **From the Blog** — 3 latest posts
8. **Download app / PWA banner**

Your existing `FeaturedGuides`, `HomeCarousel`, `LearnSection` slot into 5/6/7 with restyling only.

Add the missing supply funnel: **"Хөтөч болох"** — Azen has `/driver/apply` but no guide application route. Add `/guides/apply`.

**Effort:** 4–5 days.

---

## 8. Phase 7 — Instrumentation

Nothing above is worth building unmeasured. Minimum event set:

| Event | Why |
|---|---|
| `city_hub_viewed` (city, tab) | Which category earns the traffic |
| `place_viewed`, `place_saved` | Discovery → intent |
| `folder_created`, `folder_added_to_trip` | The retention bridge — **watch this one** |
| `guide_profile_viewed` (source) | Does attribution actually drive clicks |
| `tour_request_submitted` | Core action |
| `transfer_quote_requested` (from place?) | Cross-sell working |
| `booking_confirmed` | North star |
| `post_read` (slug, scroll depth) | SEO content ROI |

Funnel to watch weekly: `city_hub_viewed → place_viewed → place_saved → folder_added_to_trip → booking_confirmed`.

---

## 9. Sequencing

| # | Phase | Effort | Blocks | Ship value |
|---|---|---|---|---|
| 0 | Migration repair + seed + empty states | 0.5d | everything | Site stops looking broken |
| 1 | Design system retune | 2–3d | 2,3,5,6 | Immediate perceived quality |
| 2 | `/hacks` → `/blog` | 3–4d | — | SEO surface + your ask |
| 3 | Things to do + city hub | 8–12d | 4,5 | **The product** |
| 4 | Saves + folders + planner bridge | 5–6d | — | Retention loop |
| 5 | Custom tour builder | 6–8d | needs 3 | Lead capture |
| 6 | Homepage rebuild | 4–5d | needs 1,3 | Conversion |
| 7 | Instrumentation | 2d | — | Everything measurable |

**Roughly 6–8 weeks solo.** Phases 2 and 4 are independent of 3 — parallelisable if you get help.

### Suggested first sprint (week 1)

1. `supabase migration repair` + run `0002_seed.sql` — half a day, unblocks everything
2. Token changes in `globals.css` + build `Section`, `Eyebrow`, `PillBadge`, `ArrowLink`
3. Write + apply `0011_posts.sql`, regenerate types
4. Move `/hacks` → `/blog` with redirects, build `PostCard`
5. Ship. Then start `0012_places.sql`.

---

## 10. Three opinionated calls

**1. Don't clone Gaido's business model, clone its funnel.** Gaido is a guide marketplace with planning bolted on. Azen is a planning-and-logistics platform with guides available. Your planner, budget splitting, and airport transfers are genuinely better assets — the discovery layer exists to feed them, not to replace them.

**2. Guide attribution is the whole trick.** "El Casal Café Bar — *Recommended by Alfonso, Licensed Tour Guide*" is why Gaido feels trustworthy and TripAdvisor doesn't. If you build `places` without `place_recommendations` populated by real named guides, you've built a directory. Budget real effort on recruiting 3–5 guides per city who will write actual sentences.

**3. Build the CSV importer before the first POI.** Phase 3 needs hundreds of places. Hand-entering them through a form will quietly kill the project around place #40.
