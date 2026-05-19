import { test, expect } from 'vitest';
import fc from 'fast-check';
import { computeVectors, computeAnalytics } from '../api/_lib/engines.js';
import { QUESTIONS } from '../api/_lib/static.js';

const QUESTION_IDS = QUESTIONS.map((q) => q.id);

// One response per question — matches the production input contract.
// (Engine assumes each questionId appears at most once per assessment;
// duplicates would inflate cell sums against pre-computed cell weights.)
const fullResponseSet = fc
  .array(fc.integer({ min: 1, max: 5 }), { minLength: QUESTION_IDS.length, maxLength: QUESTION_IDS.length })
  .map((scores) => QUESTION_IDS.map((questionId, idx) => ({ questionId, score: scores[idx] })));

const isFiniteNumber = (n: number) => Number.isFinite(n) && !Number.isNaN(n);

test('property: overallScore is finite and in [0, 5]', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const { overallScore } = computeVectors(responses);
      expect(isFiniteNumber(overallScore)).toBe(true);
      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(5);
    }),
    { numRuns: 100 },
  );
});

test('property: every pillarScore is finite and in [0, 5]', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const { pillarScores } = computeVectors(responses);
      for (const [, score] of pillarScores) {
        expect(isFiniteNumber(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      }
    }),
    { numRuns: 100 },
  );
});

test('property: every dimensionScore is finite and in [0, 5]', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const { dimensionScores } = computeVectors(responses);
      for (const [, score] of dimensionScores) {
        expect(isFiniteNumber(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      }
    }),
    { numRuns: 100 },
  );
});

test('property: computeVectors is idempotent', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const a = computeVectors(responses);
      const b = computeVectors(responses);
      expect(a.overallScore).toBe(b.overallScore);
      // Pillar scores match too
      for (const [pid, score] of a.pillarScores) {
        expect(b.pillarScores.get(pid)).toBe(score);
      }
    }),
    { numRuns: 100 },
  );
});

test('property: every analytics gap is >= 0', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const { pillarScores } = computeVectors(responses);
      const { analytics } = computeAnalytics(pillarScores, 'target');
      for (const a of analytics) {
        expect(a.gap).toBeGreaterThanOrEqual(0);
      }
    }),
    { numRuns: 100 },
  );
});

test('property: aligned + non-aligned pillars sum to 10', () => {
  fc.assert(
    fc.property(fullResponseSet, (responses) => {
      const { pillarScores } = computeVectors(responses);
      const { analytics } = computeAnalytics(pillarScores, 'target');
      const aligned = analytics.filter((a) => a.score >= a.target).length;
      const nonAligned = analytics.filter((a) => a.score < a.target).length;
      expect(aligned + nonAligned).toBe(10);
    }),
    { numRuns: 100 },
  );
});
