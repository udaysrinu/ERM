import type { VercelResponse } from "@vercel/node";

/*
 * HTTP cache helpers — Vercel edge cache + browser cache via Cache-Control.
 *
 * Three policies map to three response shapes:
 *
 * - shortPublic(res):  s-maxage=60, swr=300. Use when the URL is fully
 *   keyed (operator + entity + benchmarkType in the query string) so
 *   different URLs map to different cache entries. Trend and history
 *   list endpoints fit this.
 *
 * - mediumPrivate(res): private, max-age=30. Use when the response is
 *   operator-scoped but the URL doesn't expose the operator (e.g.
 *   /assessments/[id]/analysis — operatorEmail is on the assessment
 *   row, not the URL). Browser caches; shared edge does not.
 *
 * - noStore(res): no-store. Use for mutations (POST/PUT) and any
 *   endpoint where caching would be unsafe (e.g. signed-URL handouts
 *   that include operator-specific tokens).
 *
 * The s-maxage values are deliberately short — the engine is cheap
 * (well under a second per /analysis) and the patent claim is
 * reproducibility, not throughput. Caching is a polish item, not a
 * load-bearing feature.
 */
export function shortPublic(res: VercelResponse): VercelResponse {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res;
}

export function mediumPrivate(res: VercelResponse): VercelResponse {
  res.setHeader("Cache-Control", "private, max-age=30, must-revalidate");
  return res;
}

export function noStore(res: VercelResponse): VercelResponse {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  return res;
}
