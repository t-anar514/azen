-- 0011_posts.sql
-- Blog model: one `posts` table with a type discriminator. Hacks become a post
-- type (steps preserved); `article` unlocks longform editorial. The old `hacks`
-- table stays for one release as a fallback, then drops in a later migration.

create type public.post_type as enum ('article', 'hack', 'guide_story');

create table if not exists public.posts (
  id            text primary key,
  slug          text unique not null,
  type          public.post_type not null default 'article',
  title         text not null,
  excerpt       text,
  cover_image   text,
  body_md       text,                                   -- articles
  steps         jsonb not null default '[]'::jsonb,     -- hacks (preserved)
  pro_tip       text,
  trap_alternative text,
  category      text,                                   -- was hack_category
  tags          text[] not null default '{}',
  city_id       text references public.cities(id) on delete set null,
  author_guide_id uuid references public.guides(id) on delete set null,
  read_minutes  int,
  related_ids   text[] not null default '{}',
  published     boolean not null default false,
  published_at  timestamptz,
  order_index   int not null default 0,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.posts (published, published_at desc);
create index on public.posts (city_id) where published;
create index on public.posts using gin (tags);

-- backfill from hacks
insert into public.posts (id, slug, type, title, excerpt, cover_image, steps,
                          pro_tip, trap_alternative, category, related_ids,
                          published, published_at, order_index, created_by)
select id, id, 'hack', title, summary, cover_image, steps,
       pro_tip, trap_alternative, category::text, related_ids,
       published, created_at, order_index, created_by
from public.hacks
on conflict (id) do nothing;

alter table public.posts enable row level security;

create policy "posts public read" on public.posts
  for select using (published = true);

create policy "posts admin write" on public.posts
  for all using (public.is_admin());
