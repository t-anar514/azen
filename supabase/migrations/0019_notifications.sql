-- In-app notifications, first use case: /planner collaboration invites.
--
-- Until now, inviting someone (0008 trip_collaborators) only wrote a pending
-- row — the invitee was never told. There's no email provider wired into this
-- project, so notification happens in-app: a bell in the navbar, backed by
-- this table, updated live over Realtime. Rows are written by SECURITY DEFINER
-- triggers (never the client) because the sender must be able to create a row
-- owned by the recipient, which RLS otherwise forbids.
--
-- Covers the two ends of the invite handshake:
--   * invite created  → notify the invited user (only if they already have an
--     Azen account; someone with no account yet can't receive an in-app
--     notification and still relies on the owner sharing the invite link);
--   * invite accepted → notify the owner who sent it ("X joined your trip").

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,   -- recipient
  type text not null,                        -- 'trip_invite' | 'trip_invite_accepted'
  title text not null,
  body text,
  link text,                                 -- in-app path to open when clicked
  trip_id uuid references public.itineraries(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,          -- who caused it
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

-- Recipients manage only their own rows. There is deliberately NO insert
-- policy: rows come exclusively from the SECURITY DEFINER trigger below, so a
-- client can never fabricate a notification for someone else.
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

-- ── invite-handshake notifications ──────────────────────────────────────────
create or replace function public.notify_trip_collaborator()
returns trigger language plpgsql security definer as $$
declare
  v_trip_title text;
  v_actor_name text;
  v_recipient uuid;
begin
  select title into v_trip_title from public.itineraries where id = new.trip_id;

  if tg_op = 'INSERT' then
    -- Only reachable if the invited email already belongs to an account.
    select id into v_recipient from public.profiles
      where lower(email) = lower(new.invited_email) limit 1;

    if v_recipient is not null and v_recipient <> new.invited_by then
      v_actor_name := coalesce(public.participant_display_name(new.invited_by), 'Хэн нэгэн');
      insert into public.notifications (user_id, type, title, body, link, trip_id, actor_id)
      values (
        v_recipient,
        'trip_invite',
        'Аяллын урилга',
        v_actor_name || ' таныг «' || coalesce(v_trip_title, 'аялал') || '» аялалд урилаа',
        '/planner/invite/' || new.id,
        new.trip_id,
        new.invited_by
      );
    end if;

  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status is distinct from 'accepted' then
    -- Tell the inviter their invite was taken up.
    if new.invited_by is not null and new.user_id is not null and new.invited_by <> new.user_id then
      v_actor_name := coalesce(public.participant_display_name(new.user_id), new.invited_email);
      insert into public.notifications (user_id, type, title, body, link, trip_id, actor_id)
      values (
        new.invited_by,
        'trip_invite_accepted',
        'Урилга хүлээн авлаа',
        v_actor_name || ' таны «' || coalesce(v_trip_title, 'аялал') || '» аялалд нэгдлээ',
        '/planner?trip=' || new.trip_id,
        new.trip_id,
        new.user_id
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_trip_collaborator on public.trip_collaborators;
create trigger trg_notify_trip_collaborator
  after insert or update on public.trip_collaborators
  for each row execute function public.notify_trip_collaborator();

-- ── realtime ────────────────────────────────────────────────────────────────
-- The bell subscribes filtered by user_id; REPLICA IDENTITY FULL so UPDATE
-- (mark-read) events across tabs still carry user_id for that filter.
alter table public.notifications replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
