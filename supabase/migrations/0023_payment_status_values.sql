-- New guide_booking_status values for the pay-upfront flow.
--
-- Deliberately split from 0024: Postgres refuses to *use* a brand-new enum
-- value in the same transaction that added it ("unsafe use of new value of
-- enum type"), and 0024's partial unique index names both values in its
-- predicate. 0005 hit this same wall and documented it at the top of the file.
-- Keeping them in separate migrations means 0024 can run as one transaction
-- with no manual step.
--
-- Run this file, let it commit, then run 0024.

do $$ begin
  alter type public.guide_booking_status add value if not exists 'awaiting_payment';
exception when duplicate_object then null; end $$;

do $$ begin
  alter type public.guide_booking_status add value if not exists 'expired';
exception when duplicate_object then null; end $$;
