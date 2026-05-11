import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Get it from Supabase Dashboard → Project Settings → Database → Connection pooling (Transaction mode).",
  );
}

// One connection per serverless invocation. Supabase transaction pooler handles
// the pooling server-side, so we keep the client-side pool tiny.
// prepare: false is required for the transaction pooler.
export const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});
