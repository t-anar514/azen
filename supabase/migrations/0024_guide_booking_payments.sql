-- Wire payments for guide bookings. Requires 0023 to have been committed first.
--
-- Model: a traveler pays up front and the guide cannot decline. The guide's
-- only way to say no is the availability calendar (0022), used in advance.

-- ── booking columns ─────────────────────────────────────────────────────────
-- `amount` stays the JPY guide payout. `amount_mnt` is what Wire actually
-- charges, and fx_rate/fx_locked_at record how one became the other so a
-- disputed charge can be reconstructed months later.
alter table public.guide_bookings
  add column if not exists amount_mnt      bigint,
  add column if not exists fx_rate         numeric(12,6),
  add column if not exists fx_locked_at    timestamptz,
  add column if not exists hold_expires_at timestamptz;

-- ── the race fix ────────────────────────────────────────────────────────────
-- Removing the guide's decline button removed the thing that quietly absorbed
-- double-bookings. isDateBookable() reads and then inserts, so two requests
-- arriving together both pass the check before either writes — survivable when
-- a human reviews afterwards, not survivable once both travelers have paid.
-- A constraint does not care how concurrent the callers are.
--
-- 'pending' is excluded: it is the legacy pre-payment state and no new row
-- uses it. declined/cancelled/expired are excluded so a dead booking never
-- holds a date hostage.
create unique index if not exists uq_gb_guide_date_active
  on public.guide_bookings (guide_id, trip_date)
  where status in ('awaiting_payment', 'confirmed', 'completed');

create index if not exists idx_gb_hold_expiry
  on public.guide_bookings (hold_expires_at)
  where status = 'awaiting_payment';

-- ── payments: generalised, not duplicated ───────────────────────────────────
-- 0005 created this table as an explicit stub "flipped to 'paid' manually by an
-- admin once QPay (or whatever's chosen later) is integrated". Wire is that
-- gateway, and transfers will want it too, so this grows a second parent rather
-- than spawning a rival table and a second reconciliation surface.
alter table public.payments alter column booking_id drop not null;

alter table public.payments
  add column if not exists guide_booking_id uuid
    references public.guide_bookings(id) on delete cascade,
  add column if not exists wire_payment_intent_id   text,
  add column if not exists wire_checkout_session_id text,
  add column if not exists amount_mnt bigint;

-- Exactly one parent. Existing rows all have booking_id set, so this validates
-- against current data without a rewrite.
do $$ begin
  alter table public.payments
    add constraint payments_one_parent
    check (num_nonnulls(booking_id, guide_booking_id) = 1);
exception when duplicate_object then null; end $$;

-- Wire redelivers events; this is what makes "already recorded" detectable.
create unique index if not exists uq_payments_wire_intent
  on public.payments (wire_payment_intent_id)
  where wire_payment_intent_id is not null;

create index if not exists idx_payments_guide_booking
  on public.payments (guide_booking_id)
  where guide_booking_id is not null;

-- ── payments RLS ────────────────────────────────────────────────────────────
-- Extends 0005's policy with the guide-booking parent: the traveler who paid
-- and the guide being paid can both read the row.
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = payments.booking_id
        and (b.user_id = auth.uid() or b.driver_id = auth.uid())
    )
    or exists (
      select 1 from public.guide_bookings gb
      where gb.id = payments.guide_booking_id
        and (gb.traveler_id = auth.uid()
             or gb.guide_id = public.current_guide_id())
    )
  );

-- Narrowed from `with check (true)`. A client must never be able to write a row
-- asserting payment; guide-booking payments are written only by the webhook
-- under the service role, which bypasses RLS entirely.
--
-- The transfer path (booking_id) keeps its previous permissiveness on purpose:
-- 0005's booking flow inserts from the caller's session at
-- src/app/api/bookings/route.ts and tightening it here would break that flow.
-- That pre-existing looseness is tracked as separate work.
drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments
  for insert with check (guide_booking_id is null);

-- ── webhook dedupe ──────────────────────────────────────────────────────────
-- Wire's docs: "the same event may be delivered more than once. Dedupe on the
-- event id." Primary key does the deduping; a second delivery hits a conflict.
create table if not exists public.wire_webhook_events (
  event_id    text primary key,
  event_type  text,
  received_at timestamptz not null default now()
);

alter table public.wire_webhook_events enable row level security;
-- No policies, by design: service role only. Nothing user-facing reads this.

-- ── booking hold ────────────────────────────────────────────────────────────
-- Everything that must be atomic with the insert lives in here: the stale-hold
-- sweep, the blocked-date check, and the insert itself.
--
-- SERVICE ROLE ONLY. If this were callable by `authenticated`, any logged-in
-- user could invoke it over PostgREST with p_amount_mnt => 1 and book a guide
-- for one tögrög. The caller (the checkout route) verifies the session and
-- computes the money server-side, which is why p_traveler_id is trusted here.
create or replace function public.create_booking_hold(
  p_guide_id     uuid,
  p_traveler_id  uuid,
  p_trip_date    date,
  p_hours        int,
  p_amount       numeric,
  p_amount_mnt   bigint,
  p_fx_rate      numeric,
  p_code         text,
  p_city         text default null,
  p_note         text default null,
  p_start_time   time default null,
  p_interests    text[] default '{}',
  p_hold_minutes int default 15
)
returns public.guide_bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.guide_bookings;
begin
  if p_trip_date < current_date then
    raise exception 'date_past' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.guide_unavailable_dates
    where guide_id = p_guide_id and date = p_trip_date
  ) then
    raise exception 'date_blocked' using errcode = '23514';
  end if;

  -- An abandoned checkout must not hold the date past its expiry. Sweeping in
  -- the same transaction as the insert is the point: the sweep cannot race the
  -- insert that follows it.
  update public.guide_bookings
     set status = 'expired', updated_at = now()
   where guide_id = p_guide_id
     and trip_date = p_trip_date
     and status = 'awaiting_payment'
     and hold_expires_at < now();

  -- A genuine conflict raises unique_violation (23505) off
  -- uq_gb_guide_date_active. The route maps that to 409.
  insert into public.guide_bookings (
    guide_id, traveler_id, trip_date, hours, city, note, start_time,
    interests, code, amount, amount_mnt, fx_rate, fx_locked_at,
    status, hold_expires_at
  ) values (
    p_guide_id, p_traveler_id, p_trip_date, p_hours, p_city, p_note,
    p_start_time, coalesce(p_interests, '{}'), p_code, p_amount, p_amount_mnt,
    p_fx_rate, now(), 'awaiting_payment',
    now() + make_interval(mins => p_hold_minutes)
  ) returning * into v_row;

  return v_row;
end $$;

revoke all on function public.create_booking_hold(
  uuid, uuid, date, int, numeric, bigint, numeric, text, text, text,
  time, text[], int
) from public, anon, authenticated;

grant execute on function public.create_booking_hold(
  uuid, uuid, date, int, numeric, bigint, numeric, text, text, text,
  time, text[], int
) to service_role;
