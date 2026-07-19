-- Fixes a regression introduced by 0008: creating a new trip while logged in
-- failed with "new row violates row-level security policy".
--
-- Root cause: 0008 replaced the itineraries select policy with
-- can_view_trip(id). INSERT ... RETURNING (supabase-js .insert().select())
-- checks the SELECT policy against the newly inserted row, and can_view_trip
-- is a STABLE function that re-queries public.itineraries — using the
-- snapshot from the start of the command, which does NOT yet contain the row
-- being inserted. The pre-0008 policy compared owner_id = auth.uid() directly
-- on the candidate row, which is why this never surfaced before.
--
-- Fix: put the direct owner check back as the first arm of the policy. The
-- collaborator/public arms still go through can_view_trip, whose inner
-- queries only ever look at pre-existing rows, so they're unaffected.
drop policy if exists "itineraries_select" on public.itineraries;
create policy "itineraries_select" on public.itineraries
  for select using (owner_id = auth.uid() or public.can_view_trip(id));
