# ERM Navigator — Context

**Audience:** any future maintainer (human or AI) picking up this repo cold. After reading this you should know what this product is, why it exists, what's been built, what's deferred and why, and what's the next decision blocking forward motion.

This doc captures the load-bearing context from `PROJECT_PLAN.md`, `SESSION_LOG.md`, `INITIAL_VS_NOW.md`, `CAPABILITY_STATUS.md`, and `PRODUCT_INPUT_REQUESTS.md` (which live at the workspace root, NOT in this repo) in a self-contained form.

---

## 1. The problem we're solving

Enterprise Risk Management (ERM) maturity assessments today are a manual, opaque, multi-month exercise. A consulting firm shows up with a spreadsheet, runs interviews for a quarter, hand-tallies scores, hands over a deck. The result is non-reproducible (two consultants get different scores from the same evidence), non-comparable (no benchmarks against peers or industry), and stale by the time it's delivered.

**ERM Navigator replaces this with an instrument:**

- **Standardized 100-vector questionnaire** aligned to ISO 31000, COSO ERM, NIST RMF, RIMS RMM. 10 pillars × 4 operating dimensions (People / Process / Technology / Governance) = 40 cells; 100 questions distributed across them.
- **Per-question 5-level maturity rubric** sourced from the canonical spec. The user picks 1–5 with explicit anchor text for each level (Initial / Developing / Defined / Integrated / Optimized) so scoring is reproducible across assessors.
- **Deterministic weighted scoring engine.** Pillar weights × dimension weights × per-question weights → pillar scores → overall score. Same inputs always produce the same outputs, bit-for-bit.
- **Four benchmark profiles** (Target / Industry / Peer / External) shipped as constants. Active profile drives gap and drift calculations.
- **Drift detection** vs. the prior assessment for the same operating unit. Regression alerts fire when a pillar's score drops below threshold.
- **Roadmap sequencer** ranks improvement actions by `expectedUplift ÷ (cost × duration)` and splits into Phase 1/2/3.
- **Board-grade PDF report** — 5-page A4 export with score, pillar table, dimensions, roadmap, regressions, methodology, and per-pillar standards-alignment provenance.

**The patent-defensible claim is reproducibility.** Auditors care that "score Generation 3.4" means the same thing in 2026 as it does in 2027 if the underlying evidence hasn't changed. That property is enforced by the test suite: `tests/engines.test.ts` pins every formula to exact expected numbers; `tests/properties.test.ts` validates invariants over 100 random inputs; CI fails any drift.

---

## 2. Patent claim coverage

The product is anchored to 24 patent claims. Current implementation status:

| Claim group | Status | Notes |
|---|---|---|
| Claims 1–10: scoring, benchmarking, drift, roadmap | ✅ Full | Engines in `api/_lib/engines.ts`, pinned by 35 unit tests. |
| Claim 11: maturity rubric per question | ✅ Full | Imported from xlsx into `static.ts`; surfaced in UI via tooltip + inline preview. |
| Claim 12: audit trail / timestamping | ✅ Full | `responses.answeredAt` per row. |
| Claim 13: standards-alignment provenance | ✅ Full | Per-pillar + per-dimension standards strings + rationale paragraphs in `static.ts`. PDF includes the per-pillar provenance page. |
| Claim 14: executive PDF export | ✅ Full | 5-page A4 via `pdf-lib`. |
| Claim 15: session history per operator | ✅ Full | `operatorEmail` stamping + `/api/assessments` history endpoint + sidebar archive. |
| Claims 16, 23: GRC tool integrations | ❌ Deferred | Partner-blocked. |
| Claim 17: AI narration of report | ⚠ Partial | Deterministic 15-pattern matcher today. Real LLM via Vercel AI Gateway is a 30-minute swap pending product decision. |
| Claim 18: AI evidence validation (Gemini Vision) | ❌ Deferred | Bonus claim; requires evidence-byte storage first. |
| Claim 19: Excel/CSV export | ❌ Deferred | PDF covers the audit-trail need; CSV is a follow-up. |
| Claim 20: real-time KRI integration | ❌ Deferred | Partner-blocked. |
| Claim 21: cross-BU benchmarking | ✅ Full | Benchmark profile selector switches across 4 reference profiles. |
| Claim 22: drift trend over time | ✅ Full | `<TrendChart>` component renders per-pillar evolution; data via `/api/assessments/trend`. |
| Claim 24: reproducibility / determinism | ✅ Full | Pinned by 41 unit tests + 6 property-based assertions over 100 random inputs each. |

**Section B (multi-tenant + RBAC workflow):** ❌ deferred — ~1 week of work. Required pre-customer, optional pre-investor (describe on a slide).

---

## 3. Architecture decisions and rationale

### Why Vercel + Supabase, not a single self-hosted box

- **Free tier covers MVP:** Vercel hobby + Supabase free = $0/month at idle.
- **Branch previews are free:** every git branch gets its own URL automatically. This is the mechanism behind the two parallel UI directions (`main` and `runway-rewrite`) — see Branches in README.
- **Postgres over SQLite:** the original handoff used `better-sqlite3` in a local Express server. Migrating to Postgres unlocked Supabase's RLS and managed backups. Cost: same $0 at MVP.

### Why the schema is two tables, not thirteen

The original handoff persisted reference data (questions, pillars, dimensions, weights, benchmarks, roadmap action templates) as DB tables. We collapsed that to TypeScript constants in `api/_lib/static.ts` and `src/data/static.ts` (mirrored). Reasoning:

- Reference data changes once a quarter at most, code changes daily.
- DB JOINs across reference tables added latency for zero benefit.
- "Edit the .xlsx, run the importer" is a cleaner spec workflow than "ALTER TABLE".
- Frontend tier needs the same data without DB roundtrips — mirroring as TS constants gives both tiers identical sources.

The two remaining tables — `assessments` and `responses` — are the only mutable state.

### Why no cached engine outputs

Every call to `/api/assessments/[id]/analysis` re-runs the full pipeline: `computeVectors` → `computeAnalytics` → `computeDrift` → `generateRoadmap` → `missionStatus`. No engine outputs are persisted. Reasons:

- 100 responses per call is cheap math (~5ms total).
- Cache invalidation is a real bug source. We don't have any.
- Benchmark profile changes (Target → Industry) re-run the analysis fresh; if cached we'd need to bust per-(assessment, benchmarkType) which adds complexity for no win.

### Why direct postgres, not Supabase JS client

The Vercel serverless functions connect to Supabase via the postgres pooler URL using `postgres.js`. This bypasses RLS by design (functions run as superuser). The Supabase JS client + RLS pattern would require us to either (a) use the service role key (same security profile, more code), or (b) thread real user JWTs through, which we don't have because auth is demo-grade. Direct postgres is honest about what we're doing.

When real auth lands, we either keep direct postgres + add `WHERE operator_email = $auth_email` predicates manually, or migrate to Supabase JS + RLS. The data model is RLS-ready (RLS is enabled on both tables; just no policies yet because nothing hits the anon key).

### Why deterministic chatbot, not real LLM

The dashboard chatbot today is `src/lib/assistant.ts` — 15 hand-authored regex patterns that pull data from the live analysis JSON and respond in factual sentences. Reasons we deferred real LLM:

- **Pre-investor stability:** a deterministic chatbot can't hallucinate during a live pitch. An LLM might.
- **No external dependency:** zero API cost, zero latency variance, zero rate-limit risk.
- **Testable:** 21 assertions in `tests/assistant.test.ts` pin every pattern. Refactoring is safe.
- **Cost when we DO swap:** ~$0.0003 per chat turn at Claude Haiku rates; $1.50/month at customer scale. So this isn't a cost decision — it's a determinism decision.

The swap to real LLM is ~30 minutes of work plus an API key. See "Open product decisions" below.

### Why the codebase has zero customer-name references

See the **customer scrub policy** in README.md. Short version: per security-disclosure directive from product, the codebase at rest must NOT name the original engagement client. The .xlsx spec contains references; the importer (`scripts/import-xlsx.cjs::scrubCustomer()`) neutralizes them at write time. Re-running the importer is idempotent and re-applies the scrub.

---

## 4. The two-branch strategy

Mid-session a redesign was explored: replace the editorial Risk-Atlas aesthetic (warm cream + Fraunces serif + ornamental rules) with a Runway-inspired operator surface (white + Inter + persistent sidebar + dense data + pastel BU mosaic). Rather than commit to one direction, we created `runway-rewrite` as a parallel branch. Vercel auto-deploys both, so product/CEO can compare two complete URLs side by side before picking.

**Engineering cost of the divergence:** exactly 3 files differ between branches — `src/App.tsx`, `src/components/primitives.tsx`, `src/index.css`. Everything else is byte-identical (engines, APIs, tests, data, configs).

**Propagation pattern when an engineering change lands:**

1. Commit on whichever branch you're on.
2. `git checkout <other-branch>`
3. `git checkout <source-branch> -- <leaf-files>` for everything outside the 3 visual files.
4. For App.tsx: edit by hand because the structural integration points differ. Visual code stays per-branch; functional code is the same on both.
5. Tests verify the result.
6. Push.

**When product picks a winner:** merge the chosen branch into `main`, delete the loser as a tag for archive, drop this section from CONTEXT.md.

---

## 5. The data layer (xlsx is canonical)

The 100 questions, 5-level rubric per question, per-pillar/per-dimension provenance (standards alignment + rationale paragraphs), 5-level maturity model definitions, and score legend all live in `ERM Navigator - 100 Qs.xlsx` at the workspace root.

`scripts/import-xlsx.cjs` reads that file and regenerates `api/_lib/static.ts` (and mirrors to `src/data/static.ts`). The script:

1. Parses 7 sheets:
   - Cover Page → provenance string
   - Tool Alignment → standards mapping per pillar
   - Guidelines → 5-level maturity model with characteristics + examples
   - Scoring Guidelines → per-pillar weights + per-dimension weights + rationale
   - Aligned 100 Questions → the 100 questions with rubric texts
2. Validates: 100 questions, 10 per pillar, no duplicate IDs.
3. Runs `scrubCustomer()` over every string-typed field.
4. Emits `static.ts` with structured TypeScript exports.

**Re-running the importer is idempotent.** The output is deterministic given the input. If the .xlsx is unchanged, `git diff` after running shows no changes.

**When the .xlsx changes:** re-run, review the diff, run tests, commit both static files together. Engine math is unaffected because question IDs are the contract, not text content.

---

## 6. Test architecture

Six files, four conceptual layers, run from `npm test`:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 4 — End-to-end                                    │
│   tests/e2e.smoke.spec.ts — Playwright walks the whole  │
│   stack. CI runs this against the live preview URL.     │
├─────────────────────────────────────────────────────────┤
│ Layer 3 — Component                                     │
│   tests/components.test.tsx — RTL + jsdom.              │
│   <TrendChart> rendered alone with stubbed fetch.       │
│   Proves UI works WITHOUT a backend.                    │
├─────────────────────────────────────────────────────────┤
│ Layer 2 — API integration                               │
│   tests/api.test.ts — direct handler invocation with    │
│   mocked req/res. Real Supabase via TXTEST* prefix      │
│   isolation. Proves backend works WITHOUT a UI.         │
├─────────────────────────────────────────────────────────┤
│ Layer 1 — Pure functions                                │
│   tests/engines.test.ts — formulas pinned to exact      │
│   numbers. tests/properties.test.ts — invariants over   │
│   100 random inputs. tests/assistant.test.ts +          │
│   assistant-robustness.test.ts — chatbot patterns.      │
│   Proves engine + chatbot work WITHOUT anything else.   │
└─────────────────────────────────────────────────────────┘
```

**The iron law: when a test fails, fix the source code, not the test.** This was applied during the test-exhaustiveness push — Batch A's heterogeneous-score fixture surfaced a real bug in `computeAnalytics` (rounding mismatch between display value and the unrounded value used for status comparison, producing visibly inconsistent "score 4.00 / target 4.0 / status ALIGNED"). Fixed in three lines.

**Tests are load-bearing for the patent claim.** "Identical responses always produce identical reports" is the headline IP claim. `tests/engines.test.ts` is the proof.

---

## 7. Demo narrative

The seeded historical data has a deliberate story:

- **18 historical assessments** (3 per BU × 6 BUs) stamped under a demo email.
- Each BU has a slight upward trend except **Generation**, which **regresses** at session 3 with a deliberate **Risk Treatment dimension drop of −0.6**.

When an investor logs in, picks Generation, and lands on the dashboard, they see:
- The current overall score is below the previous period's score.
- The **drift chart** shows a non-zero negative delta on Risk Treatment.
- A **regression alert** fires (CRITICAL severity).
- The **AI roadmap** surfaces "fix Risk Treatment" as Phase 1 priority.
- The **trend chart** shows the dip visually across 3 historical sessions.

The narrative the demo supports: *"The platform spotted a regulatory failure that the operator hadn't yet flagged."* Whether to keep this as the headline story is a product decision (see open decisions below).

---

## 8. Branches and live URLs

| Branch | Visual identity | Live URL |
|---|---|---|
| `main` | Editorial — warm cream, forest ink, gold; Fraunces display headlines; ornamental rules; folio numerals; pull-quote on login | https://erm-navigator.vercel.app |
| `runway-rewrite` | Runway-inspired — dense operator surface, persistent sidebar, pastel BU mosaic, animated number count-ups, hairline-only chrome | https://erm-navigator-git-runway-rewrite-uday-srinus-projects.vercel.app |

Both share Supabase, both have the same 104 tests passing, both have all the same APIs, both have zero customer-name references.

---

## 9. Open product decisions

These block specific engineering work. Each is listed with cost / effort so the decision is informed.

| # | Decision | Effort to land if approved |
|---|---|---|
| 1 | Real LLM chatbot via Vercel AI Gateway — Claude Haiku or Gemini Flash? | 30 min once an API key is provided. |
| 2 | AI evidence validation (Gemini Vision) — needed for investor demo? | Half a day. Requires #3 first. |
| 3 | Evidence file blob storage (Supabase Storage bucket + signed URLs) | 3-4 hours. |
| 4 | Real Google SSO — keep fake auth through investor pitch, or wire real auth now? | 4 hours via Supabase Auth + multi-tenant data isolation. |
| 5 | Multi-tenant + RBAC (Assessor / Reviewer / Approver) — pre-investor or pre-customer? | ~1 week. Patent Section B. |
| 6 | Custom domain on the demo URL? | 5 minutes once domain is provided. |
| 7 | Demo data narrative — keep Generation/Risk-Treatment as the regression hero, or pivot? | Re-seed (~5 minutes) if pivoting. |
| 8 | When investors log in with their own email, what do they see? — empty archive vs. shared demo data vs. auto-seed | 1-3 hours depending on choice. |
| 9 | Branding — keep "ERM Navigator" + 8-point compass-star mark, or involve a design vendor? | Open-ended. |
| 10 | Backup recorded video before the pitch? | 15 minutes. |

If you (a future maintainer) want to act on any of these, the unblock pattern is: confirm the decision with the product owner, then ship the corresponding work and update this section.

---

## 10. Recent work — what's shipped this session

In rough chronological order (last commit first):

- **README + CONTEXT (this file).** Self-contained handoff doc set so any future Claude session can resume from the GitHub repo alone.
- **xlsx import + rubric UI + customer scrub.** 100-question spec is now canonical; per-question rubric surfaces in the questionnaire as a tooltip + inline preview; PDF gains a 5-level scale legend page + per-pillar provenance page; pdf-lib WinAnsi crash fixed with a sanitizer that transliterates Greek delta, non-breaking hyphen, smart quotes, arrows, math operators.
- **Test exhaustiveness push.** 41 → 104 vitest assertions across engine edge cases, API integration, property-based, chatbot robustness, UI components. CI workflow gained a Playwright job. One real bug found and fixed in `computeAnalytics`.
- **Five-agent parallel build.** Trend chart, smarter chatbot (15 patterns), executive PDF, seed historical data, full test suite. Single-commit landing on `runway-rewrite`, cherry-picked to `main`.
- **Runway-style rewrite.** Branched off main, rebuilt the visual layer — sidebar, dense dashboard, pastel BU mosaic, animated numbers. Tokens extracted from runway.com via Playwright `getComputedStyle()`. Shipped as a parallel branch with its own Vercel URL.
- **Editorial redesign.** Original main-branch UI — warm cream + Fraunces + ornamental rules + folio numerals + pull-quote on login + compass watermark.
- **Functional cherry-picks to main.** When runway-rewrite shipped engine fixes / new APIs / new tests, the leaf files (everything outside the 3 visual files) get cherry-picked to main so functionality stays at parity.
- **Migration: assessment_history.** Added `operatorEmail` + `overallScore` columns to the assessments table; added the `/api/assessments` history list endpoint.
- **Initial Vercel + Supabase migration.** From local Express + SQLite to Vercel serverless + Supabase Postgres. From 13 tables to 2.

---

## 11. The next reasonable step

If you're picking this up cold and want to ship something useful in your first session:

**Option A — wire real LLM chat (highest impact for demo).** 30 minutes. Need `GEMINI_API_KEY` or `AI_GATEWAY_API_KEY`. Replace `getAssistantReply` in `src/lib/assistant.ts` with a `generateText({ model, system, prompt })` call from the Vercel AI SDK; pass the live `analysis` JSON as system context. Keep the deterministic matcher as offline fallback. Tests should still pass because the deterministic path stays as the export.

**Option B — build evidence file blob storage.** 3-4 hours. Create a Supabase Storage bucket. Replace the filename-only capture in the questionnaire with a real file upload that returns a signed URL. Add a re-download UI on the dashboard. Persists across sessions. Required before AI evidence validation (#2 above) can be built.

**Option C — auth migration.** 4 hours. Wire Supabase Auth (Google SSO). Replace the `@gmail.com` regex in `api/auth/login.ts`. Add multi-tenant data isolation via RLS policies. This is required before any real customer.

**Option D — pre-pitch polish.** Recorded backup video, custom domain, demo data tuning per the chosen narrative.

Pick based on what the product owner says is the next priority. If unsure, the highest-ROI item is **Option A** — it makes the chatbot feel alive during the pitch with no real cost.

---

## 12. Glossary of internal jargon

| Term | Meaning |
|---|---|
| **BU** | Business Unit — one of six demo entities (Generation / Transmission / Distribution / Corporate / Subsidiaries / Joint Ventures). |
| **Pillar** | One of ten ERM domains (Leadership & Governance, Strategy & Integration, etc.). |
| **Dimension** | One of four operating axes (People / Process / Technology / Governance). Every question is tagged with one. |
| **PPTG** | The shorthand label on each question indicating its dimension (G/P/T/C). |
| **Vector** | A response — a single (questionId, score, note?, evidenceName?) tuple. 100 vectors per assessment. |
| **Drift** | Pillar-level score change from a prior baseline assessment. Negative drift → regression alert. |
| **Mission status** | Top-level health classification. NOMINAL_SYNC / VECTOR_DRIFT / CRITICAL_GAP / STRUCTURAL_WEAKNESS. |
| **Roadmap** | Sequenced list of improvement actions ranked by `expectedUplift / (cost × duration)`. Splits into Phase 1/2/3. |
| **Folio** | Page number reference in the editorial UI (e.g. "FOLIO II"). Visual decoration, not functional. |
| **Operator** | The logged-in user. We stamp their email on every assessment via `operatorEmail`. |
| **Archive** | The list of past assessments visible to the operator on the scope screen. |
| **Provenance** | Per-pillar/per-dimension justification text — which global standards (ISO, COSO, NIST, RIMS) the weight aligns with. Sourced from xlsx. |
| **Rubric** | Per-question, per-level (1-5) anchor text describing what each maturity score means for that specific question. Sourced from xlsx. |

---

## 13. The patent reproducibility test (run this to convince yourself)

```bash
# Terminal 1
npm test
# Should report 104 passed
# Look for tests/engines.test.ts: 35 assertions
# Look for tests/properties.test.ts: 6 invariants × 100 random runs each
```

If `npm test` is green, the patent's reproducibility claim is enforceable. If anything in the engines drifts — even by a rounding epsilon — CI fails the PR. This is the moat.
