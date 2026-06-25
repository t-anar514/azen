# Azen Backend Guide

This documents the actual backend architecture as built. It supersedes an
earlier draft that proposed a separate Node/Express/MongoDB service — that
plan was never implemented and is not used. The current backend lives
entirely inside this Next.js app.

## Stack

- **API layer**: Next.js Route Handlers (`src/app/api/**/route.ts`). No
  separate backend service.
- **Database**: Supabase (Postgres). Schema in `supabase/migrations/`.
- **Auth**: Supabase Auth (email/password), via `@supabase/ssr`.
- **Images**: Cloudinary, signed direct-to-browser uploads.
- **Authorization**: Postgres Row Level Security policies + an `is_admin()`
  helper, plus a `requireAdmin()` check (`src/lib/supabase/require-admin.ts`)
  at the top of every admin Route Handler.

## Setup

1. Create a Supabase project. Run the SQL in `supabase/migrations/0001_init.sql`
   then `0002_seed.sql` (SQL Editor or Supabase CLI).
2. Create a Cloudinary account (free tier is fine).
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard > Project Settings > API)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
     `CLOUDINARY_API_SECRET` (Cloudinary dashboard > Settings > Access Keys)
4. In Supabase Auth settings, disable email confirmation for local dev if you
   want to test signup without an email step (optional).
5. To make your own account an admin: sign up through `/signup`, then in the
   Supabase SQL editor run:
   ```sql
   update profiles set role = 'admin' where id = '<your-user-id>';
   ```
   (find `<your-user-id>` in Authentication > Users).

## Data model

Postgres tables (see `supabase/migrations/0001_init.sql` for full DDL):

- `profiles` — one row per Supabase Auth user, `role` is `user` / `guide` / `admin`.
- `cities` — Essentials pages. Nested content (history, culture, expenses,
  climate, districts) stored as `jsonb`.
- `hacks` — Hacks/trap-alert pages. `steps` and `related_ids` are `jsonb`/array.
- `guides` — Guide directory entries. `profile_id` optionally links to a
  `profiles` row; setting it promotes that user to the `guide` role via the
  `trg_sync_guide_role` trigger.
- `phrase_collections` — Learn/phrasebook content. `phrases` is `jsonb`.

All content tables have a `published` boolean — public pages only fetch
`published = true` rows; the admin dashboard lists everything.

## Admin dashboard

`/admin` (gated by `profiles.role = 'admin'`) provides full CRUD for cities,
hacks, guides, users (role management), and phrase collections. Each admin
Route Handler under `src/app/api/admin/**` calls `requireAdmin()` before doing
anything, independent of the RLS policies (defense in depth).

## Out of scope (this build pass)

`/experiences` and `/planner` were intentionally left on their original
static data sources and were not wired to Supabase.

## Security note

An earlier version of this file contained a hardcoded MongoDB Atlas
connection string (with embedded username/password) for a backend plan that
was never built. That string has been removed. If it was ever pushed to a
public repo or shared elsewhere, rotate those credentials in MongoDB Atlas as
a precaution, even though the database itself was never put into use.
