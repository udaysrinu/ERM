import type { VercelRequest, VercelResponse } from "@vercel/node";

/*
 * CORS — origin allowlist instead of a blanket wildcard.
 *
 * Previously every endpoint sent `Access-Control-Allow-Origin: *`, which lets
 * any website on the internet call these APIs from a logged-in user's browser.
 * The frontend is served same-origin (Vercel) in production and via the Vite
 * dev proxy locally, so it never actually needs a cross-origin grant — the
 * wildcard was pure attack surface.
 *
 * Allowed origins, in order of precedence:
 *   1. ALLOWED_ORIGINS env var — comma-separated exact origins (recommended;
 *      set this in Vercel project settings as deployments get new URLs).
 *   2. A built-in default list of the known production origin, so the app keeps
 *      working even if the env var is never set.
 *   3. Any *.vercel.app preview URL for this project (branch previews rotate).
 *
 * Set ALLOWED_ORIGINS="*" explicitly to restore the old wildcard (e.g. for a
 * throwaway public demo) — opt-in, never the default.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "https://erm-navigator.vercel.app",
];

function parseAllowlist(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

function isAllowed(origin: string, allowlist: string[]): boolean {
  if (allowlist.includes("*")) return true;
  if (allowlist.includes(origin)) return true;
  // Branch previews for this project: https://erm-navigator-<hash>-<scope>.vercel.app
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol === "https:" && /(^|[.-])erm-navigator[a-z0-9-]*\.vercel\.app$/.test(hostname)) {
      return true;
    }
  } catch {
    // Malformed Origin header — treat as disallowed.
  }
  return false;
}

export function applyCors(req: VercelRequest, res: VercelResponse) {
  const allowlist = parseAllowlist();
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";

  if (allowlist.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && isAllowed(origin, allowlist)) {
    // Echo the specific allowed origin and vary on it so a shared cache can't
    // serve a response carrying the wrong origin to a different caller.
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  // If the origin is not allowed we simply omit the header; the browser blocks
  // the cross-origin read. Same-origin requests carry no Origin header and are
  // unaffected.

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
