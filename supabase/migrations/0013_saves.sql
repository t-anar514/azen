-- 0013_saves.sql
-- Retention loop: save hearts → folders → planner bridge.
-- Also drops the legacy hacks table (fully superseded by posts in 0011;
-- no code references remain).

create type public.saveable_type as enum
  ('place', 'post', 'experience', 'guide', 'city');

create table if not exists public.folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  itinerary_id uuid references public.itineraries(id) on delete set null,
  name        text not null,
  cover_image text,
  created_at  timestamptz not null default now()
);

create table if not exists public.saved_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  folder_id   uuid references public.folders(id) on delete cascade,
  item_type   public.saveable_type not null,
  item_id     text not null,
  note        text,
  created_at  timestamptz not null default now(),
  -- nulls not distinct: an unfiled (folder_id null) save is also unique per item
  unique nulls not distinct (user_id, folder_id, item_type, item_id)
);

create index on public.saved_items (user_id, item_type);
create index on public.folders (user_id);

alter table public.folders enable row level security;
alter table public.saved_items enable row level security;

create policy "own folders" on public.folders
  for all using (user_id = auth.uid());

create policy "own saves" on public.saved_items
  for all using (user_id = auth.uid());

-- legacy cleanup: hacks lived on one release past 0011 as a fallback
drop table if exists public.hacks;
drop type if exists public.hack_category;
