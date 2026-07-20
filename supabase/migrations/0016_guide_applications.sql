-- 0016_guide_applications.sql
-- Supply funnel: /guides/apply. Azen had /driver/apply but no way to become a
-- guide, so the guide directory could only ever be filled by an admin.

create table if not exists public.guide_applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete set null,
  full_name    text not null,
  email        text not null,
  phone        text,
  city_id      text references public.cities(id) on delete set null,
  languages    text[] not null default '{}',
  bio          text,
  motivation   text,
  status       text not null default 'pending',   -- pending | approved | rejected
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index on public.guide_applications (status, created_at desc);

alter table public.guide_applications enable row level security;

-- applicants may submit (signed in or not) and read back only their own row
create policy "guide app insert" on public.guide_applications
  for insert with check (user_id is null or user_id = auth.uid());

create policy "guide app own read" on public.guide_applications
  for select using (user_id is not null and user_id = auth.uid());

create policy "guide app admin" on public.guide_applications
  for all using (public.is_admin());
