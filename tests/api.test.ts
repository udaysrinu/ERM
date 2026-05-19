import { describe, it } from 'vitest';

// API integration tests are deferred. The api/* handlers depend on
// postgres.js + the Vercel Node runtime (VercelRequest/VercelResponse),
// which require a live DB and request/response mocking that is outside
// the scope of this unit-test pass. The pure scoring logic is fully
// covered by tests/engines.test.ts; CORS + DB plumbing will be covered
// in a follow-up via supertest + an in-memory pg shim.
//
// See SESSION_LOG / Agent E follow-ups.
describe('api integration', () => {
  it.skip('integration tests deferred — see SESSION_LOG', () => {});
});
