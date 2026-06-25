-- Airport transfer booking + cheap-flights-deals service.
-- Adds: 'driver' role, drivers, vehicle_options, bookings, payments, flight_deals.
-- Run in the Supabase SQL editor like the previous migrations.
--
-- NOTE on the ALTER TYPE below: Postgres has historically disallowed using a
-- brand-new enum value in the *same transaction* it was added in. If the
-- Supabase SQL editor errors with something like "unsafe use of new value of
-- enum type", run just the ALTER TYPE statement by itself first, then re-run
-- the rest of this file.
do $$ begin
  alter type public.user_role add value if not exists 'driver';
exception when duplicate_object then null; end $$;

-- ───────────────────────────── enums ─────────────────────────────
do $$ begin
  create type public.driver_verification_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending_payment', 'confirmed', 'assigned', 'en_route', 'arrived',
    'picked_up', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

-- ───────────────────────────── drivers ─────────────────────────────
-- One row per driver applicant. id == profiles.id (drivers are platform users
-- who applied), so RLS can key off auth.uid() directly.
create table if not exists public.drivers (
  id uuid primary key references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  license_number text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_plate text not null,
  id_document_url text,
  license_document_url text,
  vehicle_document_url text,
  verification_status public.driver_verification_status not null default 'pending',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Promote to the 'driver' role the moment an admin approves the application
-- (mirrors trg_sync_guide_role in 0001_init.sql).
create or replace function public.sync_driver_role()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.verification_status = 'approved' and (old is null or old.verification_status is distinct from 'approved') then
    update public.profiles set role = 'driver' where id = new.id and role = 'user';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_driver_role on public.drivers;
create trigger trg_sync_driver_role
  before insert or update of verification_status on public.drivers
  for each row execute function public.sync_driver_role();

-- ───────────────────────────── vehicle_options ─────────────────────────────
-- Fixed, flat pricing per vehicle tier (no distance/surge calculation for the
-- MVP) — admin-editable from /admin/transfers (or directly in SQL for now).
create table if not exists public.vehicle_options (
  id text primary key,
  name text not null,
  description text,
  capacity int not null default 4,
  price numeric(10,2) not null,
  currency text not null default 'MNT',
  image text,
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── bookings ─────────────────────────────
-- user_id is nullable to support guest checkout. The booking's own `id`
-- (an unguessable uuid) doubles as the access token for the public
-- confirmation/tracking pages — see /api/bookings/[id]/route.ts.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  flight_number text not null,
  flight_direction text not null default 'arrival', -- 'arrival' | 'departure'
  pickup_datetime timestamptz not null,
  pickup_location text not null,
  dropoff_location text not null,
  vehicle_option_id text not null references public.vehicle_options(id),
  price numeric(10,2) not null,
  currency text not null default 'MNT',
  status public.booking_status not null default 'pending_payment',
  driver_id uuid references public.drivers(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_touch on public.bookings;
create trigger trg_bookings_touch
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── payments (stub) ─────────────────────────────
-- No real gateway wired up yet — rows are created as 'pending' at booking
-- time and flipped to 'paid' manually by an admin once QPay (or whatever's
-- chosen later) is integrated. Keeps the booking flow functional now without
-- blocking on payment credentials.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(10,2) not null,
  currency text not null default 'MNT',
  provider text not null default 'qpay',
  status public.payment_status not null default 'pending',
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_touch on public.payments;
create trigger trg_payments_touch
  before update on public.payments
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── flight_deals (/flights) ─────────────────────────────
-- Admin-curated for now (paste in a good deal + a link to the booking site).
-- The "swap point" for a future live scraper is the data-access function in
-- src/lib/flights/provider.ts, not this table shape — a scraper can upsert
-- into this same table on a schedule with zero UI changes required.
create table if not exists public.flight_deals (
  id uuid primary key default gen_random_uuid(),
  origin_city text not null,
  origin_code text,
  destination_city text not null default 'Tokyo',
  destination_code text,
  airline text,
  price numeric(10,2) not null,
  currency text not null default 'MNT',
  depart_date date,
  return_date date,
  deal_url text not null,
  source text,
  is_active boolean not null default true,
  order_index int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_flight_deals_touch on public.flight_deals;
create trigger trg_flight_deals_touch
  before update on public.flight_deals
  for each row execute function public.touch_updated_at();

-- ───────────────────────────── row level security ─────────────────────────────
alter table public.drivers enable row level security;
alter table public.vehicle_options enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.flight_deals enable row level security;

-- drivers: an applicant can see/update their own row; admins see/update all.
drop policy if exists "drivers_select" on public.drivers;
create policy "drivers_select" on public.drivers
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "drivers_insert_own" on public.drivers;
create policy "drivers_insert_own" on public.drivers
  for insert with check (id = auth.uid());

drop policy if exists "drivers_update" on public.drivers;
create policy "drivers_update" on public.drivers
  for update using (id = auth.uid() or public.is_admin());

-- vehicle_options: public read (active only); admin write.
drop policy if exists "vehicle_options_public_read" on public.vehicle_options;
create policy "vehicle_options_public_read" on public.vehicle_options
  for select using (is_active = true or public.is_admin());

drop policy if exists "vehicle_options_admin_write" on public.vehicle_options;
create policy "vehicle_options_admin_write" on public.vehicle_options
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings: anyone can create one (this is how guest checkout works — no
-- auth required to book a transfer). Reads are restricted to the owning
-- user, the assigned driver, or an admin; the guest-access path (no
-- user_id) goes through a server route using the booking id as a bearer
-- token instead of relying on this policy — see /api/bookings/[id].
drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings
  for insert with check (true);

drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings
  for select using (
    user_id = auth.uid()
    or driver_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "bookings_update" on public.bookings;
create policy "bookings_update" on public.bookings
  for update using (
    driver_id = auth.uid()
    or public.is_admin()
  );

-- payments: same visibility as the parent booking; only admins write.
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = payments.booking_id
        and (b.user_id = auth.uid() or b.driver_id = auth.uid())
    )
  );

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments
  for insert with check (true);

drop policy if exists "payments_admin_write" on public.payments;
create policy "payments_admin_write" on public.payments
  for update using (public.is_admin()) with check (public.is_admin());

-- flight_deals: public read (active only); admin write.
drop policy if exists "flight_deals_public_read" on public.flight_deals;
create policy "flight_deals_public_read" on public.flight_deals
  for select using (is_active = true or public.is_admin());

drop policy if exists "flight_deals_admin_write" on public.flight_deals;
create policy "flight_deals_admin_write" on public.flight_deals
  for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────────── helpful indexes ─────────────────────────────
create index if not exists idx_bookings_user on public.bookings (user_id);
create index if not exists idx_bookings_driver on public.bookings (driver_id);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_drivers_verification on public.drivers (verification_status);
create index if not exists idx_flight_deals_active on public.flight_deals (is_active, order_index);
create index if not exists idx_payments_booking on public.payments (booking_id);

-- ───────────────────────────── seed: vehicle options ─────────────────────────────
insert into public.vehicle_options (id, name, description, capacity, price, currency, order_index)
values
  ('sedan', 'Standard Sedan', 'Comfortable car for up to 3 passengers + luggage', 3, 45000, 'MNT', 0),
  ('minivan', 'Minivan', 'Spacious van for groups of up to 6', 6, 75000, 'MNT', 1),
  ('premium', 'Premium', 'Higher-end vehicle with extra legroom', 3, 95000, 'MNT', 2)
on conflict (id) do nothing;

-- ───────────────────────────── seed: sample flight deals ─────────────────────────────
-- Placeholder content so /flights isn't empty before an admin adds real deals.
insert into public.flight_deals (origin_city, origin_code, destination_city, destination_code, airline, price, currency, depart_date, return_date, deal_url, source, order_index)
values
  ('Ulaanbaatar', 'UBN', 'Tokyo', 'NRT', 'MIAT Mongolian Airlines', 980000, 'MNT', current_date + interval '30 days', current_date + interval '37 days', 'https://www.google.com/travel/flights', 'sample', 0),
  ('Ulaanbaatar', 'UBN', 'Osaka', 'KIX', 'Korean Air (via ICN)', 1120000, 'MNT', current_date + interval '45 days', current_date + interval '52 days', 'https://www.google.com/travel/flights', 'sample', 1)
on conflict do nothing;
