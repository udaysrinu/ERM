/*
 * API integration tests — Batch B.
 *
 * These tests bypass the HTTP layer entirely. Each api/* module exports a
 * default async (req, res) => Promise<void>; we hand it minimal mock req/res
 * objects and assert on the captured status / body / headers. Real DB,
 * real engine logic, real SQL — only the Vercel runtime is faked.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Env bootstrap ─────────────────────────────────────────────────────
// api/_lib/db.ts throws on import if DATABASE_URL is missing, so we MUST
// hydrate process.env from .env.local before any handler import. We mirror
// the pattern from scripts/seed-history.ts.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // If .env.local is missing the db import below will throw with a clearer
  // message anyway. Tests cannot run without it.
}

// Dynamic imports AFTER env is wired up.
const { sql } = await import('../api/_lib/db.js');
const { QUESTIONS } = await import('../api/_lib/static.js');
const loginHandler = (await import('../api/auth/login.js')).default;
const responsesCreateHandler = (await import('../api/responses/create.js')).default;
const assessmentsListHandler = (await import('../api/assessments/index.js')).default;
const assessmentsAnalysisHandler = (await import('../api/assessments/[id]/analysis.js')).default;
const assessmentsTrendHandler = (await import('../api/assessments/trend.js')).default;
const assessmentsPdfHandler = (await import('../api/assessments/[id]/pdf.js')).default;

// ── Mocks ─────────────────────────────────────────────────────────────
function mockReq(method: string, body: any = {}, query: any = {}) {
  return { method, body, query, headers: {} } as any;
}
function mockRes() {
  const res: any = { _status: 200, _body: undefined, _headers: {}, _ended: false };
  res.status = (s: number) => { res._status = s; return res; };
  res.json = (b: any) => { res._body = b; res._ended = true; return res; };
  res.setHeader = (k: string, v: string) => { res._headers[k.toLowerCase()] = v; return res; };
  res.end = (b?: any) => { if (b !== undefined) res._body = b; res._ended = true; return res; };
  res.send = (b: any) => { res._body = b; res._ended = true; return res; };
  return res;
}

// ── Test data ─────────────────────────────────────────────────────────
const TEST_EMAIL = 'apitest@gmail.com';
const TEST_EMAIL_2 = 'apitest2@gmail.com';
const TEST_PREFIX = 'TXTEST';

function makeAssessmentId(suffix: string) {
  return `${TEST_PREFIX}-${suffix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function fullResponses(score = 3) {
  return QUESTIONS.map(q => ({
    questionId: q.id,
    score,
    note: '',
    evidenceName: '',
    answeredAt: new Date().toISOString(),
  }));
}

async function cleanup() {
  await sql`DELETE FROM responses WHERE "assessmentId" LIKE ${TEST_PREFIX + '%'}`;
  await sql`DELETE FROM assessments WHERE id LIKE ${TEST_PREFIX + '%'}
    OR "operatorEmail" IN (${TEST_EMAIL}, ${TEST_EMAIL_2})`;
}

beforeAll(async () => {
  await cleanup();
});

afterAll(async () => {
  await cleanup();
  await sql.end({ timeout: 5 });
});

// ── /api/auth/login ───────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('accepts gmail + any password → 200, success, lowercased email', async () => {
    const res = mockRes();
    await loginHandler(mockReq('POST', { email: 'Foo@Gmail.com', password: 'anything' }), res);
    expect(res._status).toBe(200);
    expect(res._body.success).toBe(true);
    expect(res._body.email).toBe('foo@gmail.com');
  });

  it('rejects non-gmail address → 401', async () => {
    const res = mockRes();
    await loginHandler(mockReq('POST', { email: 'foo@yahoo.com', password: 'x' }), res);
    expect(res._status).toBe(401);
    expect(res._body.error).toMatch(/Gmail/i);
  });

  it('rejects empty password → 401', async () => {
    const res = mockRes();
    await loginHandler(mockReq('POST', { email: 'foo@gmail.com', password: '' }), res);
    expect(res._status).toBe(401);
  });

  it('rejects missing body → 401 (treated as missing fields)', async () => {
    const res = mockRes();
    await loginHandler(mockReq('POST', undefined), res);
    expect(res._status).toBe(401);
  });

  it('rejects GET → 405', async () => {
    const res = mockRes();
    await loginHandler(mockReq('GET'), res);
    expect(res._status).toBe(405);
  });
});

// ── /api/responses/create ─────────────────────────────────────────────
describe('POST /api/responses/create', () => {
  it('rejects GET → 405', async () => {
    const res = mockRes();
    await responsesCreateHandler(mockReq('GET'), res);
    expect(res._status).toBe(405);
  });

  it('rejects missing payload fields → 400', async () => {
    const res = mockRes();
    await responsesCreateHandler(mockReq('POST', { responses: [] }), res);
    expect(res._status).toBe(400);
  });

  it('rejects fewer than 100 responses → 400', async () => {
    const id = makeAssessmentId('short');
    const res = mockRes();
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: id,
        entityId: 'gen',
        operatorEmail: TEST_EMAIL,
        responses: fullResponses(3).slice(0, 50),
      }),
      res,
    );
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/Integrity/i);
  });

  it('rejects duplicate questionIds → 400', async () => {
    const id = makeAssessmentId('dup');
    const dup = fullResponses(3);
    dup[1] = { ...dup[1], questionId: dup[0].questionId }; // duplicate
    const res = mockRes();
    await responsesCreateHandler(
      mockReq('POST', { assessmentId: id, entityId: 'gen', operatorEmail: TEST_EMAIL, responses: dup }),
      res,
    );
    expect(res._status).toBe(400);
    expect(res._body.message).toMatch(/Duplicate/i);
  });

  it('persists 100 valid responses → 200, stamps lowercase email + overallScore', async () => {
    const id = makeAssessmentId('ok');
    const res = mockRes();
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: id,
        entityId: 'gen',
        operatorEmail: 'APItest@Gmail.com', // mixed-case to verify normalization
        responses: fullResponses(3),
      }),
      res,
    );
    expect(res._status).toBe(200);
    expect(res._body.success).toBe(true);
    expect(res._body.count).toBe(100);
    expect(res._body.overallScore).toBeCloseTo(3.0, 5);

    // Verify DB state.
    const [row] = await sql<{ operatorEmail: string; overallScore: number; status: string }[]>`
      SELECT "operatorEmail", "overallScore", status FROM assessments WHERE id = ${id}
    `;
    expect(row).toBeDefined();
    expect(row.operatorEmail).toBe('apitest@gmail.com');
    expect(Number(row.overallScore)).toBeCloseTo(3.0, 5);
    expect(row.status).toBe('completed');

    const [{ count }] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text AS count FROM responses WHERE "assessmentId" = ${id}
    `;
    expect(Number(count)).toBe(100);
  });
});

// ── /api/assessments (list) ───────────────────────────────────────────
describe('GET /api/assessments', () => {
  it('rejects POST → 405', async () => {
    const res = mockRes();
    await assessmentsListHandler(mockReq('POST'), res);
    expect(res._status).toBe(405);
  });

  it('rejects missing operatorEmail → 400', async () => {
    const res = mockRes();
    await assessmentsListHandler(mockReq('GET', undefined, {}), res);
    expect(res._status).toBe(400);
  });

  it('returns empty array for unknown email', async () => {
    const res = mockRes();
    await assessmentsListHandler(
      mockReq('GET', undefined, { operatorEmail: 'nobody-zzz@gmail.com' }),
      res,
    );
    expect(res._status).toBe(200);
    expect(res._body.assessments).toEqual([]);
  });

  it('returns assessments DESC by createdAt for the test email', async () => {
    // Seed two assessments with distinct createdAt (insert older one with stale timestamp).
    const idOld = makeAssessmentId('list-old');
    const idNew = makeAssessmentId('list-new');
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: idOld,
        entityId: 'gen',
        operatorEmail: TEST_EMAIL_2,
        responses: fullResponses(2),
      }),
      mockRes(),
    );
    // Backdate the old one.
    await sql`UPDATE assessments SET "createdAt" = NOW() - INTERVAL '5 days' WHERE id = ${idOld}`;
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: idNew,
        entityId: 'tra',
        operatorEmail: TEST_EMAIL_2,
        responses: fullResponses(4),
      }),
      mockRes(),
    );

    const res = mockRes();
    await assessmentsListHandler(
      mockReq('GET', undefined, { operatorEmail: TEST_EMAIL_2 }),
      res,
    );
    expect(res._status).toBe(200);
    const list = res._body.assessments as any[];
    expect(list.length).toBeGreaterThanOrEqual(2);
    const ours = list.filter(r => r.id === idOld || r.id === idNew);
    expect(ours.length).toBe(2);
    // First (newest) should be idNew.
    expect(ours[0].id).toBe(idNew);
    expect(ours[0].entityName).toBe('Transmission');
    expect(ours[1].id).toBe(idOld);
  });
});

// ── /api/assessments/[id]/analysis ────────────────────────────────────
describe('GET /api/assessments/[id]/analysis', () => {
  let analysisId: string;

  beforeAll(async () => {
    analysisId = makeAssessmentId('analysis');
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: analysisId,
        entityId: 'gen',
        operatorEmail: TEST_EMAIL,
        responses: fullResponses(3),
      }),
      mockRes(),
    );
  });

  it('returns expected analysis JSON shape', async () => {
    const res = mockRes();
    await assessmentsAnalysisHandler(mockReq('GET', undefined, { id: analysisId }), res);
    expect(res._status).toBe(200);
    const body = res._body;
    expect(body.assessmentId).toBe(analysisId);
    expect(Array.isArray(body.analytics)).toBe(true);
    expect(body.analytics.length).toBe(10);
    expect(Array.isArray(body.dimensions)).toBe(true);
    expect(body.dimensions.length).toBe(4);
    expect(typeof body.benchmarkAverage).toBe('number');
    expect(typeof body.overallScore).toBe('number');
    expect(body.overallScore).toBeCloseTo(3.0, 5);
    expect(body.benchmarkType).toBe('target');
  });

  it('returns 404 for unknown id', async () => {
    const res = mockRes();
    await assessmentsAnalysisHandler(
      mockReq('GET', undefined, { id: `${TEST_PREFIX}-does-not-exist` }),
      res,
    );
    expect(res._status).toBe(404);
  });

  it('switches profile when benchmarkType=industry', async () => {
    const target = mockRes();
    await assessmentsAnalysisHandler(
      mockReq('GET', undefined, { id: analysisId, benchmarkType: 'target' }),
      target,
    );
    const industry = mockRes();
    await assessmentsAnalysisHandler(
      mockReq('GET', undefined, { id: analysisId, benchmarkType: 'industry' }),
      industry,
    );
    expect(industry._status).toBe(200);
    expect(industry._body.benchmarkType).toBe('industry');
    // benchmarkAverage should differ between target and industry profiles.
    expect(industry._body.benchmarkAverage).not.toBe(target._body.benchmarkAverage);

    // Run signatures — patent claim 24 surfaced via the API.
    expect(target._body.signatures).toBeDefined();
    expect(target._body.signatures.scoringInputHash).toMatch(/^[0-9a-f]{64}$/);
    expect(target._body.signatures.analysisHash).toMatch(/^[0-9a-f]{64}$/);
    expect(target._body.signatures.coverage).toBeDefined();
    // Switching benchmark must change analysisHash but keep scoringInputHash stable.
    expect(industry._body.signatures.scoringInputHash).toBe(target._body.signatures.scoringInputHash);
    expect(industry._body.signatures.analysisHash).not.toBe(target._body.signatures.analysisHash);
  });

  it('rejects POST → 405', async () => {
    const res = mockRes();
    await assessmentsAnalysisHandler(mockReq('POST', {}, { id: analysisId }), res);
    expect(res._status).toBe(405);
  });
});

// ── /api/assessments/trend ────────────────────────────────────────────
describe('GET /api/assessments/trend', () => {
  it('rejects missing entityId → 400', async () => {
    const res = mockRes();
    await assessmentsTrendHandler(
      mockReq('GET', undefined, { operatorEmail: TEST_EMAIL }),
      res,
    );
    expect(res._status).toBe(400);
  });

  it('rejects missing operatorEmail → 400', async () => {
    const res = mockRes();
    await assessmentsTrendHandler(mockReq('GET', undefined, { entityId: 'gen' }), res);
    expect(res._status).toBe(400);
  });

  it('rejects POST → 405', async () => {
    const res = mockRes();
    await assessmentsTrendHandler(mockReq('POST'), res);
    expect(res._status).toBe(405);
  });

  it('returns sessions array sorted ASC by createdAt', async () => {
    const res = mockRes();
    await assessmentsTrendHandler(
      mockReq('GET', undefined, { entityId: 'gen', operatorEmail: TEST_EMAIL }),
      res,
    );
    expect(res._status).toBe(200);
    const sessions = res._body.sessions as any[];
    expect(Array.isArray(sessions)).toBe(true);
    // We seeded at least one 'gen' assessment for TEST_EMAIL in the analysis suite.
    expect(sessions.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < sessions.length; i++) {
      expect(new Date(sessions[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sessions[i - 1].createdAt).getTime(),
      );
    }
    // Each session has 10 pillars.
    expect(sessions[0].pillars.length).toBe(10);
  });
});

// ── /api/assessments/[id]/pdf ─────────────────────────────────────────
describe('GET /api/assessments/[id]/pdf', () => {
  let pdfId: string;

  beforeAll(async () => {
    pdfId = makeAssessmentId('pdf');
    await responsesCreateHandler(
      mockReq('POST', {
        assessmentId: pdfId,
        entityId: 'gen',
        operatorEmail: TEST_EMAIL,
        responses: fullResponses(3),
      }),
      mockRes(),
    );
  });

  it('returns a PDF buffer with correct headers', async () => {
    const res = mockRes();
    await assessmentsPdfHandler(mockReq('GET', undefined, { id: pdfId }), res);
    expect(res._status).toBe(200);
    expect(res._headers['content-type']).toBe('application/pdf');
    expect(res._headers['content-disposition']).toMatch(/\.pdf"?/);
    const buf = res._body as Buffer;
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(5000);
    // PDF magic header.
    expect(buf.slice(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('returns 404 for unknown id', async () => {
    const res = mockRes();
    await assessmentsPdfHandler(
      mockReq('GET', undefined, { id: `${TEST_PREFIX}-no-such-pdf` }),
      res,
    );
    expect(res._status).toBe(404);
  });

  it('rejects POST → 405', async () => {
    const res = mockRes();
    await assessmentsPdfHandler(mockReq('POST', {}, { id: pdfId }), res);
    expect(res._status).toBe(405);
  });
});
