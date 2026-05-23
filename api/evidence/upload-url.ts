import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../_lib/cors.js";
import { sql } from "../_lib/db.js";
import { noStore } from "../_lib/cache.js";
import { getStorageClient, EVIDENCE_BUCKET, evidenceObjectKey } from "../_lib/storage.js";

/*
 * POST /api/evidence/upload-url
 *
 * Body: { assessmentId, questionId, filename, operatorEmail }
 * Returns: { uploadUrl, path, token }
 *
 * Issues a Supabase Storage signed upload URL the browser can PUT directly
 * to without ever holding the service-role key. Verifies the operator owns
 * the assessment before issuing the URL — otherwise any logged-in operator
 * could overwrite another's evidence.
 *
 * The `path` returned is the canonical object key the caller will write
 * back to the response row's evidencePath column on finalize.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") {
    return noStore(res).status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as {
    assessmentId?: string;
    questionId?: number | string;
    filename?: string;
    operatorEmail?: string;
  };
  const { assessmentId, filename, operatorEmail } = body;
  const questionId = typeof body.questionId === "string" ? Number(body.questionId) : body.questionId;

  if (!assessmentId || typeof assessmentId !== "string") {
    return noStore(res).status(400).json({ error: "assessmentId required" });
  }
  if (!filename || typeof filename !== "string") {
    return noStore(res).status(400).json({ error: "filename required" });
  }
  if (!operatorEmail || typeof operatorEmail !== "string") {
    return noStore(res).status(400).json({ error: "operatorEmail required" });
  }
  if (typeof questionId !== "number" || !Number.isInteger(questionId) || questionId < 1) {
    return noStore(res).status(400).json({ error: "questionId must be a positive integer" });
  }

  const normalizedEmail = operatorEmail.trim().toLowerCase();

  try {
    // Verify operator owns the assessment. If the row doesn't exist yet
    // (mid-questionnaire — finalize hasn't created the assessment row), we
    // accept the upload anyway because the questionnaire flow creates the
    // assessment+responses transactionally on finalize. The path we issue
    // is keyed to the assessmentId the client already holds.
    const [row] = await sql<{ operatorEmail: string | null }[]>`
      SELECT "operatorEmail" FROM assessments WHERE id = ${assessmentId}
    `;
    if (row && row.operatorEmail && row.operatorEmail !== normalizedEmail) {
      return noStore(res).status(403).json({ error: "Assessment belongs to a different operator" });
    }

    const path = evidenceObjectKey({ assessmentId, questionId, filename });
    const supabase = getStorageClient();
    const { data, error } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUploadUrl(path, { upsert: true });

    if (error || !data) {
      console.error("createSignedUploadUrl failed", error);
      return noStore(res).status(500).json({ error: "Could not issue upload URL", details: error?.message });
    }

    return noStore(res).json({
      uploadUrl: data.signedUrl,
      path,
      token: data.token,
    });
  } catch (err: any) {
    console.error("upload-url failed", err);
    return noStore(res).status(500).json({ error: "Storage failure", details: String(err?.message ?? err) });
  }
}
