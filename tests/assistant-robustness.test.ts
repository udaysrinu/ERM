import { test, expect, describe } from 'vitest';
import { getAssistantReply } from '../src/lib/assistant.js';

// Base "valid" analysis used as the well-formed starting point.
const baseAnalysis = () => ({
  entityName: 'Generation',
  benchmarkType: 'target',
  overallScore: 3.5,
  benchmarkAverage: 4.0,
  averageGap: 0.5,
  systemIntegrity: 60,
  criticalRegressionsCount: 0,
  missionStatus: 'NOMINAL_SYNC',
  analytics: [
    { pillarId: 'lead', pillarName: 'Leadership & Governance', score: 3.0, target: 4.0, gap: 1.0, status: 'DEFICIENT' },
    { pillarId: 'strat', pillarName: 'Strategy & Integration', score: 3.5, target: 4.0, gap: 0.5, status: 'ALIGNED' },
  ],
  dimensions: [
    { id: 'People', name: 'People', score: 3.2 },
    { id: 'Process', name: 'Process', score: 3.4 },
  ],
  regressions: [
    { pillarId: 'lead', pillarName: 'Leadership & Governance', delta: -0.3, severity: 'NOTICE' },
  ],
  roadmap: [
    { id: 'r1', pillarId: 'lead', pillarName: 'Leadership', description: 'Charter executive risk committee', expectedUplift: 0.4, phase: 'Phase 1' },
  ],
  responseSummary: { evidenceCount: 5, noteCount: 12, lastAnsweredAt: '2025-01-01T00:00:00Z' },
});

describe('assistant robustness — malformed analysis', () => {
  test('1. analytics: [] (empty array) — weakest gap does not throw', () => {
    const a = { ...baseAnalysis(), analytics: [] };
    let reply = '';
    expect(() => { reply = getAssistantReply('weakest gap', a); }).not.toThrow();
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });

  test('2. dimensions: undefined — dimension breakdown does not crash', () => {
    const a = { ...baseAnalysis(), dimensions: undefined };
    let reply = '';
    expect(() => { reply = getAssistantReply('dimension breakdown', a); }).not.toThrow();
    expect(typeof reply).toBe('string');
  });

  test('3. regressions: undefined — regression specifics does not crash', () => {
    const a = { ...baseAnalysis(), regressions: undefined };
    let reply = '';
    expect(() => { reply = getAssistantReply('regression specifics', a); }).not.toThrow();
    expect(typeof reply).toBe('string');
  });

  test('4. responseSummary: undefined — evidence + last update do not crash', () => {
    const a = { ...baseAnalysis(), responseSummary: undefined };
    let evReply = '';
    let lastReply = '';
    expect(() => { evReply = getAssistantReply('how much evidence', a); }).not.toThrow();
    expect(() => { lastReply = getAssistantReply('when was the last update', a); }).not.toThrow();
    expect(typeof evReply).toBe('string');
    expect(typeof lastReply).toBe('string');
  });

  test('5. roadmap: undefined — top action does not crash', () => {
    const a = { ...baseAnalysis(), roadmap: undefined };
    let reply = '';
    expect(() => { reply = getAssistantReply('top action please', a); }).not.toThrow();
    expect(typeof reply).toBe('string');
  });

  test('6. missionStatus: null — status does not crash', () => {
    const a = { ...baseAnalysis(), missionStatus: null };
    let reply = '';
    expect(() => { reply = getAssistantReply('what is the status', a); }).not.toThrow();
    expect(typeof reply).toBe('string');
  });
});

describe('assistant robustness — adversarial prompts', () => {
  test('7. XSS prompt — reply does not contain literal <script>', () => {
    const reply = getAssistantReply('<script>alert(1)</script>', baseAnalysis());
    expect(reply).not.toContain('<script>');
    expect(reply.toLowerCase()).not.toContain('<script');
  });

  test('8. long prompt (5KB) — no crash, returns something', () => {
    const long = 'a'.repeat(5000);
    let reply = '';
    expect(() => { reply = getAssistantReply(long, baseAnalysis()); }).not.toThrow();
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });

  test('9. unicode prompt (emoji + RTL Arabic + zero-width) — no crash', () => {
    const unicode = '🚀🔥 مرحبا بالعالم ​‌‍';
    let reply = '';
    expect(() => { reply = getAssistantReply(unicode, baseAnalysis()); }).not.toThrow();
    expect(typeof reply).toBe('string');
  });

  test('10. empty prompt — returns something', () => {
    let reply = '';
    expect(() => { reply = getAssistantReply('', baseAnalysis()); }).not.toThrow();
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });

  test('11. whitespace-only prompt — returns something', () => {
    let reply = '';
    expect(() => { reply = getAssistantReply('   \t\n   ', baseAnalysis()); }).not.toThrow();
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });
});
