-- Budget splitting for /planner. Deliberately decoupled from
-- trip_collaborators (app access) — a participant can be a real Azen user
-- (user_id set) or a "ghost" person the owner adds by name only, e.g. a
-- partner who's in the cost split but never logs into Azen.

create table if not exists public.trip_participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  color text, -- UI avatar chip color, assigned client-side on creation
  created_at timestamptz not null default now()
);

-- Per-item cost assignment. NOTE: items live inside itineraries.items as a
-- single jsonb array, not as their own rows, so item_id is a loose reference
-- into that array (matches ItemType.id in src/components/planner/Timeline.tsx)
-- rather than a real foreign key — Postgres can't FK into a jsonb array
-- element. The app is responsible for deleting the matching split row when
-- an item is deleted from the array. This is a deliberate shortcut to avoid
-- normalizing items into their own table right now; revisit if that jsonb
-- design ever becomes a real bottleneck.
create table if not exists public.item_cost_splits (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.itineraries(id) on delete cascade,
  item_id text not null,
  paid_by uuid references public.trip_participants(id) on delete set null,
  split_between uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, item_id)
);

drop trigger if exists trg_item_cost_splits_touch on public.item_cost_splits;
create trigger trg_item_cost_splits_touch
  before update on public.item_cost_splits
  for each row execute function public.touch_updated_at();

alter table public.trip_participants enable row level security;
alter table public.item_cost_splits enable row level security;

drop policy if exists "trip_participants_select" on public.trip_participants;
create policy "trip_participants_select" on public.trip_participants
  for select using (public.can_view_trip(trip_id));

drop policy if exists "trip_participants_write" on public.trip_participants;
create policy "trip_participants_write" on public.trip_participants
  for all using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));

drop policy if exists "item_cost_splits_select" on public.item_cost_splits;
create policy "item_cost_splits_select" on public.item_cost_splits
  for select using (public.can_view_trip(trip_id));

drop policy if exists "item_cost_splits_write" on public.item_cost_splits;
create policy "item_cost_splits_write" on public.item_cost_splits
  for all using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));

create index if not exists idx_trip_participants_trip on public.trip_participants (trip_id);
create index if not exists idx_item_cost_splits_trip on public.item_cost_splits (trip_id);
