-- Switch the /transfer rate card to JPY and make it a clean distance-based
-- price/km model.
--
-- Context: the rest of Azen stores money in JPY (see 0007_exchange_rates.sql —
-- planner/flights all render via formatCurrency(amountJpy, …)), but the
-- transfer subsystem shipped in 0005/0006 priced everything in MNT. That left
-- /transfer as the odd one out and made the fare card hard to reason about for
-- a Japan-based driver who quotes in yen. This migration reprices the whole
-- transfer rate card in JPY and re-tunes each vehicle's base_fare + price_per_km
-- so the formula (base_fare + price_per_km * zone.distance_km) lands on round
-- yen amounts for the flagship Narita → Shinjuku run (~68 km):
--   Седан  ¥12,000   Вэн  ¥18,000   Микро  ¥26,000
--
-- Vehicles are also renamed/re-described to match the customer-facing booking
-- form (Седан / Вэн / Микро with passenger + luggage capacity), and the NRT
-- central zone distance is corrected to 68 km.

-- ───────────────────────────── currency defaults → JPY ─────────────────────────────
alter table public.vehicle_options alter column currency set default 'JPY';
alter table public.route_prices    alter column currency set default 'JPY';

-- ───────────────────────────── vehicle rate card (JPY) ─────────────────────────────
-- price          = flat starting price shown before a destination is picked
-- base_fare      = fixed portion of the distance formula
-- price_per_km   = the admin-editable per-km rate (editable at /admin/transfer-pricing)
-- capacity/name/description mirror the three cards on /transfer.
update public.vehicle_options
  set name = 'Седан',
      description = '1–3 хүн · 2 чемодан',
      capacity = 3,
      currency = 'JPY',
      price = 12000,
      base_fare = 4000,
      price_per_km = 118
  where id = 'sedan';

update public.vehicle_options
  set name = 'Вэн',
      description = '4–6 хүн · 5 чемодан',
      capacity = 6,
      currency = 'JPY',
      price = 18000,
      base_fare = 6000,
      price_per_km = 176
  where id = 'minivan';

-- 'premium' becomes the "Микро" (mini-bus) tier in the new line-up.
update public.vehicle_options
  set name = 'Микро',
      description = '7–9 хүн · 9 чемодан',
      capacity = 9,
      currency = 'JPY',
      price = 26000,
      base_fare = 9000,
      price_per_km = 250
  where id = 'premium';

-- ───────────────────────────── zone distance fix ─────────────────────────────
-- Real Narita → central Tokyo is ~68 km, not the rounded 70 seeded in 0006.
update public.transfer_zones
  set distance_km = 68
  where airport_code = 'NRT' and label = 'Tokyo — Shinjuku / Shibuya (central)';

-- ───────────────────────────── curated overrides → JPY ─────────────────────────────
-- The two demo overrides from 0006 were in MNT; reprice them in JPY so the
-- curated-price example still works (Narita-area short hop). These sit above
-- the ~15 km formula price to demonstrate a hand-tuned minimum.
update public.route_prices rp
  set currency = 'JPY', price = 8000
  from public.transfer_zones z
  where rp.zone_id = z.id
    and z.airport_code = 'NRT' and z.label = 'Narita city / airport-area hotels'
    and rp.vehicle_option_id = 'sedan';

update public.route_prices rp
  set currency = 'JPY', price = 11000
  from public.transfer_zones z
  where rp.zone_id = z.id
    and z.airport_code = 'NRT' and z.label = 'Narita city / airport-area hotels'
    and rp.vehicle_option_id = 'minivan';
