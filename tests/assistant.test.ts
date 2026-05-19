import { test, expect, describe } from "vitest";
import { getAssistantReply } from "../src/lib/assistant";

// ─── FIXTURE ────────────────────────────────────────────────────────────────

const mockAnalysis = {
  entityName: "Logistics Core",
  benchmarkType: "industry",
  benchmarkAverage: 3.5,
  averageGap: 0.78,
  overallScore: 2.72,
  systemIntegrity: 40,
  criticalRegressionsCount: 2,
  activeRoadmapCount: 5,
  responseSummary: {
    totalResponses: 100,
    evidenceCount: 27,
    noteCount: 14,
    lastAnsweredAt: "2025-11-12T08:30:00.000Z",
  },
  missionStatus: "DRIFT_DETECTED",
  analytics: [
    { pillarId: "p1", pillarName: "Risk Treatment",     score: 2.10, target: 3.50, gap: 1.40, status: "BELOW", percentOfTarget: 60 },
    { pillarId: "p2", pillarName: "Governance",         score: 2.40, target: 3.50, gap: 1.10, status: "BELOW", percentOfTarget: 68 },
    { pillarId: "p3", pillarName: "Risk Monitoring",    score: 2.55, target: 3.50, gap: 0.95, status: "BELOW", percentOfTarget: 72 },
    { pillarId: "p4", pillarName: "Context Setting",    score: 2.80, target: 3.50, gap: 0.70, status: "BELOW", percentOfTarget: 80 },
    { pillarId: "p5", pillarName: "Risk Identification",score: 2.90, target: 3.50, gap: 0.60, status: "BELOW", percentOfTarget: 82 },
    { pillarId: "p6", pillarName: "Risk Analysis",      score: 3.10, target: 3.50, gap: 0.40, status: "BELOW", percentOfTarget: 88 },
    { pillarId: "p7", pillarName: "Risk Evaluation",    score: 3.30, target: 3.50, gap: 0.20, status: "BELOW", percentOfTarget: 94 },
    { pillarId: "p8", pillarName: "Communication",      score: 3.50, target: 3.50, gap: 0.00, status: "ALIGNED", percentOfTarget: 100 },
    { pillarId: "p9", pillarName: "Reporting",          score: 3.60, target: 3.50, gap: -0.10, status: "ABOVE", percentOfTarget: 102 },
    { pillarId: "p10",pillarName: "Continuous Improvement", score: 3.40, target: 3.50, gap: 0.10, status: "BELOW", percentOfTarget: 97 },
  ],
  dimensions: [
    { id: "people",     name: "People",     score: 2.40 },
    { id: "process",    name: "Process",    score: 2.85 },
    { id: "tech",       name: "Tech",       score: 3.10 },
    { id: "governance", name: "Governance", score: 2.65 },
  ],
  driftProfile: [
    { period: "Q1", delta: 0.10 },
    { period: "Q2", delta: -0.20 },
    { period: "Q3", delta: -0.35 },
  ],
  regressions: [
    { pillarId: "p1", pillarName: "Risk Treatment", delta: -0.450, severity: "CRITICAL" },
    { pillarId: "p2", pillarName: "Governance",     delta: -0.220, severity: "CRITICAL" },
    { pillarId: "p3", pillarName: "Risk Monitoring",delta: -0.110, severity: "FLAGGED" },
  ],
  roadmap: [
    { pillarId: "p1", description: "Codify risk treatment playbooks", phase: "Phase 1", priorityScore: 9.2, expectedUplift: 1.4 },
    { pillarId: "p2", description: "Stand up RCSA cadence",            phase: "Phase 1", priorityScore: 8.7, expectedUplift: 1.1 },
    { pillarId: "p3", description: "Deploy KRI monitoring dashboard",  phase: "Phase 2", priorityScore: 7.4, expectedUplift: 0.9 },
    { pillarId: "p4", description: "Refresh risk taxonomy",            phase: "Phase 2", priorityScore: 6.8, expectedUplift: 0.7 },
    { pillarId: "p5", description: "Quarterly assurance review",       phase: "Phase 3", priorityScore: 5.5, expectedUplift: 0.4 },
  ],
  responsesPercent: 100,
};

const BU_LIST = ["Logistics Core", "Retail Ops", "Capital Markets"];

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe("getAssistantReply — deterministic patterns", () => {
  test("1. weakest pillar / biggest gap", () => {
    const reply = getAssistantReply("what's our weakest pillar?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Risk Treatment");
    expect(reply).toContain("2.10");
    expect(reply).toContain("1.40");
  });

  test("2. top 3 gaps", () => {
    const reply = getAssistantReply("show me top 3 gaps", mockAnalysis, BU_LIST);
    expect(reply).toContain("Risk Treatment");
    expect(reply).toContain("Governance");
    expect(reply).toContain("Risk Monitoring");
    expect(reply).toContain("1)");
  });

  test("2b. top priorities phrasing", () => {
    const reply = getAssistantReply("what should I focus on?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Risk Treatment");
  });

  test("3a. compare current BU vs benchmark", () => {
    const reply = getAssistantReply("compare us against the benchmark", mockAnalysis, BU_LIST);
    expect(reply).toContain("Logistics Core");
    expect(reply).toContain("2.72");
    expect(reply).toContain("3.50");
  });

  test("3b. compare against another BU", () => {
    const reply = getAssistantReply("compare us vs Retail Ops", mockAnalysis, BU_LIST);
    expect(reply).toContain("Switch units in the sidebar");
  });

  test("4. explain a specific pillar (governance)", () => {
    const reply = getAssistantReply("explain governance", mockAnalysis, BU_LIST);
    expect(reply).toContain("Governance");
    expect(reply).toContain("2.40");
    expect(reply).toContain("target 3.50");
  });

  test("4b. explain by partial pillar (monitoring)", () => {
    const reply = getAssistantReply("tell me about monitoring", mockAnalysis, BU_LIST);
    expect(reply).toContain("Risk Monitoring");
    expect(reply).toContain("2.55");
  });

  test("5. dimension breakdown", () => {
    const reply = getAssistantReply("show people score and process maturity", mockAnalysis, BU_LIST);
    expect(reply).toContain("People");
    expect(reply).toContain("Process");
    expect(reply).toContain("Tech");
    expect(reply).toContain("Governance");
  });

  test("6. evidence count", () => {
    const reply = getAssistantReply("how much evidence do we have?", mockAnalysis, BU_LIST);
    expect(reply).toContain("27");
    expect(reply).toContain("14");
  });

  test("7. last update timestamp", () => {
    const reply = getAssistantReply("when was this last updated?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Last response captured");
    // Should contain a year token from the ISO timestamp.
    expect(reply).toMatch(/202[0-9]/);
  });

  test("8. regression / drift specifics", () => {
    const reply = getAssistantReply("any regression signals?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Risk Treatment");
    expect(reply).toContain("CRITICAL");
    expect(reply).toContain("3 regression");
  });

  test("9. roadmap top 3", () => {
    const reply = getAssistantReply("show me the roadmap", mockAnalysis, BU_LIST);
    expect(reply).toContain("1)");
    expect(reply).toContain("Codify risk treatment playbooks");
    expect(reply).toContain("Phase 1");
    expect(reply).toContain("+1.4");
  });

  test("10a. phase 1 explanation", () => {
    const reply = getAssistantReply("what's in phase 1?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Phase 1");
    expect(reply).toContain("2 actions");
    expect(reply).toContain("+2.5");
  });

  test("10b. phase 3 explanation", () => {
    const reply = getAssistantReply("what about phase 3?", mockAnalysis, BU_LIST);
    expect(reply).toContain("Phase 3");
    expect(reply).toContain("1 action");
  });

  test("11. mission status reasoning", () => {
    const reply = getAssistantReply("why is the status drifting?", mockAnalysis, BU_LIST);
    expect(reply).toContain("drift detected");
    expect(reply).toContain("40%");
    expect(reply).toContain("2 critical");
  });

  test("12. benchmark explanation", () => {
    const reply = getAssistantReply("explain the benchmark profile", mockAnalysis, BU_LIST);
    expect(reply).toContain("Industry");
    expect(reply).toContain("3.50");
  });

  test("13. methodology / formula", () => {
    const reply = getAssistantReply("how is the score computed?", mockAnalysis, BU_LIST);
    expect(reply).toContain("People/Process/Tech/Gov");
    expect(reply).toContain("ISO 31000");
  });

  test("14. why score below target", () => {
    const reply = getAssistantReply("why are we underperforming?", mockAnalysis, BU_LIST);
    expect(reply).toContain("People");
    expect(reply).toContain("2.40");
    expect(reply).toContain("Codify risk treatment playbooks");
  });

  test("15. unknown question fallback", () => {
    const reply = getAssistantReply("what's the weather like?", mockAnalysis, BU_LIST);
    expect(reply).toContain("I can answer questions about");
    expect(reply).toContain("weakest gap");
  });

  test("cold path — no analysis", () => {
    const reply = getAssistantReply("tell me something", undefined, BU_LIST);
    expect(reply).toContain("ERM Navigator");
  });

  test("cold path — benchmark question without analysis", () => {
    const reply = getAssistantReply("what benchmarks ship?", null, BU_LIST);
    expect(reply).toContain("Target");
    expect(reply).toContain("Industry");
  });
});
