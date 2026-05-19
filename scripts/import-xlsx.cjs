#!/usr/bin/env node
/**
 * One-shot importer for ERM Navigator - 100 Qs.xlsx → emits api/_lib/static.ts
 * + src/data/static.ts. Captures: 100 questions with 5-level rubric, per-pillar
 * standards alignment + rationale, per-dimension standards alignment + rationale,
 * 5-level maturity model with characteristics, score legend, provenance.
 */

const path = require('path');
const fs = require('fs');
const XLSX = require(path.resolve(__dirname, '../node_modules/xlsx'));

const XLSX_PATH = path.resolve(__dirname, '../../ERM Navigator - 100 Qs.xlsx');
const OUT_BACKEND = path.resolve(__dirname, '../api/_lib/static.ts');
const OUT_FRONTEND = path.resolve(__dirname, '../src/data/static.ts');

const PILLAR_SLUG = {
  'leadership & governance':           'lead',
  'strategy & integration':            'strat',
  'scope, context & criteria':         'scope',
  'risk identification':               'ident',
  'risk assessment':                   'assess',
  'risk treatment':                    'treat',
  'monitoring & review':               'monitor',
  'recording & reporting':             'report',
  'risk culture':                      'culture',
  'continuous improvement & resilience': 'improve',
};
const PPTG_TO_DIMENSION = { G: 'Governance', P: 'People', T: 'Technology', C: 'Process' };
const PILLAR_NAMES = {
  lead: 'Leadership & Governance', strat: 'Strategy & Integration',
  scope: 'Scope, Context & Criteria', ident: 'Risk Identification',
  assess: 'Risk Assessment', treat: 'Risk Treatment',
  monitor: 'Monitoring & Review', report: 'Recording & Reporting',
  culture: 'Risk Culture', improve: 'Continuous Improvement & Resilience',
};

// Customer scrub: remove every reference to the original engagement
// (SEC = Saudi Electricity Company / Saudi Energy / "SE" abbreviation).
// Per Venkat 2026-05-19: "remove all SEC references — they fear
// cybersecurity disclosure." Applied at import time so the codebase at
// rest never names a real client.
function scrubCustomer(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\bSaudi Electricity Company\b/gi, 'the organization')
    .replace(/\bSaudi Energy\b/gi, 'the organization')
    .replace(/\bSEC['’]s\b/g, "the organization's")
    .replace(/\bSEC\b/g, 'the organization')
    .replace(/\bSE Proprietary\b/g, 'Proprietary')
    .replace(/\bSE ecosystem\b/gi, 'organizational ecosystem')
    .replace(/\bSE looks like\b/gi, 'the organization looks like')
    .replace(/\bSE\b/g, 'the organization');
}

const wb = XLSX.readFile(XLSX_PATH);

// ─── 1. Parse the 100 questions sheet ────────────────────────────────────
const ws = wb.Sheets['Aligned 100 Questions'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
let currentPillar = null;
const parsed = [];
for (const row of rows) {
  const first = String(row[0] || '').trim();
  if (!first) continue;
  if (/^\d+\.\s+[A-Za-z]/.test(first) && !first.includes('?')) {
    const cleaned = first.replace(/^\d+\.\s+/, '').replace(/\s*\(\d+\s*questions?\)\s*$/i, '').trim().toLowerCase();
    if (PILLAR_SLUG[cleaned]) currentPillar = PILLAR_SLUG[cleaned];
    continue;
  }
  const m = first.match(/^(\d+)\.\s+(.*)/);
  if (!m || !row[2] || !row[3] || !row[4] || !row[5] || !row[6]) continue;
  let text = m[2].trim();
  let pptLetter = '';
  const tagMatch = text.match(/^(.+?)\s*\(([GPTC/]+)\)\s*$/);
  if (tagMatch) { text = tagMatch[1].trim(); pptLetter = tagMatch[2].split('/')[0]; }
  const xlsxDim = String(row[1] || '').trim();
  const dim =
    /governance|governane/i.test(xlsxDim) ? 'Governance' :
    /people/i.test(xlsxDim) ? 'People' :
    /process/i.test(xlsxDim) ? 'Process' :
    /tech/i.test(xlsxDim) ? 'Technology' :
    PPTG_TO_DIMENSION[pptLetter] || 'Process';
  parsed.push({
    id: parseInt(m[1], 10),
    pillarId: currentPillar,
    dimensionId: dim,
    text: scrubCustomer(text),
    rubric: {
      1: scrubCustomer(String(row[2]).trim()),
      2: scrubCustomer(String(row[3]).trim()),
      3: scrubCustomer(String(row[4]).trim()),
      4: scrubCustomer(String(row[5]).trim()),
      5: scrubCustomer(String(row[6]).trim()),
    },
  });
}
parsed.sort((a, b) => a.id - b.id);
console.log(`Parsed ${parsed.length} questions`);

// ─── 2. Parse Scoring Guidelines for pillar + dimension provenance ───────
const sg = XLSX.utils.sheet_to_json(wb.Sheets['Scoring Guidelines'], { header: 1, defval: '' });
const pillarMeta = {};   // pillarId → { weight, standards, rationale }
const dimensionMeta = {}; // dimensionId → { weight, standards, rationale }
let mode = null;
for (const row of sg) {
  const first = String(row[0] || '').trim();
  if (/^Pillar Weightages/i.test(row[1] ? `${row[0]} ${row[1]}` : first) || /^1\.\s+Pillar Weightages/i.test(first)) {
    mode = 'pillar'; continue;
  }
  if (/^Operating Dimension/i.test(first)) { mode = 'dim'; continue; }
  if (/^How to Score|^Score\s*\|/i.test(first)) { mode = null; continue; }
  if (mode === 'pillar') {
    const pm = first.match(/^\d+\.\s+(.+)/);
    if (pm) {
      const cleaned = pm[1].trim().toLowerCase();
      const slug = PILLAR_SLUG[cleaned];
      if (slug) {
        pillarMeta[slug] = {
          weight: Number(row[1]) || 0,
          standards: scrubCustomer(String(row[2] || '').trim()),
          rationale: scrubCustomer(String(row[3] || '').trim()),
        };
      }
    }
  } else if (mode === 'dim') {
    if (/^Process|^Governance|^People|^Technology/i.test(first)) {
      const key = first.replace(/\s*\([^)]+\)\s*/, '').trim();
      dimensionMeta[key] = {
        weight: Number(row[1]) || 0,
        standards: scrubCustomer(String(row[2] || '').trim()),
        rationale: scrubCustomer(String(row[3] || '').trim()),
      };
    }
  }
}
console.log(`Pillar provenance: ${Object.keys(pillarMeta).length} entries`);
console.log(`Dimension provenance: ${Object.keys(dimensionMeta).length} entries`);

// ─── 3. Parse Guidelines for the 5-level maturity model ───────────────────
const guides = XLSX.utils.sheet_to_json(wb.Sheets['Guidelines'], { header: 1, defval: '' });
const maturityLevels = []; // [{ level, name, characteristics: [], examples: [] }]
let currentLevel = null;
let buffer = null;
for (const row of guides) {
  const first = String(row[0] || '').trim();
  if (!first) continue;
  const lm = first.match(/^LEVEL\s+(\d+)\s*[—–-]\s*(.+)/i);
  if (lm) {
    if (currentLevel) maturityLevels.push(currentLevel);
    currentLevel = { level: parseInt(lm[1], 10), name: lm[2].trim(), characteristics: [], examples: [] };
    buffer = null;
    continue;
  }
  if (!currentLevel) continue;
  if (/^Characteristics$/i.test(first)) { buffer = 'char'; continue; }
  if (/^What SE looks like/i.test(first)) { buffer = 'examples'; continue; }
  if (buffer === 'char') currentLevel.characteristics.push(scrubCustomer(first));
  else if (buffer === 'examples') currentLevel.examples.push(scrubCustomer(first));
}
if (currentLevel) maturityLevels.push(currentLevel);
console.log(`Maturity levels: ${maturityLevels.length}`);

// ─── 4. Parse Tool Alignment for global-standards mapping ────────────────
const ta = XLSX.utils.sheet_to_json(wb.Sheets['Tool Alignment'], { header: 1, defval: '' });
const standardsAlignment = {}; // pillarId → standards text (already in pillarMeta but cleaner here)
for (const row of ta) {
  const first = String(row[0] || '').trim();
  const pm = first.match(/^\d+\.\s+(.+)/);
  if (!pm) continue;
  const slug = PILLAR_SLUG[pm[1].trim().toLowerCase()];
  if (slug && row[3]) standardsAlignment[slug] = String(row[3]).trim();
}

// ─── 5. Provenance from Cover Page ───────────────────────────────────────
const cover = XLSX.utils.sheet_to_json(wb.Sheets['Cover Page'], { header: 1, defval: '' });
let provenance = '';
for (const row of cover) {
  const first = String(row[0] || '').trim();
  const second = String(row[1] || '').trim();
  if (/^Purpose of this file/i.test(first) && second) provenance = scrubCustomer(second);
}

// ─── Validation ──────────────────────────────────────────────────────────
const errors = [];
if (parsed.length !== 100) errors.push(`Expected 100 questions, got ${parsed.length}`);
const counts = {};
for (const q of parsed) counts[q.pillarId] = (counts[q.pillarId] || 0) + 1;
for (const [pid, c] of Object.entries(counts)) if (c !== 10) errors.push(`Pillar ${pid}: ${c}/10`);
if (errors.length) { console.error('VALIDATION:', errors); process.exit(1); }
console.log('Validation passed');

// ─── Emit static.ts ──────────────────────────────────────────────────────
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const questionLits = parsed.map(q => `  {
    id: ${q.id},
    pillarId: '${q.pillarId}',
    dimensionId: '${q.dimensionId}',
    text: \`${esc(q.text)}\`,
    rubric: {
      1: \`${esc(q.rubric[1])}\`,
      2: \`${esc(q.rubric[2])}\`,
      3: \`${esc(q.rubric[3])}\`,
      4: \`${esc(q.rubric[4])}\`,
      5: \`${esc(q.rubric[5])}\`,
    },
  }`).join(',\n');

const pillarMetaLits = Object.entries(pillarMeta).map(([pid, m]) => `  ${pid}: {
    weight: ${m.weight},
    standards: \`${esc(m.standards)}\`,
    rationale: \`${esc(m.rationale)}\`,
  }`).join(',\n');

const dimensionMetaLits = Object.entries(dimensionMeta).map(([d, m]) => `  ${JSON.stringify(d)}: {
    weight: ${m.weight},
    standards: \`${esc(m.standards)}\`,
    rationale: \`${esc(m.rationale)}\`,
  }`).join(',\n');

const maturityLits = maturityLevels.map(lvl => `  {
    level: ${lvl.level},
    name: ${JSON.stringify(lvl.name)},
    characteristics: [${lvl.characteristics.map(c => `\`${esc(c)}\``).join(', ')}],
    examples: [${lvl.examples.map(c => `\`${esc(c)}\``).join(', ')}],
  }`).join(',\n');

const out = `/*
 * Shared static data for the backend engines + UI.
 * GENERATED FROM ERM Navigator - 100 Qs.xlsx via scripts/import-xlsx.cjs.
 * DO NOT edit by hand — re-run the importer after spec updates.
 *
 * Captures: 100 questions with 5-level rubric, per-pillar + per-dimension
 * standards-alignment provenance, the canonical 5-level maturity model,
 * benchmark profiles, roadmap action templates, business unit catalog.
 */

export const PROVENANCE = \`${esc(provenance)}\`;

export const PILLAR_WEIGHTS: Record<string, number> = {
  lead: 0.2, strat: 0.15, scope: 0.1, ident: 0.1, assess: 0.2,
  treat: 0.1, monitor: 0.05, report: 0.05, culture: 0.03, improve: 0.02,
};

export const PILLAR_IDS = Object.keys(PILLAR_WEIGHTS);

export const PILLAR_NAMES: Record<string, string> = {
  lead: 'Leadership & Governance',
  strat: 'Strategy & Integration',
  scope: 'Scope, Context & Criteria',
  ident: 'Risk Identification',
  assess: 'Risk Assessment',
  treat: 'Risk Treatment',
  monitor: 'Monitoring & Review',
  report: 'Recording & Reporting',
  culture: 'Risk Culture',
  improve: 'Continuous Improvement & Resilience',
};

export interface PillarProvenance { weight: number; standards: string; rationale: string; }
export const PILLAR_PROVENANCE: Record<string, PillarProvenance> = {
${pillarMetaLits},
};

export interface DimensionProvenance { weight: number; standards: string; rationale: string; }
export const DIMENSION_PROVENANCE: Record<string, DimensionProvenance> = {
${dimensionMetaLits},
};

export interface MaturityLevel { level: number; name: string; characteristics: string[]; examples: string[]; }
export const MATURITY_LEVELS: MaturityLevel[] = [
${maturityLits},
];

// Score legend — single source of truth, used by UI tooltips + PDF methodology page.
export const SCORE_LEGEND: Record<number, string> = {
  1: 'No evidence / ad-hoc / inconsistent',
  2: 'Partial evidence / developing / inconsistent application',
  3: 'Defined and consistently applied',
  4: 'Integrated, automated, and well-managed',
  5: 'Optimized, predictive, and continuously improved',
};

export const BUSINESS_UNITS: Array<{ id: string; name: string; industry: string }> = [
  { id: 'gen',  name: 'Generation',     industry: 'Power Generation' },
  { id: 'tra',  name: 'Transmission',   industry: 'Grid Operations' },
  { id: 'dis',  name: 'Distribution',   industry: 'Distribution Networks' },
  { id: 'corp', name: 'Corporate',      industry: 'Corporate Services' },
  { id: 'sub',  name: 'Subsidiaries',   industry: 'Subsidiary Operations' },
  { id: 'jv',   name: 'Joint Ventures', industry: 'Joint Venture Portfolio' },
];

export const BUSINESS_UNIT_NAMES: Record<string, string> = Object.fromEntries(
  BUSINESS_UNITS.map(b => [b.id, b.name]),
);

const DIM_WEIGHT: Record<string, number> = {
  People: 0.22, Process: 0.38, Technology: 0.14, Governance: 0.26,
};

export interface QuestionRubric { 1: string; 2: string; 3: string; 4: string; 5: string; }

export interface QuestionMeta {
  id: number;
  pillarId: string;
  dimensionId: string;
  weight: number;
  text: string;
  rubric: QuestionRubric;
}

const QUESTION_SOURCE: Array<Omit<QuestionMeta, 'weight'>> = [
${questionLits},
];

const cellCounts = new Map<string, number>();
for (const q of QUESTION_SOURCE) {
  const k = \`\${q.pillarId}:\${q.dimensionId}\`;
  cellCounts.set(k, (cellCounts.get(k) ?? 0) + 1);
}

export const QUESTIONS: QuestionMeta[] = QUESTION_SOURCE.map(q => ({
  ...q,
  weight: (DIM_WEIGHT[q.dimensionId] ?? 0) / (cellCounts.get(\`\${q.pillarId}:\${q.dimensionId}\`) ?? 1),
}));

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));

export const BENCHMARKS: Record<string, Record<string, number>> = {
  target:   { lead: 4.0, strat: 4.0, scope: 4.0, ident: 4.0, assess: 4.0, treat: 4.0, monitor: 4.0, report: 4.0, culture: 4.0, improve: 4.0 },
  industry: { lead: 3.8, strat: 3.7, scope: 3.5, ident: 3.5, assess: 3.8, treat: 3.6, monitor: 3.5, report: 3.4, culture: 3.3, improve: 3.4 },
  peer:     { lead: 3.5, strat: 3.4, scope: 3.3, ident: 3.3, assess: 3.5, treat: 3.4, monitor: 3.2, report: 3.2, culture: 3.1, improve: 3.1 },
  external: { lead: 4.3, strat: 4.2, scope: 4.1, ident: 4.1, assess: 4.3, treat: 4.1, monitor: 4.0, report: 4.0, culture: 3.9, improve: 4.0 },
};

export const BENCHMARK_TYPES = Object.keys(BENCHMARKS);

export const PILLARS: Array<{ id: string; name: string; weight: number }> =
  PILLAR_IDS.map(pid => ({ id: pid, name: PILLAR_NAMES[pid], weight: PILLAR_WEIGHTS[pid] }));

export const WEIGHTS = { dimension: DIM_WEIGHT, pillar: PILLAR_WEIGHTS };

export interface RoadmapAction {
  id: string; pillarId: string; dimensionId: string;
  description: string; expectedUplift: number; costScore: number; durationScore: number;
}

export const ROADMAP_ACTIONS: RoadmapAction[] = PILLAR_IDS.flatMap(pid => {
  const pname = PILLAR_NAMES[pid].toLowerCase();
  return [
    { id: \`act_\${pid}_1\`, pillarId: pid, dimensionId: 'Process', description: \`Standardize \${pname} workflows\`, expectedUplift: 0.8, costScore: 3, durationScore: 2 },
    { id: \`act_\${pid}_2\`, pillarId: pid, dimensionId: 'People', description: \`Launch targeted capability uplift for \${pname}\`, expectedUplift: 0.5, costScore: 1, durationScore: 2 },
    { id: \`act_\${pid}_3\`, pillarId: pid, dimensionId: 'Technology', description: \`Digitize \${pname} controls and dashboards\`, expectedUplift: 0.7, costScore: 4, durationScore: 3 },
  ];
});
`;

fs.writeFileSync(OUT_BACKEND, out);
console.log(`Wrote ${OUT_BACKEND} (${out.length} bytes)`);
if (fs.existsSync(OUT_FRONTEND)) {
  fs.writeFileSync(OUT_FRONTEND, out);
  console.log(`Wrote ${OUT_FRONTEND} (mirrored)`);
}
