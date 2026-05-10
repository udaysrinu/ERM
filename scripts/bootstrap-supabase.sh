#!/usr/bin/env bash
# Bootstrap a fresh Supabase project to ERM-Navigator-ready state.
#
# Usage:
#   1. Create a new Supabase project via the dashboard (or `supabase projects create`)
#   2. Export its ref + DB password:
#        export SUPABASE_PROJECT_REF=<your-ref>
#        export SUPABASE_DB_PASSWORD=<your-password>
#   3. Run:
#        ./scripts/bootstrap-supabase.sh
#
# The script applies every migration in supabase/migrations/ in filename order.
# It is idempotent — safe to rerun after partial failures.

set -euo pipefail

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "SUPABASE_PROJECT_REF is not set" >&2
  exit 1
fi
if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "SUPABASE_DB_PASSWORD is not set" >&2
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found. Install: brew install supabase/tap/supabase" >&2
  exit 1
fi

echo "→ Linking to project $SUPABASE_PROJECT_REF"
supabase link --project-ref "$SUPABASE_PROJECT_REF"

echo "→ Pushing migrations"
supabase db push --include-all

echo "✅ Bootstrap complete."
echo "Next steps:"
echo "  - Grab the Transaction pooler connection string from the Supabase dashboard"
echo "  - Set DATABASE_URL in .env.local (for local dev) or Vercel env vars (for prod)"
echo "  - Run: npm run dev"
