-- Evidence blob storage: the responses table needs an "evidencePath" column to
-- hold the Supabase Storage object key returned by a successful upload.
--
-- Context: evidence storage shipped in commit 2b82183 and the column was added
-- to the live database via the dashboard, but no migration captured it. Without
-- this file a fresh `supabase db reset` rebuilds a schema where every
-- INSERT (api/responses/create.ts) and SELECT (api/assessments/[id]/analysis.ts,
-- api/evidence/download-url.ts) that references "evidencePath" throws
-- "column does not exist". This migration closes that drift so the repo is the
-- single reproducible source of truth (CONTEXT.md §13).
--
-- Two columns, two purposes (see docs/course-full module 9):
--   "evidenceName" — human-readable filename, captured even if upload fails.
--   "evidencePath" — Storage object key, set only when the upload succeeds.
-- Nullable with a '' default to mirror the live column exactly; download-url.ts
-- treats both NULL and '' as "filename captured, no file in storage".

ALTER TABLE responses ADD COLUMN IF NOT EXISTS "evidencePath" TEXT DEFAULT '';

-- Row-level security is enabled on both tables in the live project. The
-- serverless functions connect via the transaction pooler as a privileged role
-- (api/_lib/db.ts), which bypasses RLS by design — application-level
-- operatorEmail predicates are the access-control gate today. Enabling RLS here
-- keeps the migration-defined schema honest with production and means that if a
-- future client ever connects with the anon key, the tables fail closed (no
-- policies = no access) rather than open.
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses   ENABLE ROW LEVEL SECURITY;
