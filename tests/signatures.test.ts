import { describe, it, expect } from "vitest";
import {
  computeRunSignatures,
  validateScoringInputCoverage,
  SCORING_SPEC_VERSION,
  CATALOG_VERSION,
} from "../api/_lib/signatures";
import { QUESTIONS } from "../api/_lib/static";

/*
 * Run-signature determinism tests — the patent moat made testable.
 *
 * These pin the contract the UI depends on:
 *   "same scoring inputs ⇒ same scoringInputHash, always"
 *
 * Codex flagged five required pinned cases. All five are below.
 */

const fullResponses = QUESTIONS.map((q: any, i: number) => ({
  questionId: q.id,
  // Spread scores 1..5 deterministically so we don't sit at one extreme.
  score: ((i % 5) + 1),
}));

describe("computeRunSignatures — determinism", () => {
  it("produces identical scoringInputHash for identical inputs", () => {
    const a = computeRunSignatures(fullResponses, "target");
    const b = computeRunSignatures(fullResponses, "target");
    expect(a.scoringInputHash).toBe(b.scoringInputHash);
    expect(a.analysisHash).toBe(b.analysisHash);
  });

  it("scoringInputHash is stable across response array order", () => {
    const shuffled = [...fullResponses].reverse();
    const ordered = computeRunSignatures(fullResponses, "target");
    const reversed = computeRunSignatures(shuffled, "target");
    expect(ordered.scoringInputHash).toBe(reversed.scoringInputHash);
  });

  it("scoringInputHash differs when any score changes", () => {
    const baseline = computeRunSignatures(fullResponses, "target");
    const mutated = fullResponses.map((r, i) =>
      i === 0 ? { ...r, score: r.score === 5 ? 1 : (r.score + 1) } : r,
    );
    const mutatedSig = computeRunSignatures(mutated, "target");
    expect(mutatedSig.scoringInputHash).not.toBe(baseline.scoringInputHash);
  });

  it("analysisHash differs by benchmarkType, but scoringInputHash does not", () => {
    const target = computeRunSignatures(fullResponses, "target");
    const industry = computeRunSignatures(fullResponses, "industry");
    expect(target.scoringInputHash).toBe(industry.scoringInputHash);
    expect(target.analysisHash).not.toBe(industry.analysisHash);
  });

  it("includes spec + catalog versions in the returned struct", () => {
    const sig = computeRunSignatures(fullResponses, "target");
    expect(sig.scoringSpecVersion).toBe(SCORING_SPEC_VERSION);
    expect(sig.catalogVersion).toBe(CATALOG_VERSION);
    expect(sig.catalogHash.length).toBe(8);
    expect(sig.scoringInputHashShort.length).toBe(8);
    expect(sig.analysisHashShort.length).toBe(8);
  });
});

describe("validateScoringInputCoverage", () => {
  it("accepts a complete response set", () => {
    expect(validateScoringInputCoverage(fullResponses)).toEqual({ ok: true });
  });

  it("rejects a duplicate questionId", () => {
    const dup = [...fullResponses, { questionId: fullResponses[0].questionId, score: 3 }];
    const r = validateScoringInputCoverage(dup);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/duplicate/);
  });

  it("rejects a partial response set", () => {
    const partial = fullResponses.slice(0, 50);
    const r = validateScoringInputCoverage(partial);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/expected/);
  });

  it("rejects an unknown questionId even when count is correct", () => {
    // 99 real + 1 bogus ID = 100 unique IDs but invalid coverage.
    const tampered = [
      ...fullResponses.slice(0, fullResponses.length - 1),
      { questionId: 99999, score: 3 },
    ];
    const r = validateScoringInputCoverage(tampered);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/unknown/);
  });

  it("rejects an out-of-range score", () => {
    const bad = [
      { ...fullResponses[0], score: 7 },
      ...fullResponses.slice(1),
    ];
    const r = validateScoringInputCoverage(bad);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/range/);
  });

  it("rejects a non-integer score", () => {
    const bad = [
      { ...fullResponses[0], score: 3.5 },
      ...fullResponses.slice(1),
    ];
    const r = validateScoringInputCoverage(bad);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/range/);
  });
});
