import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { QUESTIONS_BY_ID } from "../_lib/static.js";
import { computeVectors } from "../_lib/engines.js";

/*
 * The only endpoint that mutates. Frontend posts:
 *   { assessmentId, entityId, operatorEmail?, responses: [{questionId, score, ...}] }
 * We upsert the assessment row (stamping email + computed overallScore so the
 * history list endpoint can show the score without re-running the full engine
 * for every past row) then insert the 100 responses in one transaction.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId, entityId, operatorEmail, responses } = req.body ?? {};
  if (!assessmentId || !entityId || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Integrity check: every known question has a response, no extras, no duplicates.
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

  // Compute the overall score server-side so the history list can show it
  // without re-hydrating every response.
  const { overallScore } = computeVectors(responses.map((r: any) => ({ questionId: r.questionId, score: r.score })));

  const nowIso = new Date().toISOString();
  const rows = responses.map((r: any) => ({
    "assessmentId": assessmentId,
    "questionId": r.questionId,
    score: r.score,
    note: r.note || "",
    "evidenceName": r.evidenceName || "",
    "answeredAt": r.answeredAt || nowIso,
  }));

  const normalizedEmail = typeof operatorEmail === "string" && operatorEmail.trim()
    ? operatorEmail.trim().toLowerCase()
    : null;

  try {
    await sql.begin(async tx => {
      await tx`
        INSERT INTO assessments (id, "entityId", status, "operatorEmail", "overallScore")
        VALUES (${assessmentId}, ${entityId}, 'completed', ${normalizedEmail}, ${overallScore})
        ON CONFLICT (id) DO UPDATE SET
          status = 'completed',
          "operatorEmail" = COALESCE(EXCLUDED."operatorEmail", assessments."operatorEmail"),
          "overallScore" = EXCLUDED."overallScore"
      `;
      await tx`DELETE FROM responses WHERE "assessmentId" = ${assessmentId}`;
      await tx`
        INSERT INTO responses ${tx(rows, "assessmentId", "questionId", "score", "note", "evidenceName", "answeredAt")}
      `;
    });

    return res.json({ success: true, count: responses.length, overallScore, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("responses/create failed:", error);
    return res.status(500).json({ error: "Storage failure", details: String(error) });
  }
}
