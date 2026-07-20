-- 0014_tour_requests.sql
-- Custom tour wizard: capture preferences, generate a draft itinerary from
-- published places, hand off to a matched guide.

create table if not exists public.tour_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  city_id       text references public.cities(id),
  contact_email text,
  contact_name  text,
  prefs         jsonb not null default '{}'::jsonb,
    -- { pace, interests[], group_size, date_from, date_to, budget_band }
  generated_itinerary jsonb not null default '[]'::jsonb,
    -- [{ order, place_id, title, note, duration_min }]
  matched_guide_id uuid references public.guides(id) on delete set null,
  status        text not null default 'draft',
    -- draft | requested | matched | confirmed | declined
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.tour_requests (status, created_at desc);
create index on public.tour_requests (user_id);

alter table public.tour_requests enable row level security;

-- signed-in users see and manage their own requests
create policy "own tour requests" on public.tour_requests
  for all using (user_id is not null and user_id = auth.uid());

-- the wizard accepts submissions before signup: anonymous inserts are allowed,
-- but such a row is only readable by an admin (no select policy matches it).
create policy "anon tour request insert" on public.tour_requests
  for insert with check (user_id is null or user_id = auth.uid());

create policy "tour requests admin" on public.tour_requests
  for all using (public.is_admin());
