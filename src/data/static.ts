// Frontend re-export from /shared so the catalog has a single source of truth.
// Both backend (api/_lib/static.ts) and frontend point at /shared/static.ts.
// Direct edits here are wrong — edit /shared/static.ts instead.
export * from "../../shared/static";
