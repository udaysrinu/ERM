-- Session history: stamp operator email + computed overall score at finalize
-- so the scope screen can list "my past sessions" without re-running the
-- full scoring engine for each row.
--
-- Both columns are nullable for backward-compat with pre-existing rows; the
-- list endpoint filters by non-null operatorEmail so the archive panel only
-- shows properly-attributed sessions.

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS "operatorEmail" TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS "overallScore"  REAL;

CREATE INDEX IF NOT EXISTS idx_assessments_operator_created
  ON assessments ("operatorEmail", "createdAt" DESC)
  WHERE "operatorEmail" IS NOT NULL;
