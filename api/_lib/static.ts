// Re-export from /shared so the catalog has a single source of truth.
// Both backend (api/_lib/*) and frontend (src/data/*) point at /shared.
// Direct edits here are wrong — edit /shared/static.ts instead.
export * from "../../shared/static.js";
