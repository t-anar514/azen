-- Itineraries (/planner) — persisted trip plans with optional public sharing.
-- owner_id is required: cloud save/sync is only available to logged-in users (anonymous
-- planning still works via the existing localStorage-only fallback in the planner UI).
-- The row's own id doubles as the public share slug: /planner/shared/[id], readable by
-- anyone once is_public is set to true.

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'My Trip',
  items jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.itineraries enable row level security;

drop policy if exists "itineraries_select" on public.itineraries;
create policy "itineraries_select" on public.itineraries
  for select using (owner_id = auth.uid() or is_public = true or public.is_admin());

drop policy if exists "itineraries_insert" on public.itineraries;
create policy "itineraries_insert" on public.itineraries
  for insert with check (owner_id = auth.uid());

drop policy if exists "itineraries_update" on public.itineraries;
create policy "itineraries_update" on public.itineraries
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "itineraries_delete" on public.itineraries;
create policy "itineraries_delete" on public.itineraries
  for delete using (owner_id = auth.uid() or public.is_admin());

create index if not exists idx_itineraries_owner on public.itineraries (owner_id);
create index if not exists idx_itineraries_public on public.itineraries (is_public) where is_public = true;
