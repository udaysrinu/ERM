/*
 * Shared static data for the backend engines.
 * Mirrors src/data/static.ts (frontend copy) so both tiers have the same
 * pillars/dimensions/questions/weights/benchmarks/roadmap actions without
 * DB JOINs. If you change any of these, update src/data/static.ts too.
 */

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

export const BUSINESS_UNIT_NAMES: Record<string, string> = {
  gen: 'Generation',
  tra: 'Transmission',
  dis: 'Distribution',
  corp: 'Corporate',
  sub: 'Subsidiaries',
  jv: 'Joint Ventures',
};

// Dimension weights: People 22%, Process 38%, Technology 14%, Governance 26%.
const DIM_WEIGHT: Record<string, number> = {
  People: 0.22, Process: 0.38, Technology: 0.14, Governance: 0.26,
};

// Question tagging — id, pillarId, dimensionId (text irrelevant for backend).
const QUESTION_TAGS: Array<[number, string, string]> = [
  [1,'lead','Governance'],[2,'lead','Governance'],[3,'lead','People'],[4,'lead','Governance'],[5,'lead','Process'],
  [6,'lead','People'],[7,'lead','Governance'],[8,'lead','People'],[9,'lead','Governance'],[10,'lead','Process'],
  [11,'strat','Process'],[12,'strat','Governance'],[13,'strat','Process'],[14,'strat','Governance'],[15,'strat','Technology'],
  [16,'strat','People'],[17,'strat','Process'],[18,'strat','Governance'],[19,'strat','Process'],[20,'strat','Governance'],
  [21,'scope','Process'],[22,'scope','Governance'],[23,'scope','Process'],[24,'scope','Governance'],[25,'scope','Process'],
  [26,'scope','Governance'],[27,'scope','Process'],[28,'scope','People'],[29,'scope','People'],[30,'scope','Governance'],
  [31,'ident','Process'],[32,'ident','Process'],[33,'ident','People'],[34,'ident','Process'],[35,'ident','Process'],
  [36,'ident','Process'],[37,'ident','Technology'],[38,'ident','Governance'],[39,'ident','People'],[40,'ident','Governance'],
  [41,'assess','Process'],[42,'assess','Process'],[43,'assess','Process'],[44,'assess','Process'],[45,'assess','Governance'],
  [46,'assess','Governance'],[47,'assess','Technology'],[48,'assess','Technology'],[49,'assess','Process'],[50,'assess','Governance'],
  [51,'treat','Process'],[52,'treat','Governance'],[53,'treat','Technology'],[54,'treat','Governance'],[55,'treat','Technology'],
  [56,'treat','Governance'],[57,'treat','Process'],[58,'treat','People'],[59,'treat','Process'],[60,'treat','Technology'],
  [61,'monitor','Technology'],[62,'monitor','Technology'],[63,'monitor','Technology'],[64,'monitor','Process'],[65,'monitor','Governance'],
  [66,'monitor','Process'],[67,'monitor','Technology'],[68,'monitor','Governance'],[69,'monitor','Governance'],[70,'monitor','Technology'],
  [71,'report','Process'],[72,'report','Governance'],[73,'report','Governance'],[74,'report','Technology'],[75,'report','Process'],
  [76,'report','Technology'],[77,'report','Governance'],[78,'report','People'],[79,'report','Governance'],[80,'report','Process'],
  [81,'culture','People'],[82,'culture','People'],[83,'culture','Governance'],[84,'culture','People'],[85,'culture','People'],
  [86,'culture','People'],[87,'culture','Governance'],[88,'culture','People'],[89,'culture','Governance'],[90,'culture','People'],
  [91,'improve','Process'],[92,'improve','Governance'],[93,'improve','Governance'],[94,'improve','Technology'],[95,'improve','Governance'],
  [96,'improve','Process'],[97,'improve','Process'],[98,'improve','Governance'],[99,'improve','Technology'],[100,'improve','People'],
];

// Per-question weight: dimension weight / questions-in-cell count.
// Pre-computed at module load so the engine doesn't repeat the math per request.
const cellCounts = new Map<string, number>();
QUESTION_TAGS.forEach(([, p, d]) => {
  const key = `${p}:${d}`;
  cellCounts.set(key, (cellCounts.get(key) ?? 0) + 1);
});

export interface QuestionMeta { id: number; pillarId: string; dimensionId: string; weight: number; }

export const QUESTIONS: QuestionMeta[] = QUESTION_TAGS.map(([id, p, d]) => ({
  id,
  pillarId: p,
  dimensionId: d,
  weight: (DIM_WEIGHT[d] ?? 0) / (cellCounts.get(`${p}:${d}`) ?? 1),
}));

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));

// Benchmark profiles — Target/Industry/Peer/External × 10 pillars.
export const BENCHMARKS: Record<string, Record<string, number>> = {
  target:   { lead: 4.0, strat: 4.0, scope: 4.0, ident: 4.0, assess: 4.0, treat: 4.0, monitor: 4.0, report: 4.0, culture: 4.0, improve: 4.0 },
  industry: { lead: 3.8, strat: 3.7, scope: 3.5, ident: 3.5, assess: 3.8, treat: 3.6, monitor: 3.5, report: 3.4, culture: 3.3, improve: 3.4 },
  peer:     { lead: 3.5, strat: 3.4, scope: 3.3, ident: 3.3, assess: 3.5, treat: 3.4, monitor: 3.2, report: 3.2, culture: 3.1, improve: 3.1 },
  external: { lead: 4.3, strat: 4.2, scope: 4.1, ident: 4.1, assess: 4.3, treat: 4.1, monitor: 4.0, report: 4.0, culture: 3.9, improve: 4.0 },
};

export const BENCHMARK_TYPES = Object.keys(BENCHMARKS);

// Roadmap action templates — 30 rows, 3 per pillar (Process / People / Technology).
export interface RoadmapAction {
  id: string; pillarId: string; dimensionId: string;
  description: string; expectedUplift: number; costScore: number; durationScore: number;
}

export const ROADMAP_ACTIONS: RoadmapAction[] = PILLAR_IDS.flatMap(pid => {
  const pname = PILLAR_NAMES[pid].toLowerCase();
  return [
    { id: `act_${pid}_1`, pillarId: pid, dimensionId: 'Process', description: `Standardize ${pname} workflows`, expectedUplift: 0.8, costScore: 3, durationScore: 2 },
    { id: `act_${pid}_2`, pillarId: pid, dimensionId: 'People', description: `Launch targeted capability uplift for ${pname}`, expectedUplift: 0.5, costScore: 1, durationScore: 2 },
    { id: `act_${pid}_3`, pillarId: pid, dimensionId: 'Technology', description: `Digitize ${pname} controls and dashboards`, expectedUplift: 0.7, costScore: 4, durationScore: 3 },
  ];
});
