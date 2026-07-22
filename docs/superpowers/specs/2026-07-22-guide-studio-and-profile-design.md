# Guide Studio & Public Profile — Design Spec

**Date:** 2026-07-22
**Branch:** `feat/sprint2-places-city-hub`
**Status:** Approved design → ready for implementation plan
**Source design:** claude.ai/design project `f3efa155` ("Azen Restructure"), guide screens 09–12 + mobile screen 13 (Guide role, 3 screens).

---

## 1. Goal

Give a **guide-role user** the complete self-service experience shown in the design, matched exactly to the mockups and fully functional:

1. **Azen Studio** (`/studio`) — private dashboard: real KPIs, own-recommendations table, incoming booking requests with accept/decline, profile-completeness checklist.
2. **Create** (`/studio/new`) — author a place recommendation *or* a blog post, each with a live preview.
3. **Public guide profile** (`/guides/[slug]`) — cover, overlapping profile card, Book/Message CTAs, tabs (Зөвлөмж / Нийтлэл / Сэтгэгдэл / Тухай).

Each screen has a desktop and a mobile layout (design screen 13).

## 2. Locked decisions

- **Delivery:** one combined spec + plan, built straight through.
- **Metrics:** *real analytics + earnings ledger* — everything is genuinely tracked/computed, no illustrative numbers.
- **Recommendation storage:** guide-created recs are **real `places` rows** (`created_by_guide_id`, existing `published`/`is_hidden_gem`/`price_band`) + a `place_recommendations.quote`. They reuse PlaceCard, the city hubs, and the discovery layer.
- **Architecture:** *Approach 1* — maximize reuse, on-read windowed analytics; metric logic isolated in `lib/guides/stats.ts` so materialized rollups (Approach 2) are a later drop-in with no UI change.

## 3. Architecture overview

- New `(studio)` route group with its own shell (desktop sidebar + mobile bottom tab bar), separate from the main site chrome. Gated to `role ∈ {guide, admin}`.
- Public profile is a new server route under the existing site chrome.
- **DB delta is small:** 2 column adds + 2 new tables; everything else reuses existing tables (`places`, `place_recommendations`, `posts`, `saved_items`, `analytics_events`).
- All guide-scoped writes protected by RLS keyed on `guides.profile_id = auth.uid()`.
- The current `/experiences/[id]` page is unaffected (it is an experience detail page, not a guide profile). `components/experiences/GuideProfile.tsx` is a reference for styling only.

## 4. Routes & layout

| Route | Purpose | Chrome |
|---|---|---|
| `/studio` | Dashboard "Тойм" | Studio shell |
| `/studio/new` | Create — tabbed **Зөвлөмж \| Нийтлэл** + live preview | Studio shell |
| `/studio/recommendations` | Full recs table (Миний зөвлөмж) | Studio shell |
| `/studio/posts` | Guide's posts (Нийтлэл) | Studio shell |
| `/studio/bookings` | Orders + accept/decline (Захиалга) | Studio shell |
| `/studio/messages` | Threads (Зурвас) — reuses existing messages | Studio shell |
| `/studio/earnings` | Income breakdown (Орлого) | Studio shell |
| `/studio/profile` | Edit public profile (see §8) | Studio shell |
| `/guides/[slug]` | **Public** guide profile | Main site nav |

**Studio shell (`app/[locale]/(studio)/layout.tsx`):**
- Desktop: fixed left sidebar — "Azen Studio" mark, nav (Тойм/Миний зөвлөмж N/Нийтлэл N/Захиалга N/Зурвас •/Орлого), "Нийтийн профайл" link (→ `/guides/[slug]`), user chip at bottom.
- Mobile: fixed bottom tab bar — Студи / Зөвлөмж / **+** (saffron FAB → `/studio/new`) / Зурвас / Профайл. The global `MobileTabBar` is hidden under `/studio` (extend the existing hidden-prefix list already covering `/admin`, `/planner`, `/transfer`).
- Guard (server): resolve `guides` row via `profile_id = auth.uid()`. No row / not guide-or-admin → redirect (`/guides/apply` if plain user, `/login?redirectTo=/studio` if signed out).

## 5. Data model (migration `0020_guide_studio.sql`)

### 5.1 Column adds
```sql
alter table public.places  add column if not exists created_by_guide_id uuid references public.guides(id) on delete set null;
create index if not exists idx_places_created_by_guide on public.places (created_by_guide_id) where created_by_guide_id is not null;

alter table public.guides  add column if not exists slug         text;
alter table public.guides  add column if not exists cover_image  text;
-- backfill slug from name (kebab, de-duped), then:
create unique index if not exists uq_guides_slug on public.guides (slug) where slug is not null;
```
- Reuse `guides.price` as the **hourly rate** (already rendered as `¥{price}` in the directory).

### 5.2 `guide_bookings` — orders + earnings source
```sql
create type public.guide_booking_status as enum
  ('pending','confirmed','completed','declined','cancelled');

create table public.guide_bookings (
  id          uuid primary key default gen_random_uuid(),
  guide_id    uuid not null references public.guides(id) on delete cascade,
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  city        text,
  trip_date   date not null,
  hours       int  not null check (hours > 0),
  amount      numeric(10,2) not null,          -- hours * guides.price captured at request time
  status      public.guide_booking_status not null default 'pending',
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.guide_bookings (guide_id, status);
create index on public.guide_bookings (traveler_id);
```
- **Lifecycle:** `pending` → *accept* `confirmed` / *decline* `declined`; `confirmed` → `completed` (trip done) / `cancelled`.
- **Орлого** = `Σ amount where status='completed'` (grouped by month for the earnings screen); dashboard also shows `confirmed` upcoming.
- **Anon-write trap guard:** inserts use a server-generated `crypto.randomUUID()` + plain insert (no `.select()` RETURNING) per the project's known RLS/RETURNING pitfall.

### 5.3 `guide_reviews` — real rating source
```sql
create table public.guide_reviews (
  id          uuid primary key default gen_random_uuid(),
  guide_id    uuid not null references public.guides(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  booking_id  uuid references public.guide_bookings(id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz not null default now(),
  unique (guide_id, reviewer_id)               -- one review per traveler per guide
);
```
- Trigger `refresh_guide_rating()` (AFTER ins/upd/del) keeps `guides.rating` (avg, 1 decimal) and `guides.review_count` honest — they are static columns today.

### 5.4 RLS summary
| Table | Guide (owner) | Traveler / public |
|---|---|---|
| `places` (guide-created) | insert/update/delete where `created_by_guide_id` = my guide | select where `published` (existing) |
| `place_recommendations` | insert/update/delete for my guide | select (existing) |
| `posts` | insert/update/delete where `author_guide_id` = my guide | select where `published` (existing) |
| `guide_bookings` | select + update(status) where `guide_id` = my guide | traveler: insert (self as traveler_id), select own |
| `guide_reviews` | select where `guide_id` = my guide | insert (self as reviewer_id), select all published |
| `analytics_events` | read own aggregates via `SECURITY DEFINER` stat fns | insert (existing anon allowlist) |

"My guide" = `(select id from guides where profile_id = auth.uid())`, wrapped in a `SECURITY DEFINER` helper `public.current_guide_id()`.

## 6. Stats module — `lib/guides/stats.ts`

Pure/queryable functions, unit-tested for the math, so Approach 2 rollups can swap in later:

| KPI | Definition |
|---|---|
| Профайл үзэлт | `count(analytics_events where name='guide_profile_view' and props->>'guide_id' = me)`; **Δ%** = this-7d vs prior-7d |
| Хадгалсан | `count(saved_items where item_type='place' and item_id in (my published places))`; Δ% by `created_at` window |
| Захиалга | `count(guide_bookings where guide_id=me)`; **pending** = `status='pending'` |
| Үнэлгээ | `guides.rating` + `guides.review_count` |
| Орлого | `Σ guide_bookings.amount where status='completed'` (per month) |
| Per-rec row | ҮЗЭЛТ = `place_view` count for that place; ХАДГАЛСАН = saves for that place; ТӨЛӨВ = `published ? Нийтэлсэн : Ноорог` |

Views are logged client-side via the existing `lib/analytics.ts` `track()` (sendBeacon → `/api/analytics`); add `guide_profile_view` and `place_view` to the event allowlist. Profile views deduped per `session_id` per day.

## 7. Screen specs (match design exactly)

### 7.1 Studio dashboard `/studio` (screen 09/10 + mobile)
**Desktop:** left sidebar (as §4). Main: greeting `Сайн уу, {firstName} 👋` + subline `Энэ 7 хоногт таны профайлыг {views} удаа үзсэн байна — өнгөрсөн долоо хоногоос {Δ}% өссөн.`; top-right **Нийтлэл бичих** (outline) + **Шинэ зөвлөмж** (solid navy). Body:
- **4 KPI tiles** (icon top-right, big number, Δ/subtext): Профайл үзэлт · Хадгалсан · Захиалга (`{pending} хүлээгдэж буй`) · Үнэлгээ (`{review_count} сэтгэгдэл`).
- **Миний зөвлөмжүүд** card — table ГАЗАР / ҮЗЭЛТ / ХАДГАЛСАН / ТӨЛӨВ, "Бүгд харах →" (→ `/studio/recommendations`), row = colour tile + name + `city · category`, status pill.
- **Ирсэн хүсэлт** panel (`{n} шинэ`) — booking request cards: avatar, `{name} захиалга хүсэв`, `{city} · {date} · {hours} цаг · ¥{amount}`, **Зөвшөөрөх** (saffron) / **Татгалзах**; message rows below (`{name} зурвас бичив` + snippet).
- **Профайлын бүрэн байдал {pct}%** — progress bar + checklist rows (done ✓ / todo ○).

**Mobile:** Studio header + greeting; 2 KPI cards (Профайл үзэлт, Захиалга); "Шинэ хүсэлт {n}" request card (Зөвшөөрөх/Татгалзах); "Миний зөвлөмж" list (name, `{views} үзэлт · {saves} ♥`, status); bottom tab bar.

### 7.2 Create `/studio/new` (screen 11 + mobile)
Top bar: `← Студи` · segmented **Зөвлөмж \| Нийтлэл** · autosave hint `Ноорог автоматаар хадгалагдана` · **Ноорог хадгалах** · **Нийтлэх** (saffron). Two-pane (form left, live preview right).

**Зөвлөмж (recommendation) form → `places` + `place_recommendations`:**
- Төрөл chips → `category`: Юу үзэх=`things_to_do`, Хаана хооллох=`places_to_eat`, Шөнийн амьдрал=`nightlife`, **Байгаль=`things_to_do`** (enum has no `nature`; kept out of the city-hub tab set).
- Газрын нэр → `name`; Хот `<select>` (cities) → `city_id`; Дүүрэг → `neighborhood`.
- Үнийн түвшин ¥/¥¥/¥¥¥ → `price_band` (1–3).
- Зураг: 4 slots, 1st labelled **Нүүр** → `cover_image` + `gallery[]` (upload via `/api/cloudinary/sign`).
- **Яагаад санал болгож байна?** textarea, 240-char counter → `place_recommendations.quote` (also mirrored to `places.short_desc`).
- **Нуугдмал эрдэнэ** toggle → `is_hidden_gem`.
- Шошго chips → `tags[]`.
- **Live PlaceCard preview** (category chip, hidden-gem badge, gradient/cover, name, `city · ¥band`, quote, `{guide} санал болгосон` + avatar). Footer note: `{city} · {type} хуудсанд болон таны профайлд шууд гарна.`
- **Publish** → `published=true`; **Save draft** → `published=false`; `place.id = {city_id}-{slug}`, `created_by_guide_id = me`.

**Нийтлэл (blog) form → `posts`:** Гарчиг → `title`; Ангилал `<select>` → category; Нүүр зураг → `cover_image`; rich-text body (B/I/U/T/≡/link) → body/steps; author_guide_id = me. **Live BlogCard preview.**

**Mobile:** `← Шинэ зөвлөмж`; Зөвлөмж|Нийтлэл toggle; image slots; Газрын нэр; Төрөл chips; Яагаад textarea; Нуугдмал эрдэнэ toggle; bottom **Ноорог** | **Нийтлэх**.

### 7.3 Public profile `/guides/[slug]` (screen 12 + mobile)
- Navy cover band (`cover_image` or gradient) + location chip (`{location}`).
- **Overlapping profile card:** avatar; name + `✓ Баталгаажсан хөтөч` (if `is_verified`); bio; tag chips; right block = 3 stats (Үнэлгээ `rating` / Аялал `completed bookings` / Зөвлөмж `published recs`), **Хөтөч захиалах · ¥{price}/цаг** (saffron → book form §8), **Зурвас илгээх** (outline → existing MessageModal).
- **Tabs** Зөвлөмж N / Нийтлэл N / Сэтгэгдэл N / Тухай:
  - Зөвлөмж: filter chips (Бүгд / Юу үзэх / Хаана хооллох / …) + PlaceCard grid (quote shown), each card → `/city/[slug]/place/[placeSlug]`.
  - Нийтлэл: BlogCard row, "Бүгд →".
  - Сэтгэгдэл: review list (avatar, rating stars, body, date).
  - Тухай: bio long-form, languages, tags.
- Logs `guide_profile_view` on load.
- **Mobile:** `← Буцах`, cover, stacked profile card (Захиалах ¥{price} / Зурвас), tabs, PlaceCards.

## 8. Additions beyond the literal mockups (needed to function)

1. **`/studio/profile` edit form** — avatar, `cover_image`, bio, tags, `location`, hourly `price`, `video_url`. Makes the completeness checklist actionable. Guide updates own `guides` row (RLS). Styled to the Studio shell.
2. **Book-guide form** (behind the profile CTA) — city / trip_date / hours (+ live `amount = hours × price`) / note → inserts `guide_bookings (status='pending')`. Login-gated (`redirectTo` back to profile). Confirmation card on success.
3. **Profile completeness** definition: checklist = has avatar · has cover · bio ≥ 40 chars · ≥ 3 tags · ≥ 10 published recs · has intro video. `pct = round(done/total*100)`.

## 9. States

- **Empty:** new guide → each panel shows an empty state (e.g. `Одоогоор зөвлөмж алга — эхний зөвлөмжөө нэмээрэй` with a CTA to `/studio/new`); profile with 0 recs/reviews handled gracefully.
- **Loading:** skeletons for KPI tiles, tables, card grids.
- **Errors:** create/booking failures surface inline (no silent fail); accept/decline is optimistic then revalidates.
- **Auth:** Studio routes redirect non-guides; book/message require login.

## 10. Non-goals (YAGNI for this build)

- Real money movement / payouts (earnings is a computed ledger only; no Stripe payout).
- Materialized analytics rollups + cron (documented as Approach 2 scale-up; not built now).
- Admin moderation queue for guide-created places (they publish directly; moderation is a later concern).
- Extending `place_category` with `nature` (Байгаль maps to `things_to_do`).
- Real-time push for new requests (dashboard reads on load/navigation; existing realtime not extended here).

## 11. Testing & verification

- **Unit:** `lib/guides/stats.ts` math (Δ% windows, earnings sums, completeness %) — pure functions, table-driven tests.
- **RLS / query shapes:** `execute_sql` inside `begin; set local role authenticated; set local request.jwt.claims …; … rollback;` to prove guide-owner vs traveler vs anon paths without logging in.
- **Preview:** each screen at **375px** and **1440px** — console/network clean, forms submit, accept/decline flips status, live previews update.
- **Type/lint:** `tsc --noEmit` clean (project doesn't gate on the pre-existing `as any` lint debt).

## 12. File inventory (indicative)

**DB:** `supabase/migrations/0020_guide_studio.sql` (+ ledger row `0020`), hand-written types in `src/lib/supabase/types.ts` (`GuideBookingRow`, `GuideReviewRow`, extend `GuideRow`, `PlaceRow`).

**Routes/layout:** `app/[locale]/(studio)/layout.tsx`, `studio/page.tsx`, `studio/new/page.tsx`, `studio/recommendations/page.tsx`, `studio/posts/page.tsx`, `studio/bookings/page.tsx`, `studio/messages/page.tsx`, `studio/earnings/page.tsx`, `studio/profile/page.tsx`, `app/[locale]/guides/[slug]/page.tsx`.

**Components:** `components/studio/*` (StudioSidebar, StudioTabBar, KpiTile, RecsTable, RequestCard, CompletenessCard, CreateRecommendationForm, CreatePostForm, LivePlaceCardPreview, LiveBlogCardPreview, EarningsBreakdown, ProfileEditForm), `components/guides/GuidePublicProfile*` (+ reuse PlaceCard, BlogCard, MessageModal).

**API:** `api/guides/bookings/route.ts` (create + status update), `api/studio/recommendations/route.ts`, `api/studio/posts/route.ts`, `api/guides/reviews/route.ts`; extend analytics allowlist.

**Lib:** `lib/guides/stats.ts`, `lib/guides/completeness.ts`, `lib/guides/slug.ts`.

## 13. Open items (defaults chosen; flag to change)

- **Байгаль → `things_to_do`** (vs. extending the enum). *Chosen: map.*
- **Reviews gated to completed bookings?** *Chosen: any authenticated user, one per guide (booking_id optional link).* Tighten later if spam appears.
