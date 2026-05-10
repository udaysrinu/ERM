# ERM Navigator (RISK X AI)

Enterprise Risk Management maturity assessment platform. 100 standards-aligned questions (ISO 31000, COSO ERM, NIST RMF, RIMS RMM, PPTG) across 10 pillars × 4 operating dimensions, with weighted scoring, benchmarking, drift detection, and a rule-based roadmap engine.

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind 4 + Recharts + Framer Motion
- **Backend:** Vercel serverless functions (Node 22) in `api/`
- **Database:** Supabase Postgres (free tier)
- **Deploy:** Vercel (frontend + API) + Supabase (DB) — $0/month at idle

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL from Supabase dashboard
npm run dev
```

The dev server runs `vercel dev`, which serves the Vite frontend and the serverless functions in `api/` together on a single port.

## Deploy

Pushes to `master` auto-deploy to Vercel. Set environment variables in the Vercel dashboard:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

## Architecture

See `../PROJECT_PLAN.md` for full architecture, patent claim coverage, remaining work, and investor-readiness timeline.
