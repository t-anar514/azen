-- Distance/route-based pricing for the /transfer service.
--
-- 0005_transfers.sql shipped every vehicle tier at one flat price regardless
-- of destination. That's fine for an MVP but wrong once bookings span
-- anything from "10 minutes from Narita" to "2 hours to Kyoto" — same car,
-- very different trip.
--
-- This migration keeps the same admin-curated-table philosophy as
-- flight_deals: an admin sets an exact price for a known (airport, zone,
-- vehicle) combination once (route_prices), and anything not curated yet
-- falls back to a per-km formula on the vehicle tier (base_fare +
-- price_per_km * zone.distance_km). A destination with no matching zone at
-- all (guest typed a one-off address) falls back one level further to the
-- vehicle's flat starting price. No live distance/geocoding API involved —
-- consistent with the "recommended", lighter-weight choices made for
-- flights/payments/driver-tracking in 0005.

alter table public.vehicle_options
  add column if not exists base_fare numeric(10,2) not null default 0,
  add column if not exists price_per_km numeric(10,2) not null default 0;

-- ───────────────────────────── transfer_zones ─────────────────────────────
-- A named destination area reachable from a given airport (e.g. "Tokyo —
-- Shinjuku / Shibuya (central)" from NRT), with an approximate one-way
-- driving distance used by the formula fallback. Admin-managed at
-- /admin/transfer-pricing.
create table if not exists public.transfer_zones (
  id uuid primary key default gen_random_uuid(),
  airport_code text not null,
  label text not null,
  distance_km numeric(6,1) not null,
  is_active boolean not null default true,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (airport_code, label)
);

drop trigger if exists trg_transfer_zones_touch on public.transfer_zones;
create trigger trg_transfer_zones_touch
  before update on public.transfer_zones
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── route_prices ─────────────────────────────
-- An admin-curated override price for one (zone, vehicle) pair. When a row
-- exists here it always wins over the formula — e.g. to hand-tune a popular
-- route below what the raw per-km math would produce.
create table if not exists public.route_prices (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.transfer_zones(id) on delete cascade,
  vehicle_option_id text not null references public.vehicle_options(id) on delete cascade,
  price numeric(10,2) not null,
  currency text not null default 'MNT',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (zone_id, vehicle_option_id)
);

drop trigger if exists trg_route_prices_touch on public.route_prices;
create trigger trg_route_prices_touch
  before update on public.route_prices
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── bookings: pricing trail ─────────────────────────────
-- Records *how* a booking's price was derived, so admins reviewing
-- /admin/transfers can tell a curated route price apart from a formula
-- estimate or an unlisted-destination fallback (and know which bookings are
-- worth double-checking before confirming).
do $$ begin
  create type public.pricing_source as enum ('route_table', 'formula', 'vehicle_flat');
exception when duplicate_object then null; end $$;

alter table public.bookings
  add column if not exists zone_id uuid references public.transfer_zones(id) on delete set null,
  add column if not exists distance_km numeric(6,1),
  add column if not exists pricing_source public.pricing_source not null default 'vehicle_flat';

-- ───────────────────────────── row level security ─────────────────────────────
alter table public.transfer_zones enable row level security;
alter table public.route_prices enable row level security;

-- Public needs to read active zones/prices to populate the booking form and
-- compute a live quote; only admins write.
drop policy if exists "transfer_zones_public_read" on public.transfer_zones;
create policy "transfer_zones_public_read" on public.transfer_zones
  for select using (is_active = true or public.is_admin());

drop policy if exists "transfer_zones_admin_write" on public.transfer_zones;
create policy "transfer_zones_admin_write" on public.transfer_zones
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "route_prices_public_read" on public.route_prices;
create policy "route_prices_public_read" on public.route_prices
  for select using (is_active = true or public.is_admin());

drop policy if exists "route_prices_admin_write" on public.route_prices;
create policy "route_prices_admin_write" on public.route_prices
  for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────────── indexes ─────────────────────────────
create index if not exists idx_transfer_zones_airport on public.transfer_zones (airport_code, is_active);
create index if not exists idx_route_prices_zone on public.route_prices (zone_id);
create index if not exists idx_bookings_zone on public.bookings (zone_id);

-- ───────────────────────────── seed: per-vehicle rate cards ─────────────────────────────
-- base_fare + price_per_km chosen so the formula lands close to each tier's
-- existing flat price (from 0005) at a "typical" ~70km airport run, so
-- existing routes don't jump in price the day this ships.
update public.vehicle_options set base_fare = 15000, price_per_km = 400 where id = 'sedan';
update public.vehicle_options set base_fare = 25000, price_per_km = 650 where id = 'minivan';
update public.vehicle_options set base_fare = 30000, price_per_km = 900 where id = 'premium';

-- ───────────────────────────── seed: zones ─────────────────────────────
insert into public.transfer_zones (airport_code, label, distance_km, order_index)
values
  ('NRT', 'Tokyo — Shinjuku / Shibuya (central)', 70, 0),
  ('NRT', 'Narita city / airport-area hotels', 15, 1),
  ('HND', 'Tokyo — Shinjuku / Shibuya (central)', 20, 0),
  ('KIX', 'Osaka — Namba / Umeda (central)', 45, 0),
  ('KIX', 'Kyoto (central)', 75, 1),
  ('ITM', 'Osaka — Namba / Umeda (central)', 15, 0),
  ('FUK', 'Fukuoka — Hakata / Tenjin (central)', 12, 0),
  ('CTS', 'Sapporo (central)', 45, 0),
  ('NGO', 'Nagoya (central)', 35, 0)
on conflict (airport_code, label) do nothing;

-- ───────────────────────────── seed: a couple of curated overrides ─────────────────────────────
-- Demonstrates the override mechanism — everything else falls through to the
-- formula until an admin curates it from /admin/transfer-pricing.
insert into public.route_prices (zone_id, vehicle_option_id, price)
select z.id, 'sedan', 42000
from public.transfer_zones z
where z.airport_code = 'NRT' and z.label = 'Narita city / airport-area hotels'
on conflict (zone_id, vehicle_option_id) do nothing;

insert into public.route_prices (zone_id, vehicle_option_id, price)
select z.id, 'minivan', 26000
from public.transfer_zones z
where z.airport_code = 'NRT' and z.label = 'Narita city / airport-area hotels'
on conflict (zone_id, vehicle_option_id) do nothing;
