-- 0025 — driver scheduling (design doc, Turn 6 · 6a–6c)
--
-- Replaces `drivers.is_available` — a single 24/7 on/off switch — with an
-- opt-in shift calendar, and removes the "wait for someone to accept" step
-- from the traveler's side of a transfer booking.
--
-- Why not reuse the guide model (0022_guide_availability):
--   guide_unavailable_dates is a *blocklist* — "bookable unless a row says
--   otherwise". That is right for a guide, who is nominally available every
--   day. It is wrong for a driver, who does not work 24/7 and whose calendar
--   is mostly closed. So driver_shifts is an *allowlist*: no row = closed.
--
-- The three surfaces this feeds:
--   6a  /admin/drivers      — coverage, via driver_shift_coverage()
--   6b  /studio/schedule    — a driver's own template + opened days
--   6c  /transfer           — driver_slot_availability(), which aggregates
--                             every driver into anonymous vehicle counts

-- ── slots ───────────────────────────────────────────────────────────────────
-- Three fixed six-hour windows rather than free-form times. A driver picking
-- "Өглөө/Өдөр/Орой" is a 21-cell weekly grid they can fill in once; arbitrary
-- start/end times would be a scheduling UI nobody fills in at all. 00:00–06:00
-- is deliberately absent — airport runs in that window are the night before's
-- evening shift.
do $$ begin
  create type public.driver_shift_slot as enum ('morning', 'day', 'evening');
exception when duplicate_object then null; end $$;

-- ── driver scheduling preferences ───────────────────────────────────────────
-- schedule_open_until is denormalised on purpose: /admin/drivers renders "5
-- өдөр нээлттэй · 8/24 хүртэл" for every row in the table, and max(date) over
-- driver_shifts per row would be a correlated subquery per driver on a page
-- that already runs a 14-day coverage aggregate.
alter table public.drivers
  add column if not exists min_notice_hours   int  not null default 2,
  add column if not exists max_jobs_per_day   int  not null default 4,
  add column if not exists schedule_open_until date,
  -- "Давтах". When on, the horizon is topped back up automatically instead of
  -- the driver having to press the button every month. See topUpSchedule() in
  -- src/lib/drivers/scheduleData.ts for where that currently happens, and its
  -- one caveat: it runs when the driver opens their studio, so a driver who
  -- never visits still lapses. A scheduled job calling open_driver_shifts()
  -- for every auto-extend driver would close that gap.
  add column if not exists schedule_auto_extend boolean not null default true;

do $$ begin
  alter table public.drivers
    add constraint drivers_min_notice_sane check (min_notice_hours between 0 and 72);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.drivers
    add constraint drivers_max_jobs_sane check (max_jobs_per_day between 1 and 24);
exception when duplicate_object then null; end $$;

comment on column public.drivers.is_available is
  'Deprecated by 0025. Availability is now driver_shifts; nothing reads this.';

-- ── weekly template ─────────────────────────────────────────────────────────
-- What the driver fills in once ("Долоо хоногийн загвар"). A row means "I work
-- this weekday in this slot". This table is never read by the booking flow —
-- it is only the stencil that open_driver_shifts() stamps into driver_shifts.
create table if not exists public.driver_shift_templates (
  driver_id  uuid not null references public.drivers(id) on delete cascade,
  -- ISO weekday: 1 = Monday … 7 = Sunday, matching extract(isodow).
  weekday    int  not null check (weekday between 1 and 7),
  slot       public.driver_shift_slot not null,
  capacity   int  not null default 1 check (capacity between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (driver_id, weekday, slot)
);

-- ── opened days ─────────────────────────────────────────────────────────────
-- The actual bookable inventory. One row per driver per date per slot; absence
-- means closed, which is the whole point of the allowlist.
--
-- booked_count is denormalised against bookings on purpose: it is what makes
-- claim_driver_slot() a single atomic UPDATE. Counting bookings instead would
-- reintroduce the read-then-write race that 0024 had to fix for guides with a
-- unique index — and here there is no natural unique key to lean on, because a
-- slot legitimately holds several bookings.
create table if not exists public.driver_shifts (
  driver_id    uuid not null references public.drivers(id) on delete cascade,
  date         date not null,
  slot         public.driver_shift_slot not null,
  capacity     int  not null default 1 check (capacity between 1 and 8),
  booked_count int  not null default 0 check (booked_count >= 0),
  created_at   timestamptz not null default now(),
  primary key (driver_id, date, slot),
  constraint driver_shifts_not_oversold check (booked_count <= capacity)
);

-- The traveler's calendar asks "what is open between these two dates", across
-- every driver. That is a date-range scan, not a driver lookup, so it needs an
-- index the PK's leading driver_id column cannot serve.
create index if not exists idx_driver_shifts_date on public.driver_shifts (date, slot);

-- ── booking ↔ shift link ────────────────────────────────────────────────────
-- driver_visible_at is stored rather than derived so the reveal time shown to
-- the traveler ("05:40-д нээгдэнэ") cannot drift if a driver later edits their
-- notice preference, and so a support question months later has an answer.
alter table public.bookings
  add column if not exists shift_date        date,
  add column if not exists shift_slot        public.driver_shift_slot,
  add column if not exists driver_assigned_at timestamptz,
  add column if not exists driver_visible_at  timestamptz;

create index if not exists idx_bookings_shift on public.bookings (shift_date, shift_slot);

-- ────────────────────────────────────────────────────────────────────────────
-- open_driver_shifts — the "4 долоо хоног нээх" button
-- ────────────────────────────────────────────────────────────────────────────
-- Stamps the caller's weekly template across the next p_weeks weeks, starting
-- tomorrow (today is half-gone and its slots may already be past).
--
-- ON CONFLICT DO NOTHING, not DO UPDATE: a day the driver has since hand-edited
-- in the calendar — or one that already has a booking on it — must survive
-- re-running this. Pressing the button twice is a no-op, which is what someone
-- who is not sure whether it worked will do.
create or replace function public.open_driver_shifts(p_weeks int default 4)
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid := auth.uid();
  v_start date := (now() at time zone 'Asia/Tokyo')::date + 1;
  v_end   date;
begin
  if v_driver_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.drivers
    where id = v_driver_id and verification_status = 'approved'
  ) then
    raise exception 'driver not approved' using errcode = '42501';
  end if;
  if p_weeks is null or p_weeks < 1 or p_weeks > 12 then
    raise exception 'p_weeks must be between 1 and 12' using errcode = '22023';
  end if;

  v_end := v_start + (p_weeks * 7 - 1);

  insert into public.driver_shifts (driver_id, date, slot, capacity)
  select v_driver_id, d::date, t.slot, t.capacity
  from generate_series(v_start, v_end, interval '1 day') as d
  join public.driver_shift_templates t
    on t.driver_id = v_driver_id
   and t.weekday = extract(isodow from d)::int
  on conflict (driver_id, date, slot) do nothing;

  -- Only ever moves forward: a driver who opens 4 weeks and then 1 week should
  -- not see their horizon shrink.
  update public.drivers
  set schedule_open_until = greatest(coalesce(schedule_open_until, v_end), v_end),
      updated_at = now()
  where id = v_driver_id;

  return v_end;
end;
$$;

-- Note the explicit `anon`/`authenticated` in every revoke below.
--
-- `revoke … from public` is not enough on Supabase: the platform holds default
-- privileges that grant EXECUTE on new functions in this schema directly to
-- those two roles, so revoking from PUBLIC leaves the direct grants in place
-- and the function stays callable at /rest/v1/rpc/<name>. For
-- claim_driver_slot that would mean any anonymous caller could assign a driver
-- to any booking id they can guess, which is the exact opposite of "runs from
-- the payment path, never from a client".
revoke all on function public.open_driver_shifts(int) from public, anon, authenticated;
grant execute on function public.open_driver_shifts(int) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- driver_slot_availability — what /transfer's calendar renders
-- ────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER because this is the one place anonymous traffic is allowed
-- to learn anything about driver_shifts, and it must learn *only* the totals.
-- Reading the table directly would leak which driver is free when; this returns
-- "6 машин" and nothing that identifies whose.
--
-- Rows are only counted from approved drivers, and only where capacity is not
-- already used up, so a full slot reports vehicles_left = 0 rather than
-- disappearing — the calendar needs to draw "Дүүрэн" differently from "closed".
create or replace function public.driver_slot_availability(
  p_from date,
  p_to   date
)
returns table (
  date          date,
  slot          public.driver_shift_slot,
  vehicles_open int,
  vehicles_left int
)
language sql
stable
security definer
set search_path = public
as $$
  select s.date,
         s.slot,
         sum(s.capacity)::int                                 as vehicles_open,
         sum(greatest(s.capacity - s.booked_count, 0))::int    as vehicles_left
  from public.driver_shifts s
  join public.drivers d on d.id = s.driver_id
  where d.verification_status = 'approved'
    and s.date between p_from and p_to
  group by s.date, s.slot;
$$;

revoke all on function public.driver_slot_availability(date, date) from public, anon, authenticated;
grant execute on function public.driver_slot_availability(date, date) to anon, authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- driver_shift_coverage — the 14-day bar chart on /admin/drivers
-- ────────────────────────────────────────────────────────────────────────────
-- Admin-only: unlike the traveler aggregate this also reports how many distinct
-- drivers are behind the number, which is the difference between "we have cover"
-- and "one person is carrying Tuesday".
create or replace function public.driver_shift_coverage(
  p_from date,
  p_to   date
)
returns table (
  date          date,
  drivers_open  int,
  vehicles_open int,
  vehicles_booked int
)
language sql
stable
security definer
set search_path = public
as $$
  select s.date,
         count(distinct s.driver_id)::int as drivers_open,
         sum(s.capacity)::int             as vehicles_open,
         sum(s.booked_count)::int         as vehicles_booked
  from public.driver_shifts s
  join public.drivers d on d.id = s.driver_id
  where d.verification_status = 'approved'
    and s.date between p_from and p_to
    and public.is_admin()
  group by s.date;
$$;

revoke all on function public.driver_shift_coverage(date, date) from public, anon, authenticated;
grant execute on function public.driver_shift_coverage(date, date) to authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- claim_driver_slot — payment succeeded, hand the job to somebody
-- ────────────────────────────────────────────────────────────────────────────
-- This is the step that used to be a human pressing "accept". It runs from the
-- payment webhook under the service role, never from a client.
--
-- The whole assignment is one UPDATE … RETURNING against driver_shifts. Two
-- travelers paying for the last vehicle in a slot at the same moment are
-- serialised by the row lock that UPDATE takes: the second one re-evaluates
-- `booked_count < capacity`, fails it, and falls through to the next driver.
-- Nothing here reads a count and then trusts it.
--
-- Fairness rule: prefer the driver with the fewest jobs already that day, then
-- the one with the most headroom in the slot. Ties break on a stable hash of
-- the booking id so it is not always the same alphabetically-first driver.
create or replace function public.claim_driver_slot(
  p_booking_id uuid,
  p_date       date,
  p_slot       public.driver_shift_slot
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_pickup    timestamptz;
  v_notice    int;
begin
  select pickup_datetime into v_pickup
  from public.bookings where id = p_booking_id;
  if v_pickup is null then
    raise exception 'booking % not found', p_booking_id using errcode = 'P0002';
  end if;

  for v_driver_id in
    select s.driver_id
    from public.driver_shifts s
    join public.drivers d on d.id = s.driver_id
    where s.date = p_date
      and s.slot = p_slot
      and s.booked_count < s.capacity
      and d.verification_status = 'approved'
      and (
        select count(*) from public.bookings b
        where b.driver_id = s.driver_id
          and b.shift_date = p_date
          and b.status not in ('cancelled')
      ) < d.max_jobs_per_day
    order by (
        select count(*) from public.bookings b
        where b.driver_id = s.driver_id
          and b.shift_date = p_date
          and b.status not in ('cancelled')
      ) asc,
      (s.capacity - s.booked_count) desc,
      md5(s.driver_id::text || p_booking_id::text)
  loop
    update public.driver_shifts
    set booked_count = booked_count + 1
    where driver_id = v_driver_id
      and date = p_date
      and slot = p_slot
      and booked_count < capacity;

    -- Zero rows means somebody else took the last seat between the SELECT and
    -- the UPDATE. Try the next driver rather than failing the whole booking.
    if found then
      select min_notice_hours into v_notice from public.drivers where id = v_driver_id;

      update public.bookings
      set driver_id          = v_driver_id,
          shift_date         = p_date,
          shift_slot         = p_slot,
          status             = 'assigned',
          driver_assigned_at = now(),
          -- "Жолоочийн нэр, утас, улсын дугаар 05:40-д нээгдэнэ" — the traveler
          -- is told a time, so it is pinned here rather than recomputed later.
          driver_visible_at  = v_pickup - make_interval(hours => coalesce(v_notice, 2)),
          updated_at         = now()
      where id = p_booking_id;

      return v_driver_id;
    end if;
  end loop;

  -- Nobody free. The caller decides what that means — for a paid booking it is
  -- an operations problem, not a reason to lose the money.
  return null;
end;
$$;

-- No grant follows, deliberately: only the service role may assign a driver.
revoke all on function public.claim_driver_slot(uuid, date, public.driver_shift_slot)
  from public, anon, authenticated;

-- Releasing is the exact inverse and is just as racy in reverse: two cancels
-- for the same booking must not decrement the slot twice.
--
-- The SELECT … FOR UPDATE is what prevents that, and it is also why this cannot
-- be written as a single UPDATE … RETURNING: RETURNING hands back the *new*
-- row, so it would report the driver_id we just nulled out and there would be
-- nothing left to decrement. Locking first, then clearing, means the second
-- caller blocks, re-reads a null driver_id, and correctly does nothing.
create or replace function public.release_driver_slot(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_date date;
  v_slot public.driver_shift_slot;
begin
  select driver_id, shift_date, shift_slot
    into v_driver_id, v_date, v_slot
  from public.bookings
  where id = p_booking_id
  for update;

  if v_driver_id is null then return false; end if;

  update public.bookings
  set driver_id = null,
      driver_assigned_at = null,
      driver_visible_at = null,
      updated_at = now()
  where id = p_booking_id;

  update public.driver_shifts
  set booked_count = greatest(booked_count - 1, 0)
  where driver_id = v_driver_id and date = v_date and slot = v_slot;

  return true;
end;
$$;

-- Likewise: unassigning a driver is not something a client may ask for.
revoke all on function public.release_driver_slot(uuid) from public, anon, authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.driver_shift_templates enable row level security;
alter table public.driver_shifts enable row level security;

-- Templates are private working notes — nobody but their owner and an admin has
-- any reason to see them.
drop policy if exists "dst_owner_all" on public.driver_shift_templates;
create policy "dst_owner_all" on public.driver_shift_templates
  for all using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid());

-- Note there is deliberately no public SELECT on driver_shifts. The traveler
-- calendar goes through driver_slot_availability() so it only ever sees totals
-- — the design's "аялагч багтаамжийг хардаг, жолоочийг биш".
drop policy if exists "ds_owner_read" on public.driver_shifts;
create policy "ds_owner_read" on public.driver_shifts
  for select using (driver_id = auth.uid() or public.is_admin());

drop policy if exists "ds_owner_insert" on public.driver_shifts;
create policy "ds_owner_insert" on public.driver_shifts
  for insert with check (driver_id = auth.uid());

-- Owners may retime a slot but not fake its bookings; booked_count is moved
-- only by claim/release, which run as the definer and bypass this.
drop policy if exists "ds_owner_update" on public.driver_shifts;
create policy "ds_owner_update" on public.driver_shifts
  for update using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- Closing a slot deletes the row. A slot someone has paid for is not closable —
-- the driver has to cancel the job, not quietly vanish from it.
drop policy if exists "ds_owner_delete" on public.driver_shifts;
create policy "ds_owner_delete" on public.driver_shifts
  for delete using (driver_id = auth.uid() and booked_count = 0);

comment on table public.driver_shifts is
  'Bookable driver inventory. No row means closed — the inverse of guide_unavailable_dates.';
comment on table public.driver_shift_templates is
  'Weekly stencil a driver stamps forward with open_driver_shifts().';
