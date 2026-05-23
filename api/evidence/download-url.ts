import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { noStore } from "../_lib/cache.js";
import { getStorageClient, EVIDENCE_BUCKET } from "../_lib/storage.js";

/*
 * GET /api/evidence/download-url?assessmentId=...&questionId=...&operatorEmail=...
 *
 * Returns: { downloadUrl, expiresIn }
 *
 * Issues a short-lived (5 min) signed download URL for the evidence file
 * attached to (assessmentId, questionId). Verifies the requesting operator
 * owns the assessment before resolving — operator-scoped access is the
 * only access control gate (no shared cache, no public listing).
 */
const SIGNED_URL_TTL_SECONDS = 300;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") {
    return noStore(res).status(405).json({ error: "Method not allowed" });
  }

  const rawAssessmentId = req.query.assessmentId;
  const rawQuestionId = req.query.questionId;
  const rawEmail = req.query.operatorEmail;
  const assessmentId = Array.isArray(rawAssessmentId) ? rawAssessmentId[0] : rawAssessmentId;
  const questionIdStr = Array.isArray(rawQuestionId) ? rawQuestionId[0] : rawQuestionId;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;
  const questionId = typeof questionIdStr === "string" ? Number(questionIdStr) : NaN;

  if (!assessmentId || typeof assessmentId !== "string") {
    return noStore(res).status(400).json({ error: "assessmentId required" });
  }
  if (!Number.isInteger(questionId) || questionId < 1) {
    return noStore(res).status(400).json({ error: "questionId must be a positive integer" });
  }
  if (!email || typeof email !== "string") {
    return noStore(res).status(400).json({ error: "operatorEmail required" });
  }
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Look up the response row to get the storage path AND verify ownership
    // in a single query. Operator-scoping is enforced by joining assessments
    // back to operatorEmail.
    const [row] = await sql<{ evidencePath: string | null; evidenceName: string | null }[]>`
      SELECT r."evidencePath", r."evidenceName"
      FROM responses r
      JOIN assessments a ON a.id = r."assessmentId"
      WHERE r."assessmentId" = ${assessmentId}
        AND r."questionId" = ${questionId}
        AND a."operatorEmail" = ${normalizedEmail}
    `;
    if (!row) {
      return noStore(res).status(404).json({ error: "No evidence found for this question on this assessment" });
    }
    if (!row.evidencePath) {
      return noStore(res).status(404).json({ error: "Filename captured but no file uploaded", filename: row.evidenceName ?? null });
    }

    const supabase = getStorageClient();
    const { data, error } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(row.evidencePath, SIGNED_URL_TTL_SECONDS);

    if (error || !data) {
      console.error("createSignedUrl failed", error);
      return noStore(res).status(500).json({ error: "Could not issue download URL", details: error?.message });
    }

    return noStore(res).json({
      downloadUrl: data.signedUrl,
      expiresIn: SIGNED_URL_TTL_SECONDS,
      filename: row.evidenceName ?? null,
    });
  } catch (err: any) {
    console.error("download-url failed", err);
    return noStore(res).status(500).json({ error: "Storage failure", details: String(err?.message ?? err) });
  }
}
