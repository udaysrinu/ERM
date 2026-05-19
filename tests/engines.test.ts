import { describe, it, expect } from 'vitest';
import {
  computeVectors,
  computeAnalytics,
  computeDrift,
  generateRoadmap,
  missionStatus,
} from '../api/_lib/engines.js';
import { PILLAR_IDS, QUESTIONS, BENCHMARKS } from '../api/_lib/static.js';

function fixture(score: number) {
  return QUESTIONS.map(q => ({ questionId: q.id, score }));
}

describe('computeVectors', () => {
  it('100 responses of 3 → overallScore === 3.0', () => {
    const { overallScore } = computeVectors(fixture(3));
    expect(overallScore).toBeCloseTo(3.0, 5);
  });

  it('all-1s → overallScore === 1.0', () => {
    const { overallScore } = computeVectors(fixture(1));
    expect(overallScore).toBeCloseTo(1.0, 5);
  });

  it('all-5s → overallScore === 5.0', () => {
    const { overallScore } = computeVectors(fixture(5));
    expect(overallScore).toBeCloseTo(5.0, 5);
  });

  it('all-3s → dimensionScores has 4 entries (People/Process/Technology/Governance)', () => {
    const { dimensionScores } = computeVectors(fixture(3));
    expect(dimensionScores.size).toBe(4);
  });

  it('all-3s → pillarScores has 10 entries (one per pillar)', () => {
    const { pillarScores } = computeVectors(fixture(3));
    expect(pillarScores.size).toBe(10);
    expect(PILLAR_IDS.length).toBe(10);
  });
});

describe('computeAnalytics', () => {
  it('all-3s vs target → pillars have numeric gap/target and valid status', () => {
    const { pillarScores } = computeVectors(fixture(3));
    const { analytics } = computeAnalytics(pillarScores, 'target');
    expect(analytics).toHaveLength(10);
    for (const a of analytics) {
      expect(typeof a.gap).toBe('number');
      expect(typeof a.target).toBe('number');
      expect(['OPTIMIZED', 'ALIGNED', 'DEFICIENT']).toContain(a.status);
    }
  });

  it('all-5s vs target → every pillar OPTIMIZED', () => {
    const { pillarScores } = computeVectors(fixture(5));
    const { analytics } = computeAnalytics(pillarScores, 'target');
    for (const a of analytics) expect(a.status).toBe('OPTIMIZED');
  });

  it('all-1s vs target → every pillar DEFICIENT', () => {
    const { pillarScores } = computeVectors(fixture(1));
    const { analytics } = computeAnalytics(pillarScores, 'target');
    for (const a of analytics) expect(a.status).toBe('DEFICIENT');
  });
});

describe('computeDrift', () => {
  it('current === previous → all deltas 0', () => {
    const { pillarScores } = computeVectors(fixture(3));
    const { driftProfile, regressions } = computeDrift(pillarScores, pillarScores);
    expect(driftProfile).toHaveLength(10);
    for (const d of driftProfile) expect(d.delta).toBeCloseTo(0, 5);
    expect(regressions).toHaveLength(0);
  });

  it('current 5s vs previous 3s → all deltas +2', () => {
    const cur = computeVectors(fixture(5)).pillarScores;
    const prev = computeVectors(fixture(3)).pillarScores;
    const { driftProfile, regressions } = computeDrift(cur, prev);
    for (const d of driftProfile) expect(d.delta).toBeCloseTo(2, 5);
    expect(regressions).toHaveLength(0);
  });

  it('current 1s vs previous 3s → all deltas -2 and regressions are CRITICAL', () => {
    const cur = computeVectors(fixture(1)).pillarScores;
    const prev = computeVectors(fixture(3)).pillarScores;
    const { driftProfile, regressions } = computeDrift(cur, prev);
    for (const d of driftProfile) expect(d.delta).toBeCloseTo(-2, 5);
    expect(regressions).toHaveLength(10);
    for (const r of regressions) expect(r.severity).toBe('CRITICAL');
  });
});

describe('generateRoadmap', () => {
  it('deficient analytics → returns at least one roadmap item', () => {
    const { pillarScores } = computeVectors(fixture(1));
    const items = generateRoadmap(pillarScores, 'target');
    expect(items.length).toBeGreaterThan(0);
  });

  it('result is sorted by priorityScore DESC', () => {
    const { pillarScores } = computeVectors(fixture(1));
    const items = generateRoadmap(pillarScores, 'target');
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].priorityScore).toBeGreaterThanOrEqual(items[i].priorityScore);
    }
  });

  it('result has phase splits when length > 3', () => {
    const { pillarScores } = computeVectors(fixture(1));
    const items = generateRoadmap(pillarScores, 'target');
    expect(items.length).toBeGreaterThan(3);
    const phases = new Set(items.map(i => i.phase));
    expect(phases.has('Phase 1')).toBe(true);
    expect(phases.size).toBeGreaterThan(1);
  });

  it('all-5s vs target → empty roadmap (no gaps)', () => {
    const { pillarScores } = computeVectors(fixture(5));
    const items = generateRoadmap(pillarScores, 'target');
    expect(items).toHaveLength(0);
  });
});

describe('missionStatus', () => {
  const benchmarkAverage = 4.0;

  it('integrity high, no regressions → NOMINAL_SYNC', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 0,
        overallScore: 4.5,
        benchmarkAverage,
        regressionsCount: 0,
      }),
    ).toBe('NOMINAL_SYNC');
  });

  it('any critical regression → CRITICAL_GAP', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 2,
        overallScore: 4.0,
        benchmarkAverage,
        regressionsCount: 2,
      }),
    ).toBe('CRITICAL_GAP');
  });

  it('overallScore far below benchmark, no critical regressions → STRUCTURAL_WEAKNESS', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 0,
        overallScore: 1.0, // < 4.0 * 0.75 = 3.0
        benchmarkAverage,
        regressionsCount: 0,
      }),
    ).toBe('STRUCTURAL_WEAKNESS');
  });

  it('healthy score with non-critical regressions → VECTOR_DRIFT', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 0,
        overallScore: 4.0,
        benchmarkAverage,
        regressionsCount: 3,
      }),
    ).toBe('VECTOR_DRIFT');
  });
});

// Sanity: BENCHMARKS export wired correctly.
describe('static data', () => {
  it('BENCHMARKS.target covers all pillars', () => {
    for (const pid of PILLAR_IDS) {
      expect(typeof BENCHMARKS.target[pid]).toBe('number');
    }
  });
});
