-- 0020_guide_studio.sql
-- Guide self-service: recommendations as real places, a bookings ledger,
-- real reviews, and a public-profile slug. See spec 2026-07-22.

-- ── column adds ──────────────────────────────────────────────────────────────
alter table public.places
  add column if not exists created_by_guide_id uuid references public.guides(id) on delete set null;
create index if not exists idx_places_created_by_guide
  on public.places (created_by_guide_id) where created_by_guide_id is not null;

alter table public.guides add column if not exists slug        text;
alter table public.guides add column if not exists cover_image text;

-- backfill slugs from name (lower, spaces→-, strip non-url); de-dupe with a suffix
update public.guides g set slug = base.s
from (
  select id,
         regexp_replace(lower(coalesce(nullif(trim(name),''),'guide')), '[^a-z0-9]+', '-', 'g') as s
  from public.guides
) base
where g.id = base.id and g.slug is null;
-- trim any leading/trailing hyphens the regex may have left
update public.guides set slug = regexp_replace(slug, '^-+|-+$', '', 'g') where slug is not null;
-- de-dupe collisions deterministically by id suffix
update public.guides g set slug = g.slug || '-' || left(g.id::text, 4)
where exists (select 1 from public.guides o where o.slug = g.slug and o.id <> g.id);
create unique index if not exists uq_guides_slug on public.guides (slug) where slug is not null;

-- ── helper: the signed-in user's guide id ────────────────────────────────────
create or replace function public.current_guide_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.guides where profile_id = auth.uid() limit 1
$$;

-- ── guide_bookings (orders + earnings) ───────────────────────────────────────
do $$ begin
  create type public.guide_booking_status as enum
    ('pending','confirmed','completed','declined','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.guide_bookings (
  id          uuid primary key default gen_random_uuid(),
  guide_id    uuid not null references public.guides(id) on delete cascade,
  traveler_id uuid not null references public.profiles(id) on delete cascade,
  city        text,
  trip_date   date not null,
  hours       int  not null check (hours > 0),
  amount      numeric(10,2) not null,
  status      public.guide_booking_status not null default 'pending',
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_gb_guide on public.guide_bookings (guide_id, status);
create index if not exists idx_gb_traveler on public.guide_bookings (traveler_id);

-- ── guide_reviews (real rating source) ───────────────────────────────────────
create table if not exists public.guide_reviews (
  id          uuid primary key default gen_random_uuid(),
  guide_id    uuid not null references public.guides(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  booking_id  uuid references public.guide_bookings(id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz not null default now(),
  unique (guide_id, reviewer_id)
);
create index if not exists idx_gr_guide on public.guide_reviews (guide_id);

-- keep guides.rating / review_count honest (they are static columns today)
create or replace function public.refresh_guide_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  gid := coalesce(new.guide_id, old.guide_id);
  perform set_config('app.guide_rating_refresh', '1', true); -- tx-local guard bypass
  update public.guides g set
    review_count = (select count(*) from public.guide_reviews r where r.guide_id = gid),
    rating = coalesce((select round(avg(r.rating)::numeric, 1)
                       from public.guide_reviews r where r.guide_id = gid), 5.0)
  where g.id = gid;
  perform set_config('app.guide_rating_refresh', '0', true);
  return null;
end $$;
drop trigger if exists trg_refresh_guide_rating on public.guide_reviews;
create trigger trg_refresh_guide_rating
  after insert or update or delete on public.guide_reviews
  for each row execute function public.refresh_guide_rating();

-- guard: a guide may edit its own row but never trust/derived columns
create or replace function public.guard_guide_columns()
returns trigger language plpgsql as $$
begin
  if current_setting('app.guide_rating_refresh', true) = '1' or public.is_admin() then
    return new;
  end if;
  new.is_verified  := old.is_verified;
  new.rating       := old.rating;
  new.review_count := old.review_count;
  new.is_active    := old.is_active;
  new.profile_id   := old.profile_id;
  new.legacy_id    := old.legacy_id;
  return new;
end $$;
drop trigger if exists trg_guard_guide_columns on public.guides;
create trigger trg_guard_guide_columns
  before update on public.guides
  for each row execute function public.guard_guide_columns();

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- guides: owner may update own row (column safety enforced by guard trigger)
drop policy if exists "guides_update_own" on public.guides;
create policy "guides_update_own" on public.guides
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- places: guide manages own created rows (adds to existing public-read + admin-write)
drop policy if exists "places_guide_manage_own" on public.places;
create policy "places_guide_manage_own" on public.places
  for all using (created_by_guide_id = public.current_guide_id())
  with check (created_by_guide_id = public.current_guide_id());

-- place_recommendations: guide manages own
drop policy if exists "recs_guide_manage_own" on public.place_recommendations;
create policy "recs_guide_manage_own" on public.place_recommendations
  for all using (guide_id = public.current_guide_id())
  with check (guide_id = public.current_guide_id());

-- posts: guide manages own authored posts
drop policy if exists "posts_guide_manage_own" on public.posts;
create policy "posts_guide_manage_own" on public.posts
  for all using (author_guide_id = public.current_guide_id())
  with check (author_guide_id = public.current_guide_id());

-- guide_bookings
alter table public.guide_bookings enable row level security;
drop policy if exists "gb_traveler_insert" on public.guide_bookings;
create policy "gb_traveler_insert" on public.guide_bookings
  for insert with check (traveler_id = auth.uid());
drop policy if exists "gb_traveler_read" on public.guide_bookings;
create policy "gb_traveler_read"   on public.guide_bookings
  for select using (traveler_id = auth.uid());
drop policy if exists "gb_guide_read" on public.guide_bookings;
create policy "gb_guide_read"      on public.guide_bookings
  for select using (guide_id = public.current_guide_id());
drop policy if exists "gb_guide_update" on public.guide_bookings;
create policy "gb_guide_update"    on public.guide_bookings
  for update using (guide_id = public.current_guide_id())
  with check (guide_id = public.current_guide_id());
drop policy if exists "gb_admin" on public.guide_bookings;
create policy "gb_admin"           on public.guide_bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- guide_reviews
alter table public.guide_reviews enable row level security;
drop policy if exists "gr_public_read" on public.guide_reviews;
create policy "gr_public_read"     on public.guide_reviews for select using (true);
drop policy if exists "gr_reviewer_insert" on public.guide_reviews;
create policy "gr_reviewer_insert" on public.guide_reviews
  for insert with check (reviewer_id = auth.uid());
drop policy if exists "gr_reviewer_update" on public.guide_reviews;
create policy "gr_reviewer_update" on public.guide_reviews
  for update using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());
drop policy if exists "gr_admin" on public.guide_reviews;
create policy "gr_admin"           on public.guide_reviews
  for all using (public.is_admin()) with check (public.is_admin());
