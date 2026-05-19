/*
 * Seed 18 historical assessments (3 sessions × 6 BUs) into Supabase with
 * intentional Generation/Risk-Treatment regression so the drift chart and
 * regression alerts render against real data.
 *
 * Usage:
 *   npx tsx scripts/seed-history.ts
 *
 * Reads DATABASE_URL from .env.local at the repo root (same connection string
 * the live API uses) and stamps every row with operatorEmail =
 * 'udaysrinu.786@gmail.com'. Idempotent — re-running deletes prior TXSEED*
 * rows first.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local before any module that reads process.env.DATABASE_URL.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
} catch (err) {
  console.warn(`[seed-history] could not read ${envPath}:`, (err as Error).message);
}

// Dynamic import after env is wired up so api/_lib/db.ts can read DATABASE_URL.
const { sql } = await import("../api/_lib/db.ts");
const { QUESTIONS } = await import("../api/_lib/static.ts");
const { computeVectors } = await import("../api/_lib/engines.ts");

const OPERATOR_EMAIL = "udaysrinu.786@gmail.com";

// Per-BU, per-session target average scores (1..5 scale).
const BU_PROFILES: Record<string, [number, number, number]> = {
  gen:  [2.6, 3.1, 3.0],
  tra:  [2.8, 3.2, 3.5],
  dis:  [2.5, 2.9, 3.4],
  corp: [3.4, 3.5, 3.6],
  sub:  [2.2, 2.8, 3.1],
  jv:   [3.0, 3.0, 2.8],
};

// Sessions are stamped at -90, -60, -30 days relative to now.
const SESSION_DAYS_AGO = [90, 60, 30];

// Deterministic LCG RNG so re-runs produce identical numbers (and thus identical
// overallScores). Seed is derived from the BU + session index.
function makeRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let state = h || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

interface ResponseRow {
  questionId: number;
  score: number;
}

// Generate 100 question scores for one BU+session.
// `prevSessionScores` is session2's scores when generating session3 — used by
// the Generation BU to deliberately knock down Risk Treatment by 0.6.
function generateResponses(
  bu: string,
  sessionIdx: number,
  prevSessionScores: Map<number, number> | null,
): ResponseRow[] {
  const target = BU_PROFILES[bu][sessionIdx];
  const rng = makeRng(`${bu}:${sessionIdx}`);
  const isGenSession3 = bu === "gen" && sessionIdx === 2;

  return QUESTIONS.map(q => {
    let score: number;
    if (isGenSession3 && q.pillarId === "treat" && prevSessionScores) {
      // Knock the Risk Treatment dimension down by 0.6 from session2.
      const prev = prevSessionScores.get(q.id) ?? target;
      score = clamp(Math.round(prev - 0.6), 1, 5);
    } else {
      const jitter = (rng() * 0.6) - 0.3; // [-0.3, +0.3]
      score = clamp(Math.round(target + jitter), 1, 5);
    }
    return { questionId: q.id, score };
  });
}

function sessionId(bu: string, sessionIdx: number): string {
  return `TXSEED${bu.toUpperCase()}${sessionIdx + 1}`;
}

async function main() {
  console.log("[seed-history] connecting and clearing prior TXSEED* rows…");
  await sql`DELETE FROM assessments WHERE id LIKE 'TXSEED%'`;

  const assessmentRows: Array<{
    id: string;
    entityId: string;
    createdAt: Date;
    overallScore: number;
  }> = [];
  const responseRows: Array<{
    assessmentId: string;
    questionId: number;
    score: number;
    answeredAt: Date;
  }> = [];

  const now = Date.now();

  for (const bu of Object.keys(BU_PROFILES)) {
    let prev: Map<number, number> | null = null;
    let session2: Map<number, number> | null = null;

    for (let s = 0; s < SESSION_DAYS_AGO.length; s++) {
      const responses = generateResponses(bu, s, s === 2 ? session2 : null);
      const { overallScore } = computeVectors(responses);

      const id = sessionId(bu, s);
      const createdAt = new Date(now - SESSION_DAYS_AGO[s] * 24 * 60 * 60 * 1000);

      assessmentRows.push({
        id,
        entityId: bu,
        createdAt,
        overallScore: Number(overallScore.toFixed(4)),
      });
      for (const r of responses) {
        responseRows.push({
          assessmentId: id,
          questionId: r.questionId,
          score: r.score,
          answeredAt: createdAt,
        });
      }

      const map = new Map<number, number>();
      for (const r of responses) map.set(r.questionId, r.score);
      if (s === 1) session2 = map;
      prev = map;
    }
    void prev;
  }

  console.log(
    `[seed-history] inserting ${assessmentRows.length} assessments + ${responseRows.length} responses…`,
  );

  await sql.begin(async tx => {
    for (const a of assessmentRows) {
      await tx`
        INSERT INTO assessments (id, "entityId", "createdAt", status, "operatorEmail", "overallScore")
        VALUES (${a.id}, ${a.entityId}, ${a.createdAt}, 'completed', ${OPERATOR_EMAIL}, ${a.overallScore})
      `;
    }
    // Batch responses 500 at a time.
    const CHUNK = 500;
    for (let i = 0; i < responseRows.length; i += CHUNK) {
      const chunk = responseRows.slice(i, i + CHUNK);
      await tx`
        INSERT INTO responses ${tx(chunk, "assessmentId", "questionId", "score", "answeredAt")}
      `;
    }
  });

  console.log(
    `Seeded ${assessmentRows.length} assessments, ${responseRows.length} responses`,
  );

  await sql.end({ timeout: 5 });
}

main().catch(err => {
  console.error("[seed-history] failed:", err);
  process.exit(1);
});
