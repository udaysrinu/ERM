-- Seed history idempotency guard.
--
-- The actual seeded rows are inserted by `scripts/seed-history.ts` (which uses
-- the same TS scoring engine that the API uses, so per-question scores produce
-- the same overallScore the live app would compute). This migration just
-- ensures that if the seed script is re-run after a fresh DB reset, any prior
-- TXSEED* sessions are wiped first so we don't get UNIQUE collisions.
--
-- Rows seeded by this lane:
--   18 assessments  : ids LIKE 'TXSEED%'  (3 sessions × 6 BUs)
--   1800 responses  : 100 per assessment, cascade-deleted with the parent
--
-- Run order:
--   1. supabase db push                  (applies this migration — DELETE only)
--   2. npm run seed:history              (script inserts the 18+1800 rows)

DELETE FROM assessments WHERE id LIKE 'TXSEED%';
