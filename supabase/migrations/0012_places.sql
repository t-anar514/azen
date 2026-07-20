-- 0012_places.sql
-- The discovery layer: city POIs (places) + guide attribution (place_recommendations).
-- Also gives cities a slug for the new /city/[slug] hub URLs.

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
create policy "places admin write" on public.places
  for all using (public.is_admin());

create policy "recs public read" on public.place_recommendations
  for select using (true);
create policy "recs admin write" on public.place_recommendations
  for all using (public.is_admin());

-- city slugs for /city/[slug]
alter table public.cities add column if not exists slug text unique;
update public.cities set slug = id || '-jp' where slug is null;
