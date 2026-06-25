-- Guide messaging + booking requests: lets a customer send a guide a plain
-- message or a booking request from the Guides page, and lets the guide read
-- their inbox at /account/messages. Run in the Supabase SQL editor.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'message' check (type in ('message', 'booking')),
  body text,
  trip_date date,
  interest text,
  status text not null default 'new' check (status in ('new', 'read')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- A sender can only insert messages as themselves, and only to a guide that's
-- actually active (mirrors the public-read condition on public.guides).
drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.guides g where g.id = guide_id and g.is_active = true)
  );

-- Visible to: the sender (their own sent messages), the guide who owns the
-- listing (their inbox, matched via guides.profile_id), or an admin.
drop policy if exists "messages_select_sender_or_guide" on public.messages;
create policy "messages_select_sender_or_guide" on public.messages
  for select using (
    sender_id = auth.uid()
    or guide_id in (select id from public.guides where profile_id = auth.uid())
    or public.is_admin()
  );

-- Only the receiving guide (or an admin) can update a message — used for
-- marking it as read.
drop policy if exists "messages_update_guide_or_admin" on public.messages;
create policy "messages_update_guide_or_admin" on public.messages
  for update using (
    guide_id in (select id from public.guides where profile_id = auth.uid())
    or public.is_admin()
  );

create index if not exists idx_messages_guide on public.messages (guide_id, status);
create index if not exists idx_messages_sender on public.messages (sender_id);
