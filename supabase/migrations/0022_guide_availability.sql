-- 0022 — guide availability (design: /studio/availability)
--
-- Blocklist model: a guide is bookable unless a row here says otherwise.
-- One row per blocked day. The composite PK is both the dedupe rule and the
-- only index the reads need — "all blocked dates for a guide in a range" and
-- "is this one date blocked" are both covered by it.

create table if not exists public.guide_unavailable_dates (
  guide_id   uuid not null references public.guides(id) on delete cascade,
  date       date not null,
  created_at timestamptz not null default now(),
  primary key (guide_id, date)
);

alter table public.guide_unavailable_dates enable row level security;

-- Public read: the booking calendar must resolve availability for anonymous
-- visitors. This exposes which days a guide is busy, which is exactly what the
-- calendar renders anyway.
drop policy if exists "gud_public_read" on public.guide_unavailable_dates;
create policy "gud_public_read" on public.guide_unavailable_dates
  for select using (true);

-- Owner-only writes. No UPDATE policy: a row's only meaning is "blocked", so
-- changing a date is a delete plus an insert.
drop policy if exists "gud_owner_insert" on public.guide_unavailable_dates;
create policy "gud_owner_insert" on public.guide_unavailable_dates
  for insert with check (guide_id = public.current_guide_id());

drop policy if exists "gud_owner_delete" on public.guide_unavailable_dates;
create policy "gud_owner_delete" on public.guide_unavailable_dates
  for delete using (guide_id = public.current_guide_id());

comment on table public.guide_unavailable_dates is
  'Days a guide cannot work. Absence of a row means bookable.';
