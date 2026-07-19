-- Cached FX rates for the planner's budget display. Single source of truth,
-- replacing the hardcoded "val * 22" / "val / 150" guesses duplicated across
-- CostFooter/TimelineItem/SharedItineraryView. Refreshed daily by a cron
-- route hitting a free, keyless FX API — app costs are stored in JPY, so we
-- only ever need JPY as the base.

create table if not exists public.exchange_rates (
  id smallint primary key default 1 check (id = 1), -- singleton: one cached snapshot
  base_currency text not null default 'JPY',
  rates jsonb not null,          -- { "JPY": 1, "USD": 0.0067, "MNT": 22.3 }
  source text not null default 'fawazahmed0/exchange-api',
  fetched_at timestamptz not null default now()
);

-- Rough seed so the app has a sane value before the first cron run.
insert into public.exchange_rates (id, base_currency, rates)
values (1, 'JPY', '{"JPY":1,"USD":0.0067,"MNT":22.3}'::jsonb)
on conflict (id) do nothing;

alter table public.exchange_rates enable row level security;

-- Rates aren't sensitive — anyone can read. Only the cron route writes,
-- using the service-role client (src/lib/supabase/admin.ts), which bypasses
-- RLS entirely, so no insert/update policy is needed for normal users.
drop policy if exists "exchange_rates_public_read" on public.exchange_rates;
create policy "exchange_rates_public_read" on public.exchange_rates
  for select using (true);
