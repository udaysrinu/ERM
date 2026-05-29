# ERM Navigator

Enterprise Risk Management maturity assessment platform. Captures 100 standards-aligned responses across 10 pillars × 4 operating dimensions, computes weighted scoring, benchmarks against four reference profiles, detects drift versus prior baselines, sequences a roadmap of uplift actions, and exports a board-grade PDF report.

> Aligned to ISO 31000, COSO ERM, NIST RMF, RIMS RMM. Patent-defensible math: every formula is deterministic and pinned by 35 unit tests so identical responses always produce identical reports.

**Status:** investor-demo-ready. Two parallel UI directions live as separate Vercel preview URLs (see "Branches"). Backend, data layer, tests, and APIs are byte-identical across branches.

For the full problem statement, patent-claim map, decision history, and "where we got stuck and why" notes, read `CONTEXT.md` next.

---

## Quick start

```bash
npm install
cp .env.example .env.local       # then fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
npm run dev                      # vite at http://127.0.0.1:5173
npm test                         # vitest suite across engine, API, assistant, signatures, storage, and component layers
npm run build                    # production build verification
```

To regenerate the question dataset after editing `ERM Navigator - 100 Qs.xlsx` (the canonical spec, lives outside the repo):

```bash
node scripts/import-xlsx.cjs     # rewrites api/_lib/static.ts and src/data/static.ts
```

To seed historical assessments for the demo (idempotent; deletes prior `TXSEED*` rows first):

```bash
npm run seed:history             # inserts 18 rows (3 per BU × 6 BUs)
```

---

## Branches

| Branch | Visual identity | Live URL |
|---|---|---|
| `main` | Editorial — warm cream, forest ink, gold; Fraunces display headlines | https://erm-navigator.vercel.app |
| `runway-rewrite` | Runway-inspired — dense operator surface, persistent sidebar, pastel BU mosaic | https://erm-navigator-git-runway-rewrite-uday-srinus-projects.vercel.app |

Both branches share the same Supabase database, same engines, same APIs, same tests. They diverge in **exactly three files**: `src/App.tsx`, `src/components/primitives.tsx`, `src/index.css`.

**Branch protocol:**
- Engineering changes outside the visual layer (engines, APIs, tests, data) get committed to whichever branch was active, then cherry-picked to the other (file-level, not commit-level — the App.tsx imports may differ).
- Visual changes stay on their branch.
- When product/CEO picks a winner, merge that branch into `main` and archive the loser as a tag.

---

## Where things live

| Path | Purpose |
|---|---|
| `api/auth/login.ts` | Demo-grade auth (any `@gmail.com`). **Replace with real auth before production.** |
| `api/responses/create.ts` | The only mutating endpoint. Persists 100 responses per assessment, stamps operator email + computed overall score. |
| `api/assessments/index.ts` | Per-operator assessment history list (the "archive"). |
| `api/assessments/[id]/analysis.ts` | Reads raw responses, runs all engines in-memory, returns the dashboard JSON. **No cached engine outputs.** |
| `api/assessments/[id]/pdf.ts` | Server-rendered 5-page A4 PDF using `pdf-lib` (no headless Chromium). |
| `api/assessments/trend.ts` | Per-pillar score arrays across past sessions for the trend chart. |
| `api/evidence/upload-url.ts` | Issues a short-lived Supabase Storage signed PUT URL for evidence uploads. Backed by the private `evidence` bucket (10 MB cap, MIME allowlist). |
| `api/evidence/download-url.ts` | Issues a short-lived signed GET URL for evidence retrieval, scoped to the assessment owner. |
| `api/_lib/engines.ts` | Pure deterministic functions: `computeVectors`, `computeAnalytics`, `computeDrift`, `generateRoadmap`, `missionStatus`. **The patent-protected math lives here.** |
| `api/_lib/static.ts` | Generated from `ERM Navigator - 100 Qs.xlsx`. Contains 100 questions with 5-level rubric, per-pillar/dimension provenance, 5-level maturity model, score legend. **Do not edit by hand — run `node scripts/import-xlsx.cjs`.** |
| `api/_lib/db.ts` | Postgres connection. Direct `postgres.js` over `DATABASE_URL`. Bypasses RLS by design (backend uses superuser role). |
| `api/_lib/cors.ts` | Shared CORS preflight handler. |
| `api/_lib/cache.ts` | HTTP cache-control helpers (`shortPublic`, `mediumPrivate`, `noStore`) for Vercel edge + browser caching of read endpoints. |
| `api/_lib/storage.ts` | Server-only Supabase Storage client (service-role) used by the evidence endpoints. |
| `api/_lib/signatures.ts` | Re-export shim — the canonical signature/hashing logic lives in `/shared/signatures.ts` so frontend and backend share one implementation. |
| `src/App.tsx` | Single-file frontend. ~1900 lines. Login → Scope → Questionnaire → Dashboard. |
| `src/components/primitives.tsx` | Reusable visual atoms (Card, Eyebrow, BrandMark, BuGlyph, etc.). |
| `src/components/ui/` | shadcn/ui primitives unified to the `radix-ui` package. |
| `src/components/TrendChart.tsx` | Recharts LineChart for the dashboard's "Pillar evolution" card. |
| `src/lib/assistant.ts` | The chatbot's deterministic 15-pattern matcher. Testable, no LLM calls. |
| `src/data/static.ts` | Mirror of `api/_lib/static.ts` (frontend tier needs the same data without DB JOINs). Always regenerate both together. |
| `tests/engines.test.ts` | 35 assertions pinning every formula in `engines.ts`. |
| `tests/api.test.ts` | 25 API integration assertions. Hits real Supabase via `TXTEST*` row prefix; cleans up in `afterAll`. |
| `tests/assistant.test.ts` | 21 chatbot-pattern assertions. |
| `tests/properties.test.ts` | 6 fast-check property-based assertions over 100 random inputs each. |
| `tests/assistant-robustness.test.ts` | 11 malformed-input + adversarial-prompt tests. |
| `tests/components.test.tsx` | 6 React-Testing-Library tests for `<TrendChart>` with stubbed `fetch`. Proves UI/backend decoupling. |
| `tests/signatures.test.ts` | 11 assertions pinning the deterministic response/assessment signature logic in `/shared/signatures.ts`. |
| `tests/storage-smoke.test.ts` | Smoke test for the evidence Storage client — guards env-var wiring and the bucket key convention. |
| `tests/e2e.smoke.spec.ts` | Playwright walk: login → 100 answers → dashboard. CI runs against the live preview URL via `E2E_BASE_URL`. |
| `scripts/import-xlsx.cjs` | xlsx → `static.ts` regenerator. Includes the customer-name scrub (see policy below). |
| `scripts/seed-history.ts` | Inserts 18 historical assessments with deliberate Generation/Risk-Treatment regression at session 3. |
| `supabase/migrations/` | DDL only. Schema is two tables (`assessments`, `responses`); reference data lives in `static.ts`. |
| `.github/workflows/test.yml` | Runs `npm test` on every push. Playwright job runs as a follow-up against the live preview URL. |
| `components.json` | shadcn/ui CLI config. |
| `vitest.config.ts`, `playwright.config.ts` | Test runners. |

---

## Architecture in one diagram

The editable Mermaid sources and rendered PNGs live in `docs/`:

- `docs/architecture.mmd` / `architecture.png` — system layout (browser → Vercel edge → functions → `/shared` engines → Supabase Postgres + Storage).
- `docs/functional-flow.mmd` / `functional-flow.png` — end-to-end sequence covering login, assessment with evidence upload, finalize, Live Brief, evidence download, and PDF export.

ASCII fallback for terminal readers:

```
┌─────────────────┐         ┌─────────────────────────────────┐
│   Vite + React  │ ──HTTP→ │   Vercel serverless (api/*)     │
│   src/          │         │                                 │
│                 │         │   ┌──────────────────────────┐  │
│  - App.tsx      │         │   │  /shared + api/_lib      │  │
│  - components   │         │   │  engines / signatures    │  │
│  - data/static  │ ──reads─┼─→ │  computeVectors          │  │
│    (mirror)     │         │   │  computeAnalytics        │  │
└─────────────────┘         │   │  computeDrift            │  │
                            │   │  generateRoadmap         │  │
                            │   │  missionStatus           │  │
                            │   └──────────────────────────┘  │
                            │                                 │
                            │   ┌──────────────────────────┐  │
                            │   │  db.ts (sql)             │  │
                            │   │  storage.ts (signed URLs)│  │
                            │   └────────────┬─────────────┘  │
                            └────────────────┼────────────────┘
                                             │
                                             ▼
                                ┌────────────────────────────┐
                                │  Supabase                  │
                                │                            │
                                │  Postgres: assessments,    │
                                │            responses       │
                                │  Storage:  evidence bucket │
                                │  RLS on; backend bypasses  │
                                │  via service-role + direct │
                                │  postgres conn             │
                                └────────────────────────────┘
```

**Key architectural choices:**

- **Two tables, not thirteen.** All reference data (questions, pillars, weights, benchmarks, roadmap action templates) is bundled as TypeScript constants in `static.ts`. Only mutable per-customer data hits the database.
- **No cached engine outputs.** Every call to `/api/assessments/[id]/analysis` re-runs the full pipeline in-memory. Always-fresh dashboard, zero cache-invalidation bugs. Cheap because there are only 100 responses per call.
- **Deterministic math is patent IP.** Pinned by 35 unit tests in `tests/engines.test.ts`. Property-based tests in `tests/properties.test.ts` cover edge cases the deterministic tests miss.
- **UI/backend decoupled at the test level.** Engine tests don't know UI exists. API tests don't import `src/`. Component tests stub `fetch`. Only the e2e smoke crosses all layers.
- **Customer-name scrub at the data-import layer.** See policy below.

---

## Working with the data layer

The 100 questions, the per-question 5-level rubric, the per-pillar/per-dimension provenance, and the 5-level maturity model **all come from `ERM Navigator - 100 Qs.xlsx`** (a workspace-root file, not committed to the repo).

**Workflow when the spec changes:**

1. Update the .xlsx (in Numbers, Excel, or LibreOffice — the file lives at the workspace root, one directory above this repo).
2. `node scripts/import-xlsx.cjs`
3. Verify `git diff src/data/static.ts api/_lib/static.ts` looks intentional.
4. `npm test` (104 assertions; will surface any breakage).
5. If question IDs change, re-run `npm run seed:history` to refresh the demo data.
6. Commit both static files together.

The importer also runs the **customer-name scrub** at import time (see policy below).

---

## Tests + CI

Six test files, all run from `npm test`:

| Layer | File | Coverage |
|---|---|---|
| Pure engine | `tests/engines.test.ts` | 35 assertions pinning every formula. Threshold boundaries, empty-input edge cases, weight invariants, unknown-id silent skip. |
| Property-based | `tests/properties.test.ts` | 6 invariants × 100 random inputs. Score bounds, finiteness, idempotence, gap monotonicity. |
| API integration | `tests/api.test.ts` | 25 assertions. Direct handler invocation with mocked req/res. Hits real Supabase; isolates via `TXTEST*` prefix; cleans up in `afterAll`. |
| Chatbot | `tests/assistant.test.ts` + `assistant-robustness.test.ts` | 21 + 11 assertions. Pattern dispatch, malformed analysis, XSS / 5KB / unicode / empty / whitespace prompts. |
| Component | `tests/components.test.tsx` | 6 RTL tests for `<TrendChart>` with stubbed `fetch`. Proves the UI works without a backend at all. |
| E2E | `tests/e2e.smoke.spec.ts` | Playwright walk: login → 100 answers → dashboard. Local: `npm run test:e2e`. CI: against live preview URL via `E2E_BASE_URL`. |

**CI:** `.github/workflows/test.yml` runs vitest on every push to `main` and `runway-rewrite`. Playwright job needs vitest to pass first.

If a test fails: **the iron law is fix the source code, not the test.** This was applied during this session — Batch A's heterogeneous-score fixture surfaced a real bug in `computeAnalytics` (rounding mismatch between display and status comparison), which was fixed in three lines.

---

## Customer scrub policy

Per security-disclosure policy, the codebase at rest must NOT name a real client. The original engagement was with a Gulf-region utility; references to that customer are neutralized to "the organization" or "enterprise risk programs" everywhere — UI strings, generated data, comments, even default footer text.

**The scrub is automated** in `scripts/import-xlsx.cjs::scrubCustomer()`. Read that function for the exact replacement table — it covers the original customer's full name, abbreviated forms, and possessive variants, all replaced with neutral language ("the organization", "organizational ecosystem", "Proprietary").

The scrub runs on every import. If you re-import after a spec update and the new spec contains the customer name, the importer will neutralize it again.

**Do not put customer names back in the codebase — even in comments.** If you must reference a specific deployment, do it in a private internal doc outside this repo. The exact replacement table lives in code (in `scripts/import-xlsx.cjs`) rather than in this README so the customer name only ever appears in one obvious place that future maintainers will recognize as policy infrastructure rather than product content.

---

## What's deferred (and why)

| Capability | Status | Effort to land |
|---|---|---|
| Real LLM chatbot (Vercel AI Gateway) | Not built. The chatbot is 15 deterministic regex patterns. | ~30 min once an API key is provided. Awaiting product decision on cost vs. demo predictability trade-off. Real-cost math: ~$0.0003/turn at Claude Haiku rates; $1.50/month at customer scale. Effectively free, decision is about non-determinism risk during a live pitch. |
| AI evidence validation (Gemini Vision on uploads) | Not built. Patent bonus claim. Now unblocked — evidence bytes are persisted. | Half-day. |
| ~~Evidence file blob storage~~ | **Shipped.** Private Supabase Storage `evidence` bucket with signed PUT/GET URLs (`api/evidence/upload-url.ts`, `download-url.ts`), 10 MB cap, MIME allowlist. | — |
| Real Google SSO | Not built. Auth is regex-on-email (`@gmail.com` accepted). | ~4 hours via Supabase Auth + multi-tenant data isolation. Required before any real customer. |
| Multi-tenant + RBAC (Assessor / Reviewer / Approver — patent Section B) | Not built. | ~1 week. Required pre-customer; optional pre-investor (describe on a slide). |
| Real-time KRI integration (claim 20) | Not built. | Partner-blocked — needs source-system API access. |
| GRC tool integrations — ServiceNow / Archer / MetricStream (claims 16, 23) | Not built. | Partner contracts required. |

The capability matrix in `CONTEXT.md` has the full demo-readiness audit per patent claim.

---

## Pointer files (workspace root, not in this repo)

These exist at the workspace level for human readers:

- `PROJECT_PLAN.md` — original architecture decisions and patent walkthrough
- `SESSION_LOG.md` — session-by-session work log with P0/P1/P2/P3 backlog
- `INITIAL_VS_NOW.md` — before/after capability tables
- `CAPABILITY_STATUS.md` — current demo-readiness matrix
- `PRODUCT_INPUT_REQUESTS.md` — open product decisions blocking forward motion

If you're picking up the project as another Claude session and only have this repo, **read `CONTEXT.md` next** — it captures the load-bearing context from those workspace-root files in a self-contained form.

---

## Stack

- **Frontend:** React 19 + Vite 6 + Tailwind 4 + Recharts + Framer Motion + shadcn/ui (radix-ui unified)
- **Backend:** Vercel serverless functions (Node 22) in `api/`
- **Database:** Supabase Postgres (free tier sufficient at MVP scale)
- **PDF:** `pdf-lib` (no headless Chromium)
- **Tests:** Vitest + fast-check + React Testing Library + Playwright
- **CI:** GitHub Actions
- **Deploy:** Vercel auto-deploys on push to `main` (production) and `runway-rewrite` (preview).

Cost envelope: $0/month at idle (Vercel hobby tier + Supabase free tier). Domain optional (~$10-15/year).
