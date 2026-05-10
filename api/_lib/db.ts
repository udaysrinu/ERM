import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Get it from Supabase Dashboard → Project Settings → Database → Connection pooling (Transaction mode).",
  );
}

// One connection per serverless invocation. Supabase transaction pooler handles
// the pooling server-side, so we keep the client-side pool tiny.
export const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // required for transaction pooler
});

// Pillar weights used by the overall-score rollup (server.ts:144-155).
export const PILLAR_WEIGHTS: Record<string, number> = {
  lead: 0.2,
  strat: 0.15,
  scope: 0.1,
  ident: 0.1,
  assess: 0.2,
  treat: 0.1,
  monitor: 0.05,
  report: 0.05,
  culture: 0.03,
  improve: 0.02,
};

export const PILLAR_IDS = Object.keys(PILLAR_WEIGHTS);
