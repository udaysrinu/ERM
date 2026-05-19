import { describe, it, expect } from 'vitest';
import {
  computeVectors,
  computeAnalytics,
  computeDrift,
  generateRoadmap,
  missionStatus,
} from '../api/_lib/engines.js';
import { PILLAR_IDS, QUESTIONS, BENCHMARKS, PILLAR_WEIGHTS, PILLAR_NAMES } from '../api/_lib/static.js';

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

// ─────────────────────────────────────────────────────────────────────────
// Edge-case coverage (Batch A)
// ─────────────────────────────────────────────────────────────────────────

describe('computeVectors — heterogeneous fixture', () => {
  it('pattern [1,2,3,4,5] repeating across 100 questions → pinned overallScore', () => {
    // Pattern: question at index i (0-based) gets score (i % 5) + 1.
    // Per-cell averages are NOT uniform (since cell sizes vary), so the overall
    // score is a weighted blend, not simply 3.0. Pinned via one-time engine run.
    // The arithmetic mean of the [1,2,3,4,5] cycle is 3.0, but since pillars
    // have heterogeneous cell weights × question weights, the resulting
    // pillar-weighted overall score lands at ~3.0850 rather than exactly 3.0.
    const responses = QUESTIONS.map((q, i) => ({ questionId: q.id, score: (i % 5) + 1 }));
    const { overallScore } = computeVectors(responses);
    expect(overallScore).toBeCloseTo(3.0850497813556, 4);
  });
});

describe('computeAnalytics — boundary statuses', () => {
  it('pillarScore === target → status OPTIMIZED (>=)', () => {
    // BENCHMARKS.target is 4.0 for every pillar. Uniform-4 fixture lands every
    // pillar exactly at target.
    const { pillarScores } = computeVectors(fixture(4));
    const { analytics } = computeAnalytics(pillarScores, 'target');
    for (const a of analytics) {
      expect(a.score).toBeCloseTo(4.0, 5);
      expect(a.status).toBe('OPTIMIZED');
    }
  });

  it('pillarScore === target * 0.8 → status ALIGNED (>=)', () => {
    // 4.0 * 0.8 = 3.2. Uniform-3.2 fixture hits the lower ALIGNED boundary
    // exactly. Uniform fixtures always produce pillarScore === scoreValue
    // because the weighted average of identical scores is the score itself.
    const responses = QUESTIONS.map(q => ({ questionId: q.id, score: 3.2 }));
    const { pillarScores } = computeVectors(responses);
    const { analytics } = computeAnalytics(pillarScores, 'target');
    for (const a of analytics) {
      expect(a.score).toBeCloseTo(3.2, 5);
      expect(a.status).toBe('ALIGNED');
    }
  });
});

describe('computeDrift — severity boundary', () => {
  it('delta === -0.5 → NOTICE; delta === -0.51 → CRITICAL', () => {
    // Math.abs(delta) > 0.5 is strictly greater-than, so -0.5 sits in NOTICE.
    const current = new Map<string, number>(PILLAR_IDS.map(pid => [pid, 3.0]));
    const previous = new Map<string, number>(PILLAR_IDS.map(pid => [pid, 3.0]));
    // pillar 0 → -0.5 (NOTICE), pillar 1 → -0.51 (CRITICAL).
    previous.set(PILLAR_IDS[0], 3.5);
    previous.set(PILLAR_IDS[1], 3.51);
    const { regressions } = computeDrift(current, previous);
    const r0 = regressions.find(r => r.pillarId === PILLAR_IDS[0])!;
    const r1 = regressions.find(r => r.pillarId === PILLAR_IDS[1])!;
    expect(r0).toBeDefined();
    expect(r0.severity).toBe('NOTICE');
    expect(r1).toBeDefined();
    expect(r1.severity).toBe('CRITICAL');
  });
});

describe('missionStatus — STRUCTURAL_WEAKNESS boundary', () => {
  it('overallScore === benchmarkAverage * 0.75 → NOMINAL_SYNC (strict <)', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 0,
        overallScore: 3.0, // 4.0 * 0.75 exactly
        benchmarkAverage: 4.0,
        regressionsCount: 0,
      }),
    ).toBe('NOMINAL_SYNC');
  });

  it('overallScore just below benchmarkAverage * 0.75 → STRUCTURAL_WEAKNESS', () => {
    expect(
      missionStatus({
        criticalRegressionsCount: 0,
        overallScore: 2.99,
        benchmarkAverage: 4.0,
        regressionsCount: 0,
      }),
    ).toBe('STRUCTURAL_WEAKNESS');
  });
});

describe('static data invariants', () => {
  it('PILLAR_WEIGHTS sum to 1.0 (within 0.001)', () => {
    const sum = Object.values(PILLAR_WEIGHTS).reduce((s, w) => s + w, 0);
    expect(sum).toBeCloseTo(1.0, 3);
  });
});

describe('computeVectors — empty input', () => {
  it('empty responses → all pillarScores 0, no dimension entries, overallScore 0', () => {
    const { pillarScores, dimensionScores, overallScore } = computeVectors([]);
    expect(overallScore).toBe(0);
    expect(dimensionScores.size).toBe(0);
    expect(pillarScores.size).toBe(10);
    for (const pid of PILLAR_IDS) expect(pillarScores.get(pid)).toBe(0);
  });

  it('empty pillarScores → analytics all DEFICIENT with score 0', () => {
    const empty = new Map<string, number>(PILLAR_IDS.map(pid => [pid, 0]));
    const { analytics } = computeAnalytics(empty, 'target');
    expect(analytics).toHaveLength(10);
    for (const a of analytics) {
      expect(a.score).toBe(0);
      expect(a.status).toBe('DEFICIENT');
    }
  });
});

describe('computeVectors — unknown questionId', () => {
  it('unknown questionId silently skipped — overallScore matches base fixture', () => {
    const base = fixture(3);
    const withUnknown = [...base, { questionId: 9999, score: 5 }];
    const a = computeVectors(base).overallScore;
    const b = computeVectors(withUnknown).overallScore;
    expect(b).toBeCloseTo(a, 10);
  });
});

describe('computeAnalytics — unknown benchmarkType', () => {
  it('unknown benchmark falls back to BENCHMARKS.target', () => {
    const { pillarScores } = computeVectors(fixture(3));
    const unknown = computeAnalytics(pillarScores, 'nonexistent');
    const target = computeAnalytics(pillarScores, 'target');
    expect(unknown.benchmarkAverage).toBe(target.benchmarkAverage);
    for (let i = 0; i < unknown.analytics.length; i++) {
      expect(unknown.analytics[i].target).toBe(target.analytics[i].target);
      expect(unknown.analytics[i].status).toBe(target.analytics[i].status);
    }
  });
});

describe('computeDrift — missing pillar in previous', () => {
  it('missing pillar in previous treated as 0 (delta = current - 0)', () => {
    const current = new Map<string, number>(PILLAR_IDS.map(pid => [pid, 3.0]));
    const previous = new Map<string, number>();
    // Populate all but one pillar with matching values.
    for (let i = 1; i < PILLAR_IDS.length; i++) previous.set(PILLAR_IDS[i], 3.0);
    const { driftProfile } = computeDrift(current, previous);
    const missingPillarName = PILLAR_NAMES[PILLAR_IDS[0]];
    const missingDrift = driftProfile.find(d => d.pillar === missingPillarName)!;
    // current.get(pid)=3, previous.get(pid)=undefined → ?? 0 → delta = 3.
    expect(missingDrift.delta).toBeCloseTo(3.0, 5);
  });
});

describe('generateRoadmap — phase boundaries', () => {
  // ROADMAP_ACTIONS contains 3 actions per pillar (Process/People/Technology).
  // So N gap-pillars → 3*N items. The phase mapping is index-based:
  // idx<3 Phase 1, idx<6 Phase 2, else Phase 3.
  function buildScores(gapPillars: string[], gapValue = 1, fillValue = 5): Map<string, number> {
    return new Map<string, number>(
      PILLAR_IDS.map(pid => [pid, gapPillars.includes(pid) ? gapValue : fillValue]),
    );
  }

  it('1 gap-pillar → 3 actions, all Phase 1', () => {
    const items = generateRoadmap(buildScores([PILLAR_IDS[0]]), 'target');
    expect(items).toHaveLength(3);
    for (const it of items) expect(it.phase).toBe('Phase 1');
  });

  it('2 gap-pillars → 6 actions, 3 Phase 1 + 3 Phase 2', () => {
    const items = generateRoadmap(buildScores([PILLAR_IDS[0], PILLAR_IDS[1]]), 'target');
    expect(items).toHaveLength(6);
    expect(items.slice(0, 3).every(i => i.phase === 'Phase 1')).toBe(true);
    expect(items.slice(3, 6).every(i => i.phase === 'Phase 2')).toBe(true);
  });

  it('3 gap-pillars → 9 actions, 3 Phase 1 + 3 Phase 2 + 3 Phase 3', () => {
    const items = generateRoadmap(
      buildScores([PILLAR_IDS[0], PILLAR_IDS[1], PILLAR_IDS[2]]),
      'target',
    );
    expect(items).toHaveLength(9);
    expect(items.slice(0, 3).every(i => i.phase === 'Phase 1')).toBe(true);
    expect(items.slice(3, 6).every(i => i.phase === 'Phase 2')).toBe(true);
    expect(items.slice(6, 9).every(i => i.phase === 'Phase 3')).toBe(true);
  });
});
