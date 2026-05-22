import { createHash } from "node:crypto";
import { PILLAR_IDS, BENCHMARKS, QUESTIONS } from "./static.js";

/*
 * Run signatures — the UI surface for patent claim 24 (reproducibility).
 *
 * Two hashes, deliberately separated:
 *
 * - scoringInputHash: SHA-256 of the canonical scoring INPUT — responses,
 *   the exact catalog of questions and weights they were scored against,
 *   and the version of the scoring spec. Two assessments with the same
 *   scoringInputHash MUST produce the same overall score, bit-for-bit.
 *   Excludes operator metadata (note, evidenceName, answeredAt) because
 *   those don't affect the score.
 *
 * - analysisHash: SHA-256 over (scoringInputHash, benchmarkType,
 *   benchmarkProfile). This is the signature of the rendered analysis VIEW,
 *   not the score itself. Switching Target → Industry changes this hash
 *   even though the underlying score doesn't move.
 *
 * The distinction matters for the auditor. "Did Generation regress?"
 * and "Did Generation regress against Industry benchmark?" are
 * different questions. Different hashes give us tactile separation.
 *
 * What this is NOT: tamper-evident authentication. SHA-256 proves
 * equality, not authenticity. For tamper evidence we'd need HMAC
 * with a server secret, which is deferred until there's a real audit
 * use case.
 */

// Versions are tied to the moat. Bump when:
// - SCORING_SPEC_VERSION: engines.ts logic changes (weights, formulas)
// - CATALOG_VERSION: static.ts content changes (questions, rubric anchors,
//   benchmark profiles, pillar weights)
// A signature lies if either changes without a version bump. The unit-test
// `expects pinned signature` will fail if the catalog drifts silently.
export const SCORING_SPEC_VERSION = "1.0.0";
export const CATALOG_VERSION = "1.0.0";

// Stable JSON stringify — sorts object keys recursively so two equivalent
// objects produce the same string. Codex P2: avoid lossy rounding inside
// the hash. We emit numbers with `toString()` so the canonical bytes are
// identical to the bytes the engine sees, no rounding step in between.
// Scores in this product are integers 1..5 (validated upstream), so the
// rounding in the prior version would only have masked malformed inputs;
// removing it lets coverage validation reject them instead.
function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error("non-finite number is not signable");
    }
    return value.toString();
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
  }
  return "null";
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// Short fingerprint of the canonical question catalog. Captures every
// question's id, pillar, dimension, and weight. If any of these change the
// catalog hash changes — and the signature with it.
let _catalogHash: string | null = null;
function catalogHash(): string {
  if (_catalogHash) return _catalogHash;
  const canonical = QUESTIONS.map((q: any) => ({
    id: q.id,
    pillarId: q.pillarId,
    dimensionId: q.dimensionId,
    weight: q.weight,
  })).sort((a, b) => a.id - b.id);
  _catalogHash = sha256(stableStringify(canonical));
  return _catalogHash;
}

export interface ScoringInput {
  questionId: number;
  score: number;
}

export interface RunSignatures {
  scoringInputHash: string;
  scoringInputHashShort: string;  // first 8 hex chars for UI display
  analysisHash: string;
  analysisHashShort: string;
  scoringSpecVersion: string;
  catalogVersion: string;
  catalogHash: string;
  benchmarkType: string;
}

/**
 * Compute both hashes in one pass. Pure function — same inputs always
 * produce the same outputs, by construction.
 *
 * @param responses raw {questionId, score} list (any order, deduped)
 * @param benchmarkType active benchmark profile key
 * @returns RunSignatures struct ready for JSON response or storage
 */
export function computeRunSignatures(
  responses: ScoringInput[],
  benchmarkType: string,
): RunSignatures {
  // Canonical scoring input — sorted by questionId, only the fields that
  // determine the score. NB: we intentionally exclude `note`,
  // `evidenceName`, `answeredAt` here because they're operator metadata,
  // not scoring inputs. Excluding them is what makes the signature stable
  // across "same answers, different annotations" sessions — exactly what
  // the patent claim says.
  const canonicalResponses = responses
    .map(r => ({ q: r.questionId, s: r.score }))
    .sort((a, b) => a.q - b.q);

  const scoringInput = {
    responses: canonicalResponses,
    catalogHash: catalogHash(),
    catalogVersion: CATALOG_VERSION,
    scoringSpecVersion: SCORING_SPEC_VERSION,
  };

  const scoringInputHash = sha256(stableStringify(scoringInput));

  // Analysis = scoring input + the benchmark profile applied to it.
  // We hash the actual benchmark NUMBERS (not just the string label),
  // so a hypothetical edit to BENCHMARKS.industry would invalidate any
  // prior analysisHash that referenced it.
  const benchmarkProfile = BENCHMARKS[benchmarkType] ?? BENCHMARKS.target;
  const analysisInput = {
    scoringInputHash,
    benchmarkType,
    benchmarkProfile: PILLAR_IDS.map(pid => ({ pillarId: pid, target: benchmarkProfile[pid] ?? 4.0 })),
  };
  const analysisHash = sha256(stableStringify(analysisInput));

  return {
    scoringInputHash,
    scoringInputHashShort: scoringInputHash.slice(0, 8),
    analysisHash,
    analysisHashShort: analysisHash.slice(0, 8),
    scoringSpecVersion: SCORING_SPEC_VERSION,
    catalogVersion: CATALOG_VERSION,
    catalogHash: catalogHash().slice(0, 8),
    benchmarkType,
  };
}

// Pre-computed once: the canonical set of valid question IDs. Coverage
// validation rejects responses that reference IDs outside this set, which
// is what made Codex's "100 unique IDs but one is bogus" attack possible
// in the original count-only check.
let _knownQuestionIds: Set<number> | null = null;
function knownQuestionIds(): Set<number> {
  if (_knownQuestionIds) return _knownQuestionIds;
  _knownQuestionIds = new Set(QUESTIONS.map((q: any) => q.id));
  return _knownQuestionIds;
}

/**
 * Validate that responses cover every known question exactly once and
 * include nothing else. Used by the analysis endpoint to refuse to
 * compute signatures for malformed stored state — better to fail loudly
 * than ship a misleading hash.
 *
 * Rejects:
 *   - duplicate questionIds
 *   - questionIds not in the canonical catalog
 *   - non-integer or out-of-range scores (1..5)
 *   - missing answers (count below catalog)
 */
export function validateScoringInputCoverage(responses: ScoringInput[]): { ok: boolean; reason?: string } {
  const known = knownQuestionIds();
  const seen = new Set<number>();
  for (const r of responses) {
    if (seen.has(r.questionId)) return { ok: false, reason: `duplicate questionId ${r.questionId}` };
    if (!known.has(r.questionId)) return { ok: false, reason: `unknown questionId ${r.questionId}` };
    if (!Number.isInteger(r.score) || r.score < 1 || r.score > 5) {
      return { ok: false, reason: `score ${r.score} out of range 1..5 for q${r.questionId}` };
    }
    seen.add(r.questionId);
  }
  if (seen.size !== known.size) {
    return { ok: false, reason: `expected ${known.size} responses, got ${seen.size}` };
  }
  return { ok: true };
}
