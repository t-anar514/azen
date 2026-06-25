-- Azen initial schema: profiles/auth, cities (essentials), hacks, guides, phrase_collections (learn)
-- Denormalized with jsonb for nested arrays (districts/steps/seasons/tiers/phrases) — a deliberate
-- simplification per ADR-001 for the one-month solo timeline. Run in the Supabase SQL editor, or via
-- `supabase db push` if you set up the CLI later.

-- ───────────────────────────── extensions ─────────────────────────────
create extension if not exists pgcrypto;

-- ───────────────────────────── enums ─────────────────────────────
do $$ begin
  create type public.user_role as enum ('user', 'guide', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hack_category as enum ('Food', 'Transport', 'Money', 'Logistics', 'Etiquette', 'Tourist Trap');
exception when duplicate_object then null; end $$;

-- ───────────────────────────── profiles ─────────────────────────────
-- One row per auth user, auto-created by trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent non-admins from promoting themselves by editing their own profile row.
create or replace function public.prevent_role_self_promotion()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_promotion();

-- ───────────────────────────── cities (/essentials) ─────────────────────────────
create table if not exists public.cities (
  id text primary key,
  name text not null,
  hero_image text,
  teaser text,
  introduction text,
  history jsonb not null default '{}'::jsonb,        -- { text, imageUrl }
  culture jsonb not null default '{}'::jsonb,         -- { text, imageUrl }
  expenses jsonb not null default '{}'::jsonb,        -- { text, imageUrl, tiers: [{ category, amount }] }
  climate jsonb not null default '{}'::jsonb,         -- { text, imageUrl, seasons: [{ name, temp, vibe }] }
  districts jsonb not null default '{"mapUrl":"","list":[]}'::jsonb, -- { mapUrl, list: [{ id, name, description, category }] }
  getting_around text,
  vibe jsonb not null default '{}'::jsonb,            -- { text, imageUrl }
  published boolean not null default true,
  order_index int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── hacks (/hacks) ─────────────────────────────
create table if not exists public.hacks (
  id text primary key,
  title text not null,
  category public.hack_category not null,
  summary text,
  steps jsonb not null default '[]'::jsonb,           -- [{ step, title, text }]
  pro_tip text,
  cover_image text,
  related_ids text[] not null default '{}',
  trap_alternative text,
  published boolean not null default true,
  order_index int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── guides (/guides) ─────────────────────────────
-- profile_id is nullable: a guide listing can exist on its own (matches the current demo data,
-- which is a curated directory, not necessarily signed-up accounts), or be linked to a real
-- platform user once the admin "promotes a user to guide".
create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,              -- preserves old static ids (g1/g2/g3) so re-seeding is idempotent
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  location text,
  tags text[] not null default '{}',
  rating numeric(2,1) not null default 5.0,
  review_count int not null default 0,
  price numeric(10,2),
  bio text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  image text,
  image_public_id text,               -- Cloudinary public_id, kept alongside `image` (secure_url)
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep profiles.role in sync when a guide row gets linked to a real user.
create or replace function public.sync_guide_role()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.profile_id is not null then
    update public.profiles set role = 'guide' where id = new.profile_id and role = 'user';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_guide_role on public.guides;
create trigger trg_sync_guide_role
  after insert or update of profile_id on public.guides
  for each row execute function public.sync_guide_role();

-- ───────────────────────────── phrase_collections (/learn) ─────────────────────────────
create table if not exists public.phrase_collections (
  id text primary key,
  title text not null,
  description text,
  cover_image text,
  phrases jsonb not null default '[]'::jsonb,         -- [{ id, japanese, romaji, english, context }]
  order_index int not null default 0,
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── row level security ─────────────────────────────
alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.hacks enable row level security;
alter table public.guides enable row level security;
alter table public.phrase_collections enable row level security;

-- profiles: a user can see/update their own row; admins can see/update everyone's.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- cities: public can read published rows; only admins can write.
drop policy if exists "cities_public_read" on public.cities;
create policy "cities_public_read" on public.cities
  for select using (published = true or public.is_admin());

drop policy if exists "cities_admin_write" on public.cities;
create policy "cities_admin_write" on public.cities
  for all using (public.is_admin()) with check (public.is_admin());

-- hacks: same pattern.
drop policy if exists "hacks_public_read" on public.hacks;
create policy "hacks_public_read" on public.hacks
  for select using (published = true or public.is_admin());

drop policy if exists "hacks_admin_write" on public.hacks;
create policy "hacks_admin_write" on public.hacks
  for all using (public.is_admin()) with check (public.is_admin());

-- guides: public can read active guides; only admins can write.
drop policy if exists "guides_public_read" on public.guides;
create policy "guides_public_read" on public.guides
  for select using (is_active = true or public.is_admin());

drop policy if exists "guides_admin_write" on public.guides;
create policy "guides_admin_write" on public.guides
  for all using (public.is_admin()) with check (public.is_admin());

-- phrase_collections: same pattern as cities/hacks.
drop policy if exists "phrase_collections_public_read" on public.phrase_collections;
create policy "phrase_collections_public_read" on public.phrase_collections
  for select using (published = true or public.is_admin());

drop policy if exists "phrase_collections_admin_write" on public.phrase_collections;
create policy "phrase_collections_admin_write" on public.phrase_collections
  for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────────── helpful indexes ─────────────────────────────
create index if not exists idx_cities_order on public.cities (order_index);
create index if not exists idx_hacks_order on public.hacks (order_index);
create index if not exists idx_guides_active on public.guides (is_active);
create index if not exists idx_phrase_collections_order on public.phrase_collections (order_index);

-- ───────────────────────────── bootstrap your own admin account ─────────────────────────────
-- After you sign up once through /signup with your own email, run this (with your real email) to
-- promote yourself to admin — there's no UI for the very first admin, by design:
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
