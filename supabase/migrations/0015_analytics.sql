-- 0015_analytics.sql
-- Minimum viable instrumentation: one append-only event table behind a
-- server route. Nothing in the plan is worth building unmeasured (§7).

create table if not exists public.analytics_events (
  id          bigserial primary key,
  name        text not null,
  props       jsonb not null default '{}'::jsonb,
  user_id     uuid references public.profiles(id) on delete set null,
  session_id  text,
  path        text,
  created_at  timestamptz not null default now()
);

create index on public.analytics_events (name, created_at desc);
create index on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

-- Writes go through the server route (service context); no client may read.
-- Admins can query the funnel.
create policy "analytics admin read" on public.analytics_events
  for select using (public.is_admin());

-- Weekly funnel view named in the plan:
-- city_hub_viewed → place_viewed → place_saved → folder_added_to_trip → booking_confirmed
create or replace view public.analytics_funnel_weekly as
select
  date_trunc('week', created_at) as week,
  name,
  count(*) as events,
  count(distinct coalesce(user_id::text, session_id)) as actors
from public.analytics_events
group by 1, 2
order by 1 desc, 3 desc;

-- without this a view runs as its owner and would bypass the RLS above
alter view public.analytics_funnel_weekly set (security_invoker = true);
