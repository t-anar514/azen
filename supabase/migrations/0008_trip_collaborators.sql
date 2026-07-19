-- Turns /planner sharing from "owner edits, everyone else views" into real
-- multi-editor collaboration. A trip keeps exactly one owner
-- (itineraries.owner_id, unchanged) plus zero or more collaborators with an
-- editor/viewer role. Invites are matched by email; a collaborator row
-- starts 'pending' and flips to 'accepted' when the invited user opens the
-- invite link while logged in with a matching email.

-- profiles needs an email column so a pending invite can be matched to a
-- real account without an admin-only lookup against auth.users.
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- Backfill existing accounts.
update public.profiles p set email = u.email
from auth.users u where u.id = p.id and p.email is null;

do $$ begin
  create type public.collaborator_role as enum ('editor', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.collaborator_status as enum ('pending', 'accepted');
exception when duplicate_object then null; end $$;

create table if not exists public.trip_collaborators (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  invited_email text not null,
  user_id uuid references public.profiles(id) on delete cascade, -- filled in on accept
  role public.collaborator_role not null default 'editor',
  status public.collaborator_status not null default 'pending',
  invited_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, invited_email)
);

drop trigger if exists trg_trip_collaborators_touch on public.trip_collaborators;
create trigger trg_trip_collaborators_touch
  before update on public.trip_collaborators
  for each row execute function public.touch_updated_at();

-- ── reusable access-check helpers (also used by 0009's budget tables) ──

create or replace function public.can_edit_trip(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.itineraries t where t.id = p_trip_id and t.owner_id = auth.uid())
    or exists (
      select 1 from public.trip_collaborators c
      where c.trip_id = p_trip_id and c.user_id = auth.uid()
        and c.status = 'accepted' and c.role = 'editor'
    )
    or public.is_admin();
$$;

create or replace function public.can_view_trip(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select public.can_edit_trip(p_trip_id)
    or exists (select 1 from public.itineraries t where t.id = p_trip_id and t.is_public = true)
    or exists (
      select 1 from public.trip_collaborators c
      where c.trip_id = p_trip_id and c.user_id = auth.uid() and c.status = 'accepted'
    );
$$;

-- ── extend itineraries RLS to use the helpers ──

drop policy if exists "itineraries_select" on public.itineraries;
create policy "itineraries_select" on public.itineraries
  for select using (public.can_view_trip(id));

drop policy if exists "itineraries_update" on public.itineraries;
create policy "itineraries_update" on public.itineraries
  for update using (public.can_edit_trip(id)) with check (public.can_edit_trip(id));

-- ── trip_collaborators RLS ──

alter table public.trip_collaborators enable row level security;

drop policy if exists "trip_collaborators_select" on public.trip_collaborators;
create policy "trip_collaborators_select" on public.trip_collaborators
  for select using (
    user_id = auth.uid()
    or invited_email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "trip_collaborators_insert" on public.trip_collaborators;
create policy "trip_collaborators_insert" on public.trip_collaborators
  for insert with check (
    exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
  );

-- Covers two very different actions under one policy: the owner managing
-- (changing role, re-sending), and the invited user accepting their own
-- pending invite by matching email — see /planner/invite/[id].
drop policy if exists "trip_collaborators_update" on public.trip_collaborators;
create policy "trip_collaborators_update" on public.trip_collaborators
  for update using (
    invited_email = (select email from public.profiles where id = auth.uid())
    or exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

drop policy if exists "trip_collaborators_delete" on public.trip_collaborators;
create policy "trip_collaborators_delete" on public.trip_collaborators
  for delete using (
    exists (select 1 from public.itineraries t where t.id = trip_id and t.owner_id = auth.uid())
    or public.is_admin()
  );

create index if not exists idx_trip_collaborators_trip on public.trip_collaborators (trip_id);
create index if not exists idx_trip_collaborators_user on public.trip_collaborators (user_id);
create index if not exists idx_trip_collaborators_email on public.trip_collaborators (invited_email);

-- ── realtime ──
-- usePlannerRealtime subscribes to postgres_changes on itineraries; UPDATE
-- events are only broadcast for tables in the supabase_realtime publication,
-- which is empty by default on hosted Supabase.
do $$ begin
  alter publication supabase_realtime add table public.itineraries;
exception
  when duplicate_object then null; -- already in the publication
  when undefined_object then null; -- publication doesn't exist (non-Supabase pg)
end $$;
