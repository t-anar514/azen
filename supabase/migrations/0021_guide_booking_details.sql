-- 0021 — guide booking details (design: staged "Хөтөч захиалах" flow)
--
-- The redesigned booking modal collects a start time and the traveler's main
-- interests, and the confirmation screen shows a short human-readable code.
-- None of those had a home on guide_bookings, which only knew date + hours.
--
-- All three columns are additive and nullable, so existing rows and the
-- current /api/guides/bookings payload keep working unchanged.

alter table public.guide_bookings
  add column if not exists start_time time,
  add column if not exists interests  text[] not null default '{}',
  add column if not exists code       text;

-- Short traveler-facing reference ("AZ-6D41KM"), generated in the API the same
-- way transfer bookings generate trip_code. Unique so it can be looked up, but
-- nullable because rows created before this migration have none.
create unique index if not exists idx_guide_bookings_code
  on public.guide_bookings (code)
  where code is not null;

comment on column public.guide_bookings.start_time is
  'Meeting time; end time is start_time + hours.';
comment on column public.guide_bookings.interests is
  'Traveler-selected interest tags shown to the guide (Foodie, Nightlife, …).';
comment on column public.guide_bookings.code is
  'Short reference shown on the confirmation screen.';
