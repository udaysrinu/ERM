import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";

// Strict integrity check mirrors server.ts:499-559: every question must have a
// response in the submitted batch. Patent Claim 1 depends on complete vectors.
//
// Self-bootstrap: the frontend generates assessmentId client-side and posts
// directly here at finalize time. We upsert the parent assessments row first
// so the foreign key in responses has a target. This removes the click-BU
// latency that an eager /api/assessments/create would have caused.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { assessmentId, entityId, responses } = req.body ?? {};
  if (!assessmentId || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Invalid Payload", message: "Responses must be an array." });
  }
  if (!entityId) {
    return res.status(400).json({ error: "Invalid Payload", message: "entityId is required on finalize." });
  }

  const dbQuestions = await sql<{ id: number }[]>`SELECT id FROM questions`;
  const expectedIds = new Set(dbQuestions.map(q => q.id));
  const receivedIds = new Set(responses.map((r: any) => r.questionId));

  if (receivedIds.size !== expectedIds.size) {
    return res.status(400).json({
      error: "Integrity Violation",
      message: `Unique question count mismatch. Expected ${expectedIds.size}, received ${receivedIds.size}.`,
    });
  }
  for (const id of expectedIds) {
    if (!receivedIds.has(id)) {
      return res.status(400).json({
        error: "Integrity Violation",
        message: `Missing vector for Question ID ${id}.`,
      });
    }
  }

  try {
    await sql.begin(async tx => {
      // Upsert the parent assessment. ON CONFLICT keeps this safe if the user
      // finalizes more than once (shouldn't happen, but defensive).
      await tx`
        INSERT INTO assessments (id, "entityId", "createdAt", status)
        VALUES (${assessmentId}, ${entityId}, ${new Date().toISOString()}, 'draft')
        ON CONFLICT (id) DO NOTHING
      `;
      // Idempotent: clear any prior responses for this assessment before re-inserting.
      await tx`DELETE FROM responses WHERE "assessmentId" = ${assessmentId}`;
      for (const r of responses) {
        await tx`
          INSERT INTO responses ("assessmentId", "questionId", score, "weightedScore", note, "evidenceName", "answeredAt")
          SELECT ${assessmentId}, id, ${r.score}, ${r.score} * weight, ${r.note || ""}, ${r.evidenceName || ""}, ${r.answeredAt || new Date().toISOString()}
          FROM questions WHERE id = ${r.questionId}
        `;
      }
    });

    return res.json({ success: true, count: responses.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Critical DB Write Failure:", error);
    return res.status(500).json({ error: "Storage Failure", details: String(error) });
  }
}
