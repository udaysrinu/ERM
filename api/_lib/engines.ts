import {
  BENCHMARKS,
  PILLAR_IDS,
  PILLAR_NAMES,
  PILLAR_WEIGHTS,
  QUESTIONS,
  QUESTIONS_BY_ID,
  ROADMAP_ACTIONS,
} from "./static.js";

export interface RawResponse { questionId: number; score: number; note?: string; evidenceName?: string; answeredAt?: string; }

export interface PillarAnalytic {
  pillarId: string; pillarName: string;
  score: number; target: number; gap: number;
  status: "OPTIMIZED" | "ALIGNED" | "DEFICIENT";
  percentOfTarget: number;
}
export interface DriftPoint { pillar: string; delta: number; }
export interface Regression {
  pillarId: string; pillarName: string; delta: number;
  severity: "CRITICAL" | "NOTICE";
}
export interface RoadmapItem {
  id: string; pillarId: string; dimensionId: string;
  description: string; expectedUplift: number;
  priorityScore: number; phase: "Phase 1" | "Phase 2" | "Phase 3";
}

// Per-cell dimension weight, pre-computed once.
// Recovered from: questionWeight × (# questions in that pillar×dimension cell).
const CELL_DIM_WEIGHT = new Map<string, number>();
{
  const groups = new Map<string, typeof QUESTIONS>();
  for (const q of QUESTIONS) {
    const key = `${q.pillarId}:${q.dimensionId}`;
    const arr = groups.get(key) ?? [];
    arr.push(q);
    groups.set(key, arr);
  }
  for (const [key, qs] of groups) {
    CELL_DIM_WEIGHT.set(key, qs[0].weight * qs.length);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Weighted scoring engine — patent Claim 2.
// Input: array of {questionId, score} for ONE assessment.
// Output: pillar aggregate scores, dimension averages, overall score.
// ─────────────────────────────────────────────────────────────────────────
export function computeVectors(responses: RawResponse[]): {
  pillarScores: Map<string, number>;
  dimensionScores: Map<string, number>;
  overallScore: number;
} {
  // Dimension averages.
  const dimSums = new Map<string, { sum: number; count: number }>();
  for (const r of responses) {
    const q = QUESTIONS_BY_ID.get(r.questionId);
    if (!q) continue;
    const entry = dimSums.get(q.dimensionId) ?? { sum: 0, count: 0 };
    entry.sum += r.score;
    entry.count += 1;
    dimSums.set(q.dimensionId, entry);
  }
  const dimensionScores = new Map<string, number>();
  for (const [dim, { sum, count }] of dimSums) {
    dimensionScores.set(dim, count > 0 ? sum / count : 0);
  }

  // Pillar × dimension cell weighted sums, then pillar aggregate.
  const cellSums = new Map<string, number>();
  for (const r of responses) {
    const q = QUESTIONS_BY_ID.get(r.questionId);
    if (!q) continue;
    const key = `${q.pillarId}:${q.dimensionId}`;
    cellSums.set(key, (cellSums.get(key) ?? 0) + r.score * q.weight);
  }

  const pillarScores = new Map<string, number>();
  for (const pid of PILLAR_IDS) {
    let weightedSum = 0;
    let cellWeightTotal = 0;
    for (const [key, sum] of cellSums) {
      if (!key.startsWith(`${pid}:`)) continue;
      weightedSum += sum;
      cellWeightTotal += CELL_DIM_WEIGHT.get(key) ?? 0;
    }
    pillarScores.set(pid, cellWeightTotal > 0 ? weightedSum / cellWeightTotal : 0);
  }

  const overallScore = PILLAR_IDS.reduce(
    (sum, pid) => sum + (pillarScores.get(pid) ?? 0) * PILLAR_WEIGHTS[pid],
    0,
  );

  return { pillarScores, dimensionScores, overallScore };
}

// Per-pillar comparison against a benchmark profile.
export function computeAnalytics(
  pillarScores: Map<string, number>,
  benchmarkType: string,
): { analytics: PillarAnalytic[]; benchmarkAverage: number; averageGap: number; systemIntegrity: number } {
  const profile = BENCHMARKS[benchmarkType] ?? BENCHMARKS.target;
  const analytics: PillarAnalytic[] = PILLAR_IDS.map(pid => {
    const score = pillarScores.get(pid) ?? 0;
    const target = profile[pid] ?? 4.0;
    const gap = Math.max(0, target - score);
    return {
      pillarId: pid,
      pillarName: PILLAR_NAMES[pid],
      score: Number(score.toFixed(2)),
      target,
      gap: Number(gap.toFixed(2)),
      status: score >= target ? "OPTIMIZED" : score >= target * 0.8 ? "ALIGNED" : "DEFICIENT",
      percentOfTarget: Number(((score / target) * 100).toFixed(1)),
    };
  });

  const benchmarkAverage = Number(
    (PILLAR_IDS.reduce((s, pid) => s + (profile[pid] ?? 4.0), 0) / PILLAR_IDS.length).toFixed(2),
  );
  const averageGap = Number(
    (analytics.reduce((s, a) => s + a.gap, 0) / analytics.length).toFixed(2),
  );
  const aligned = analytics.filter(a => a.score >= a.target).length;
  const systemIntegrity = Number(((aligned / PILLAR_IDS.length) * 100).toFixed(0));

  return { analytics, benchmarkAverage, averageGap, systemIntegrity };
}

// Drift detection engine — patent Claim 4.
export function computeDrift(
  current: Map<string, number>,
  previous: Map<string, number> | null,
): { driftProfile: DriftPoint[]; regressions: Regression[] } {
  if (!previous) return { driftProfile: [], regressions: [] };

  const driftProfile: DriftPoint[] = PILLAR_IDS.map(pid => ({
    pillar: PILLAR_NAMES[pid],
    delta: (current.get(pid) ?? 0) - (previous.get(pid) ?? 0),
  }));

  const regressions: Regression[] = driftProfile
    .filter(d => d.delta < 0)
    .map(d => {
      const pid = PILLAR_IDS.find(x => PILLAR_NAMES[x] === d.pillar)!;
      return {
        pillarId: pid,
        pillarName: d.pillar,
        delta: Number(d.delta.toFixed(3)),
        severity: Math.abs(d.delta) > 0.5 ? "CRITICAL" : "NOTICE",
      };
    });

  return { driftProfile, regressions };
}

// AI roadmap engine — patent Claim 5.
export function generateRoadmap(
  pillarScores: Map<string, number>,
  benchmarkType: string,
): RoadmapItem[] {
  const profile = BENCHMARKS[benchmarkType] ?? BENCHMARKS.target;
  const gapPillars = new Set(
    PILLAR_IDS.filter(pid => (pillarScores.get(pid) ?? 0) < (profile[pid] ?? 4.0)),
  );
  if (gapPillars.size === 0) return [];

  const scored = ROADMAP_ACTIONS
    .filter(a => gapPillars.has(a.pillarId))
    .map(a => ({
      ...a,
      priorityScore: a.expectedUplift / (a.costScore * a.durationScore),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  return scored.map((a, idx) => ({
    id: a.id,
    pillarId: a.pillarId,
    dimensionId: a.dimensionId,
    description: a.description,
    expectedUplift: a.expectedUplift,
    priorityScore: Number(a.priorityScore.toFixed(4)),
    phase: idx < 3 ? "Phase 1" : idx < 6 ? "Phase 2" : "Phase 3",
  }));
}

export function missionStatus(params: {
  criticalRegressionsCount: number;
  overallScore: number;
  benchmarkAverage: number;
  regressionsCount: number;
}): "NOMINAL_SYNC" | "CRITICAL_GAP" | "STRUCTURAL_WEAKNESS" | "VECTOR_DRIFT" {
  const { criticalRegressionsCount, overallScore, benchmarkAverage, regressionsCount } = params;
  if (criticalRegressionsCount > 0) return "CRITICAL_GAP";
  if (overallScore < benchmarkAverage * 0.75) return "STRUCTURAL_WEAKNESS";
  if (regressionsCount > 0) return "VECTOR_DRIFT";
  return "NOMINAL_SYNC";
}
