-- Link /planner budget participants to real Azen accounts, and make the
-- budget tables realtime.
--
-- 0009 gave trip_participants a nullable user_id but nothing ever set it —
-- every participant was a "ghost" name the owner typed. Meanwhile real users
-- already join trips through trip_collaborators (0008: email invite →
-- accept). This migration bridges the two with triggers, so the roster stays
-- honest without trusting any client to remember to sync it:
--
--   * creating a trip auto-adds the owner as a linked participant;
--   * a collaborator becomes a linked participant the moment their invite
--     flips to accepted (the invite-accept page runs as the invited user, who
--     per RLS can NOT insert participants — hence SECURITY DEFINER triggers);
--   * existing trips/collaborators are backfilled.
--
-- Ghost participants (user_id null) keep working exactly as before — a
-- partner who shares costs but never logs in is still just a name.

-- ── one linked participant per (trip, user) ──────────────────────────────────
-- Partial unique index so the triggers can upsert idempotently; ghosts are
-- exempt (multiple people can share a display name).
create unique index if not exists uq_trip_participants_trip_user
  on public.trip_participants (trip_id, user_id) where user_id is not null;

-- ── helpers ──────────────────────────────────────────────────────────────────
-- Same palette the client assigns round-robin (see planner/page.tsx).
create or replace function public.next_participant_color(p_trip_id uuid)
returns text language sql stable as $$
  select (array['#0ea5e9','#f97316','#10b981','#8b5cf6','#ef4444','#eab308'])
         [(select count(*)::int from public.trip_participants where trip_id = p_trip_id) % 6 + 1]
$$;

-- Best display name we have for an account: profile name, else the mailbox
-- part of their email. SECURITY DEFINER because the caller (e.g. an accepting
-- collaborator) can't necessarily read the other profile row.
create or replace function public.participant_display_name(p_user_id uuid)
returns text language sql stable security definer as $$
  select coalesce(
    nullif(p.full_name, ''),
    nullif(split_part(coalesce(p.email, ''), '@', 1), '')
  ) from public.profiles p where p.id = p_user_id
$$;

-- ── trigger: trip owner is always a participant ─────────────────────────────
create or replace function public.ensure_owner_participant()
returns trigger language plpgsql security definer as $$
begin
  if new.owner_id is null then return new; end if;
  insert into public.trip_participants (trip_id, user_id, display_name, color)
  values (
    new.id,
    new.owner_id,
    coalesce(public.participant_display_name(new.owner_id), 'Аялагч'),
    public.next_participant_color(new.id)
  )
  on conflict (trip_id, user_id) where user_id is not null do nothing;
  return new;
end;
$$;

drop trigger if exists trg_itineraries_owner_participant on public.itineraries;
create trigger trg_itineraries_owner_participant
  after insert on public.itineraries
  for each row execute function public.ensure_owner_participant();

-- ── trigger: accepted collaborator becomes a participant ────────────────────
create or replace function public.ensure_collaborator_participant()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'accepted' and new.user_id is not null then
    insert into public.trip_participants (trip_id, user_id, display_name, color)
    values (
      new.trip_id,
      new.user_id,
      coalesce(
        public.participant_display_name(new.user_id),
        split_part(new.invited_email, '@', 1)
      ),
      public.next_participant_color(new.trip_id)
    )
    on conflict (trip_id, user_id) where user_id is not null do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_collaborators_participant on public.trip_collaborators;
create trigger trg_collaborators_participant
  after insert or update on public.trip_collaborators
  for each row execute function public.ensure_collaborator_participant();

-- ── backfill existing data ──────────────────────────────────────────────────
insert into public.trip_participants (trip_id, user_id, display_name, color)
select t.id, t.owner_id,
       coalesce(public.participant_display_name(t.owner_id), 'Аялагч'),
       public.next_participant_color(t.id)
from public.itineraries t
where t.owner_id is not null
on conflict (trip_id, user_id) where user_id is not null do nothing;

insert into public.trip_participants (trip_id, user_id, display_name, color)
select c.trip_id, c.user_id,
       coalesce(public.participant_display_name(c.user_id), split_part(c.invited_email, '@', 1)),
       public.next_participant_color(c.trip_id)
from public.trip_collaborators c
where c.status = 'accepted' and c.user_id is not null
on conflict (trip_id, user_id) where user_id is not null do nothing;

-- ── realtime for the budget tables ──────────────────────────────────────────
-- usePlannerRealtime refetches the roster/splits on any event. REPLICA
-- IDENTITY FULL so DELETE events still carry trip_id and pass the channel's
-- trip_id filter (default identity strips everything but the PK).
alter table public.trip_participants replica identity full;
alter table public.item_cost_splits replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.trip_participants;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table public.item_cost_splits;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
