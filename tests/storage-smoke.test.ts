/*
 * End-to-end smoke test for evidence storage. Hits the real Supabase
 * project. Skipped when SUPABASE_SERVICE_ROLE_KEY is not set so it
 * can't break CI for contributors without the secret.
 *
 * Verifies:
 *  - Service-role client can be constructed
 *  - createSignedUploadUrl returns a non-empty URL
 *  - PUT to that URL with a fixed payload succeeds
 *  - createSignedUrl returns a non-empty download URL
 *  - GET from the download URL returns the same bytes back
 *
 * Cleans up after itself by removing the test object.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
} catch {
  // .env.local not present — test will skip itself below
}

const haveServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!process.env.SUPABASE_URL;

describe.skipIf(!haveServiceKey)("evidence storage smoke", () => {
  it("mints upload+download URLs and round-trips a payload", async () => {
    const { getStorageClient, EVIDENCE_BUCKET, evidenceObjectKey } = await import("../api/_lib/storage");
    const client = getStorageClient();

    const path = evidenceObjectKey({
      assessmentId: "TXSMOKETEST",
      questionId: 1,
      filename: "smoke.txt",
    });
    const payload = `smoke ${Date.now()}`;

    // 1. Mint upload URL
    const upload = await client.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUploadUrl(path, { upsert: true });
    expect(upload.error).toBeNull();
    expect(upload.data?.signedUrl).toBeTruthy();

    // 2. PUT the payload to it
    const putRes = await fetch(upload.data!.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "text/plain" },
      body: payload,
    });
    expect(putRes.ok).toBe(true);

    // 3. Mint download URL
    const dl = await client.storage
      .from(EVIDENCE_BUCKET)
      .createSignedUrl(path, 60);
    expect(dl.error).toBeNull();
    expect(dl.data?.signedUrl).toBeTruthy();

    // 4. GET it back
    const getRes = await fetch(dl.data!.signedUrl);
    expect(getRes.ok).toBe(true);
    const body = await getRes.text();
    expect(body).toBe(payload);

    // 5. Cleanup
    await client.storage.from(EVIDENCE_BUCKET).remove([path]);
  }, 30_000);
});
