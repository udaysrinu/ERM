import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Supabase Storage client — server-only.
 *
 * Uses the service-role key so we can issue signed URLs without a logged-in
 * user session. Don't import this from client code; the service-role key
 * bypasses RLS and is dangerous if it leaks. The upload + download API
 * endpoints are the only callers.
 *
 * The bucket is `evidence`, private (no public listing), with a 10 MB file
 * size limit and a strict MIME allowlist enforced by the bucket itself
 * (see migration). Object keys are deterministic:
 *
 *   {assessmentId}/{questionId}-{filename}
 *
 * One assessment owns one folder; one question slot owns one file. Re-uploads
 * to the same slot overwrite the previous evidence — by design, since a
 * questionnaire response only carries one filename column today.
 */
let _client: SupabaseClient | null = null;

export function getStorageClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("SUPABASE_URL env var is required for Storage operations");
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY env var is required for evidence upload/download. " +
      "Add it to .env.local and Vercel project env vars (https://supabase.com/dashboard/project/_/settings/api)."
    );
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const EVIDENCE_BUCKET = "evidence";

/**
 * Compose the canonical object key for an evidence file. Operator-scoped
 * filename slugging would add a layer of defense, but the bucket is private
 * and access is gated by our API anyway. Keep the key human-readable so
 * future audit-trail features can show the path directly.
 */
export function evidenceObjectKey(args: { assessmentId: string; questionId: number; filename: string }): string {
  // Strip path separators from the filename to prevent escape-the-folder
  // attacks, but preserve extension and most punctuation.
  const safeFilename = args.filename.replace(/[\\/]/g, "_").slice(0, 200);
  return `${args.assessmentId}/${args.questionId}-${safeFilename}`;
}
