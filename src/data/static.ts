/*
 * Static reference data — mirrors supabase/migrations/20260511000002 and 20260511000003.
 * This file is the frontend's copy of the static catalogs (questions, pillars, weights,
 * business units, benchmark profiles) so the app can render the login → BU select →
 * questionnaire flow with zero API calls.
 *
 * The DB remains source of truth for the backend scoring engines. If you change any
 * of these constants, update the matching supabase migration and re-seed.
 */

export interface Pillar { id: string; name: string; }
export interface Dimension { id: string; name: string; }
export interface Question { id: number; text: string; pillarId: string; dimensionId: string; maxScore: number; weight: number; }
export interface Weight { pillarId: string; dimensionId: string; weight: number; }
export interface BusinessUnit { id: string; name: string; industry: string; }
export interface Benchmark { type: string; pillarId: string; score: number; }

export const PILLARS: Pillar[] = [
  { id: 'lead', name: 'Leadership & Governance' },
  { id: 'strat', name: 'Strategy & Integration' },
  { id: 'scope', name: 'Scope, Context & Criteria' },
  { id: 'ident', name: 'Risk Identification' },
  { id: 'assess', name: 'Risk Assessment' },
  { id: 'treat', name: 'Risk Treatment' },
  { id: 'monitor', name: 'Monitoring & Review' },
  { id: 'report', name: 'Recording & Reporting' },
  { id: 'culture', name: 'Risk Culture' },
  { id: 'improve', name: 'Continuous Improvement & Resilience' },
];

export const DIMENSIONS: Dimension[] = [
  { id: 'People', name: 'People' },
  { id: 'Process', name: 'Process' },
  { id: 'Technology', name: 'Technology' },
  { id: 'Governance', name: 'Governance' },
];

// Dimension weights used across the scoring engine: People 22%, Process 38%, Technology 14%, Governance 26%.
const DIMENSION_WEIGHT: Record<string, number> = {
  People: 0.22,
  Process: 0.38,
  Technology: 0.14,
  Governance: 0.26,
};

export const BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'gen', name: 'Generation', industry: 'Power Generation' },
  { id: 'tra', name: 'Transmission', industry: 'Grid Operations' },
  { id: 'dis', name: 'Distribution', industry: 'Distribution Networks' },
  { id: 'corp', name: 'Corporate', industry: 'Corporate Services' },
  { id: 'sub', name: 'Subsidiaries', industry: 'Subsidiary Operations' },
  { id: 'jv', name: 'Joint Ventures', industry: 'Joint Venture Portfolio' },
];

// 100 standards-aligned questions — exact text + pillar/dimension tagging from the workbook.
const QUESTION_DEFINITIONS: Array<Omit<Question, 'weight' | 'maxScore'>> = [
  // 1. Leadership & Governance
  { id: 1, text: 'Is there a formally approved ERM policy?', pillarId: 'lead', dimensionId: 'Governance' },
  { id: 2, text: 'Are risk roles and responsibilities clearly defined and communicated?', pillarId: 'lead', dimensionId: 'Governance' },
  { id: 3, text: 'Does senior leadership actively champion risk management?', pillarId: 'lead', dimensionId: 'People' },
  { id: 4, text: 'Is risk appetite approved and periodically reviewed by governing bodies?', pillarId: 'lead', dimensionId: 'Governance' },
  { id: 5, text: 'Are risk breaches escalated and addressed promptly?', pillarId: 'lead', dimensionId: 'Process' },
  { id: 6, text: 'Are risk responsibilities included in performance evaluations?', pillarId: 'lead', dimensionId: 'People' },
  { id: 7, text: 'Are governance committees overseeing risk effectively?', pillarId: 'lead', dimensionId: 'Governance' },
  { id: 8, text: 'Is leadership trained on emerging risks (cyber, AI, ESG)?', pillarId: 'lead', dimensionId: 'People' },
  { id: 9, text: 'Are accountability mechanisms enforced for risk violations?', pillarId: 'lead', dimensionId: 'Governance' },
  { id: 10, text: 'Does leadership receive timely, accurate, decision‑ready risk reports?', pillarId: 'lead', dimensionId: 'Process' },
  // 2. Strategy & Integration
  { id: 11, text: 'Is ERM integrated into strategic planning cycles?', pillarId: 'strat', dimensionId: 'Process' },
  { id: 12, text: 'Are risks considered during budgeting and resource allocation?', pillarId: 'strat', dimensionId: 'Governance' },
  { id: 13, text: 'Are major initiatives required to conduct risk assessments?', pillarId: 'strat', dimensionId: 'Process' },
  { id: 14, text: 'Are risk insights used to prioritize investments?', pillarId: 'strat', dimensionId: 'Governance' },
  { id: 15, text: 'Are risk indicators integrated into performance dashboards?', pillarId: 'strat', dimensionId: 'Technology' },
  { id: 16, text: 'Are cross‑functional risk reviews conducted regularly?', pillarId: 'strat', dimensionId: 'People' },
  { id: 17, text: 'Are risk considerations embedded in procurement and vendor decisions?', pillarId: 'strat', dimensionId: 'Process' },
  { id: 18, text: 'Are emerging risks considered in strategic reviews?', pillarId: 'strat', dimensionId: 'Governance' },
  { id: 19, text: 'Are risk appetite limits operationalized across business units?', pillarId: 'strat', dimensionId: 'Process' },
  { id: 20, text: 'Are risk insights used in project portfolio management?', pillarId: 'strat', dimensionId: 'Governance' },
  // 3. Scope, Context & Criteria
  { id: 21, text: 'Is internal and external context defined and reviewed periodically?', pillarId: 'scope', dimensionId: 'Process' },
  { id: 22, text: 'Are risk criteria standardized across the organization?', pillarId: 'scope', dimensionId: 'Governance' },
  { id: 23, text: 'Are assumptions and constraints documented for assessments?', pillarId: 'scope', dimensionId: 'Process' },
  { id: 24, text: 'Are risk appetite and tolerance levels clearly defined?', pillarId: 'scope', dimensionId: 'Governance' },
  { id: 25, text: 'Are criteria for velocity, contagion, and persistence defined?', pillarId: 'scope', dimensionId: 'Process' },
  { id: 26, text: 'Are ESG, cyber, and technology criteria included?', pillarId: 'scope', dimensionId: 'Governance' },
  { id: 27, text: 'Are context changes reviewed after major events?', pillarId: 'scope', dimensionId: 'Process' },
  { id: 28, text: 'Are stakeholder expectations incorporated into context setting?', pillarId: 'scope', dimensionId: 'People' },
  { id: 29, text: 'Are risk boundaries and limits communicated effectively?', pillarId: 'scope', dimensionId: 'People' },
  { id: 30, text: 'Are criteria aligned with regulatory and industry standards?', pillarId: 'scope', dimensionId: 'Governance' },
  // 4. Risk Identification
  { id: 31, text: 'Is there a structured process for identifying risks?', pillarId: 'ident', dimensionId: 'Process' },
  { id: 32, text: 'Are risks identified across all business units and functions?', pillarId: 'ident', dimensionId: 'Process' },
  { id: 33, text: 'Are emerging risks identified through environmental scanning?', pillarId: 'ident', dimensionId: 'People' },
  { id: 34, text: 'Are third‑party and supply chain risks identified?', pillarId: 'ident', dimensionId: 'Process' },
  { id: 35, text: 'Are interdependencies between risks identified?', pillarId: 'ident', dimensionId: 'Process' },
  { id: 36, text: 'Are lessons from incidents used to identify new risks?', pillarId: 'ident', dimensionId: 'Process' },
  { id: 37, text: 'Are technology, cyber, and data risks identified systematically?', pillarId: 'ident', dimensionId: 'Technology' },
  { id: 38, text: 'Are ESG and sustainability risks identified?', pillarId: 'ident', dimensionId: 'Governance' },
  { id: 39, text: 'Are stakeholder‑driven risks identified?', pillarId: 'ident', dimensionId: 'People' },
  { id: 40, text: 'Are identification processes reviewed for completeness?', pillarId: 'ident', dimensionId: 'Governance' },
  // 5. Risk Assessment
  { id: 41, text: 'Are likelihood and impact assessed using standardized criteria?', pillarId: 'assess', dimensionId: 'Process' },
  { id: 42, text: 'Are quantitative and qualitative methods used appropriately?', pillarId: 'assess', dimensionId: 'Process' },
  { id: 43, text: 'Are scenarios developed for critical risks?', pillarId: 'assess', dimensionId: 'Process' },
  { id: 44, text: 'Are systemic and cascading risks assessed?', pillarId: 'assess', dimensionId: 'Process' },
  { id: 45, text: 'Are assumptions documented and validated?', pillarId: 'assess', dimensionId: 'Governance' },
  { id: 46, text: 'Are risk assessments reviewed for consistency across units?', pillarId: 'assess', dimensionId: 'Governance' },
  { id: 47, text: 'Are data sources validated for quality and reliability?', pillarId: 'assess', dimensionId: 'Technology' },
  { id: 48, text: 'Are risk models governed and periodically validated?', pillarId: 'assess', dimensionId: 'Technology' },
  { id: 49, text: 'Are assessments updated after major changes?', pillarId: 'assess', dimensionId: 'Process' },
  { id: 50, text: 'Are risk prioritization methods transparent and repeatable?', pillarId: 'assess', dimensionId: 'Governance' },
  // 6. Risk Treatment
  { id: 51, text: 'Are treatment plans documented for all major risks?', pillarId: 'treat', dimensionId: 'Process' },
  { id: 52, text: 'Are treatment options evaluated for cost‑effectiveness?', pillarId: 'treat', dimensionId: 'Governance' },
  { id: 53, text: 'Are controls designed and tested for effectiveness?', pillarId: 'treat', dimensionId: 'Technology' },
  { id: 54, text: 'Are residual risks documented and approved?', pillarId: 'treat', dimensionId: 'Governance' },
  { id: 55, text: 'Are treatment actions linked to KRIs?', pillarId: 'treat', dimensionId: 'Technology' },
  { id: 56, text: 'Are risk financing options (insurance, hedging) considered?', pillarId: 'treat', dimensionId: 'Governance' },
  { id: 57, text: 'Are treatments updated based on monitoring results?', pillarId: 'treat', dimensionId: 'Process' },
  { id: 58, text: 'Are treatment owners accountable for implementation?', pillarId: 'treat', dimensionId: 'People' },
  { id: 59, text: 'Are contingency plans aligned with risk treatments?', pillarId: 'treat', dimensionId: 'Process' },
  { id: 60, text: 'Are treatment timelines tracked and reported?', pillarId: 'treat', dimensionId: 'Technology' },
  // 7. Monitoring & Review
  { id: 61, text: 'Are KRIs monitored against thresholds?', pillarId: 'monitor', dimensionId: 'Technology' },
  { id: 62, text: 'Are dashboards used to track risk exposure?', pillarId: 'monitor', dimensionId: 'Technology' },
  { id: 63, text: 'Are early‑warning indicators in place?', pillarId: 'monitor', dimensionId: 'Technology' },
  { id: 64, text: 'Are risk breaches escalated promptly?', pillarId: 'monitor', dimensionId: 'Process' },
  { id: 65, text: 'Are monitoring results reviewed by leadership?', pillarId: 'monitor', dimensionId: 'Governance' },
  { id: 66, text: 'Are controls tested regularly?', pillarId: 'monitor', dimensionId: 'Process' },
  { id: 67, text: 'Are monitoring processes automated where possible?', pillarId: 'monitor', dimensionId: 'Technology' },
  { id: 68, text: 'Are monitoring results integrated into performance reporting?', pillarId: 'monitor', dimensionId: 'Governance' },
  { id: 69, text: 'Are monitoring processes reviewed for effectiveness?', pillarId: 'monitor', dimensionId: 'Governance' },
  { id: 70, text: 'Are systemic risk indicators monitored?', pillarId: 'monitor', dimensionId: 'Technology' },
  // 8. Recording & Reporting
  { id: 71, text: 'Are risk records maintained consistently across units?', pillarId: 'report', dimensionId: 'Process' },
  { id: 72, text: 'Are reports standardized and comparable?', pillarId: 'report', dimensionId: 'Governance' },
  { id: 73, text: 'Are reports audit‑ready and evidence‑based?', pillarId: 'report', dimensionId: 'Governance' },
  { id: 74, text: 'Are digital tools used for reporting?', pillarId: 'report', dimensionId: 'Technology' },
  { id: 75, text: 'Are reporting timelines defined and followed?', pillarId: 'report', dimensionId: 'Process' },
  { id: 76, text: 'Are dashboards accessible to relevant stakeholders?', pillarId: 'report', dimensionId: 'Technology' },
  { id: 77, text: 'Are reporting processes reviewed for quality?', pillarId: 'report', dimensionId: 'Governance' },
  { id: 78, text: 'Are risk insights communicated clearly and concisely?', pillarId: 'report', dimensionId: 'People' },
  { id: 79, text: 'Are regulatory reporting requirements met?', pillarId: 'report', dimensionId: 'Governance' },
  { id: 80, text: 'Are reporting templates updated periodically?', pillarId: 'report', dimensionId: 'Process' },
  // 9. Risk Culture
  { id: 81, text: 'Is risk awareness measured periodically?', pillarId: 'culture', dimensionId: 'People' },
  { id: 82, text: 'Are employees encouraged to escalate risks?', pillarId: 'culture', dimensionId: 'People' },
  { id: 83, text: 'Are incentives aligned with risk appetite?', pillarId: 'culture', dimensionId: 'Governance' },
  { id: 84, text: 'Is leadership modeling desired risk behaviors?', pillarId: 'culture', dimensionId: 'People' },
  { id: 85, text: 'Are culture surveys conducted regularly?', pillarId: 'culture', dimensionId: 'People' },
  { id: 86, text: 'Are training programs effective and role‑specific?', pillarId: 'culture', dimensionId: 'People' },
  { id: 87, text: 'Are risk behaviors embedded into performance management?', pillarId: 'culture', dimensionId: 'Governance' },
  { id: 88, text: 'Are communication channels open and trusted?', pillarId: 'culture', dimensionId: 'People' },
  { id: 89, text: 'Are risk violations addressed consistently?', pillarId: 'culture', dimensionId: 'Governance' },
  { id: 90, text: 'Is psychological safety present for risk escalation?', pillarId: 'culture', dimensionId: 'People' },
  // 10. Continuous Improvement & Resilience
  { id: 91, text: 'Are lessons learned captured and applied?', pillarId: 'improve', dimensionId: 'Process' },
  { id: 92, text: 'Are ERM processes reviewed periodically?', pillarId: 'improve', dimensionId: 'Governance' },
  { id: 93, text: 'Are benchmarks used to compare maturity?', pillarId: 'improve', dimensionId: 'Governance' },
  { id: 94, text: 'Are improvements tracked against KPIs?', pillarId: 'improve', dimensionId: 'Technology' },
  { id: 95, text: 'Are audits used to improve ERM processes?', pillarId: 'improve', dimensionId: 'Governance' },
  { id: 96, text: 'Are resilience and continuity plans tested regularly?', pillarId: 'improve', dimensionId: 'Process' },
  { id: 97, text: 'Are stress tests conducted for major risks?', pillarId: 'improve', dimensionId: 'Process' },
  { id: 98, text: 'Are recovery capabilities aligned with risk appetite?', pillarId: 'improve', dimensionId: 'Governance' },
  { id: 99, text: 'Are improvement actions assigned and monitored?', pillarId: 'improve', dimensionId: 'Technology' },
  { id: 100, text: 'Are ERM enhancements incorporated into training and culture?', pillarId: 'improve', dimensionId: 'People' },
];

// Derive per-question weight = dimensionWeight / (count of questions in that pillar×dimension cell).
// Matches the SQL UPDATE in 20260511000003_seed_questions_and_weights.sql.
function computePerQuestionWeight(qs: Array<Omit<Question, 'weight' | 'maxScore'>>): Question[] {
  const cellCounts = new Map<string, number>();
  qs.forEach(q => {
    const key = `${q.pillarId}:${q.dimensionId}`;
    cellCounts.set(key, (cellCounts.get(key) ?? 0) + 1);
  });
  return qs.map(q => {
    const cellCount = cellCounts.get(`${q.pillarId}:${q.dimensionId}`) ?? 1;
    const weight = (DIMENSION_WEIGHT[q.dimensionId] ?? 0) / cellCount;
    return { ...q, weight, maxScore: 5 };
  });
}

export const QUESTIONS: Question[] = computePerQuestionWeight(QUESTION_DEFINITIONS);

// Weights matrix: one row per (pillar × dimension) cell that actually contains questions.
function buildWeights(qs: Question[]): Weight[] {
  const cells = new Map<string, Weight>();
  qs.forEach(q => {
    const key = `${q.pillarId}:${q.dimensionId}`;
    if (!cells.has(key)) {
      cells.set(key, {
        pillarId: q.pillarId,
        dimensionId: q.dimensionId,
        weight: DIMENSION_WEIGHT[q.dimensionId] ?? 0,
      });
    }
  });
  return [...cells.values()];
}

export const WEIGHTS: Weight[] = buildWeights(QUESTIONS);

// Benchmark profiles — Target/Industry/Peer/External × 10 pillars.
const BENCHMARK_SCORES: Record<string, Record<string, number>> = {
  target:   { lead: 4.0, strat: 4.0, scope: 4.0, ident: 4.0, assess: 4.0, treat: 4.0, monitor: 4.0, report: 4.0, culture: 4.0, improve: 4.0 },
  industry: { lead: 3.8, strat: 3.7, scope: 3.5, ident: 3.5, assess: 3.8, treat: 3.6, monitor: 3.5, report: 3.4, culture: 3.3, improve: 3.4 },
  peer:     { lead: 3.5, strat: 3.4, scope: 3.3, ident: 3.3, assess: 3.5, treat: 3.4, monitor: 3.2, report: 3.2, culture: 3.1, improve: 3.1 },
  external: { lead: 4.3, strat: 4.2, scope: 4.1, ident: 4.1, assess: 4.3, treat: 4.1, monitor: 4.0, report: 4.0, culture: 3.9, improve: 4.0 },
};

export const BENCHMARKS: Benchmark[] = Object.entries(BENCHMARK_SCORES).flatMap(
  ([type, scores]) => PILLARS.map(p => ({ type, pillarId: p.id, score: scores[p.id] ?? 0 })),
);

export const BENCHMARK_TYPES = Object.keys(BENCHMARK_SCORES);
