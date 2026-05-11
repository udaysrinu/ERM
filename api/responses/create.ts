import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { QUESTIONS_BY_ID } from "../_lib/static.js";

/*
 * The only endpoint that mutates. Frontend posts:
 *   { assessmentId, entityId, responses: [{questionId, score, note?, evidenceName?, answeredAt?}] }
 * We upsert the assessment row then insert the 100 responses in one transaction.
 * No eager /api/assessments/create; no separate engine-compute calls afterward —
 * the analysis endpoint derives everything from this raw data.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId, entityId, responses } = req.body ?? {};
  if (!assessmentId || !entityId || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Integrity check: every known question has a response, no extras, no duplicates.
  // Uses the bundled QUESTIONS_BY_ID constant — no DB roundtrip for validation.
  const receivedIds = new Set<number>(responses.map((r: any) => r.questionId));
  if (receivedIds.size !== responses.length) {
    return res.status(400).json({ error: "Integrity violation", message: "Duplicate questionIds" });
  }
  if (receivedIds.size !== QUESTIONS_BY_ID.size) {
    return res.status(400).json({
      error: "Integrity violation",
      message: `Expected ${QUESTIONS_BY_ID.size} responses, got ${receivedIds.size}`,
    });
  }
  for (const qid of QUESTIONS_BY_ID.keys()) {
    if (!receivedIds.has(qid)) {
      return res.status(400).json({ error: "Integrity violation", message: `Missing question ${qid}` });
    }
  }

  // Shape the response array for a single batched multi-row INSERT.
  // postgres.js will expand this to VALUES ($1,$2,...), ($N,...), ... in one round-trip.
  const nowIso = new Date().toISOString();
  const rows = responses.map((r: any) => ({
    "assessmentId": assessmentId,
    "questionId": r.questionId,
    score: r.score,
    note: r.note || "",
    "evidenceName": r.evidenceName || "",
    "answeredAt": r.answeredAt || nowIso,
  }));

  try {
    await sql.begin(async tx => {
      // Lazy-upsert the parent row (idempotent across finalize retries).
      await tx`
        INSERT INTO assessments (id, "entityId", status)
        VALUES (${assessmentId}, ${entityId}, 'completed')
        ON CONFLICT (id) DO UPDATE SET status = 'completed'
      `;
      // Clear any prior responses for this assessment, then batch-insert fresh.
      await tx`DELETE FROM responses WHERE "assessmentId" = ${assessmentId}`;
      await tx`
        INSERT INTO responses ${tx(rows, "assessmentId", "questionId", "score", "note", "evidenceName", "answeredAt")}
      `;
    });

    return res.json({ success: true, count: responses.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("responses/create failed:", error);
    return res.status(500).json({ error: "Storage failure", details: String(error) });
  }
}
