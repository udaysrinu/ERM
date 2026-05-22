/**
 * SPA screen state machine. Drives sidebar highlights, route transitions,
 * and history sync. Only `login` is full-bleed; everything else renders
 * inside the persistent D+ shell.
 */
export type Screen =
  | "login"
  | "scope"
  | "assessment"
  | "navigator"     // Today / Live Brief
  | "action"        // Action Plan
  | "evidence"
  | "report"
  | "history"
  | "provenance";

export type OperatingDimension = "Process" | "Governance" | "People" | "Technology";

export type Pillar = 
  | "Leadership & Governance"
  | "Strategy & Integration"
  | "Scope, Context & Criteria"
  | "Risk Identification"
  | "Risk Assessment"
  | "Risk Treatment"
  | "Monitoring & Review"
  | "Recording & Reporting"
  | "Risk Culture"
  | "Continuous Improvement & Resilience";

export interface Question {
  id: number;
  dimension: OperatingDimension;
  pillar: Pillar;
  text: string;
  weight: number;
}

export interface AssessmentResponse {
  id: number; // questionId
  score: number; // 1-5
  hasEvidence: boolean;
  evidenceScore: number; // 0, 0.5, 1
  note: string;
  timestamp: string;
  history?: { score: number; timestamp: string }[];
}

export interface PillarScore {
  pillar: Pillar;
  baseScore: number;
  evidenceScore: number;
  adjustedScore: number;
  gap: number;
  rootCause: string;
}

export interface Benchmark {
  id: string;
  type: "target" | "industry" | "peer" | "external";
  pillarId: Pillar;
  score: number;
}

export interface DriftRecord {
  id: string;
  entityId: string;
  pillarId: Pillar;
  previousScore: number;
  currentScore: number;
  delta: number;
  timestamp: string;
}

export interface RoadmapAction extends ImprovementAction {
  priorityScore: number;
  phase: 1 | 2 | 3;
  expectedUplift: number;
}

export interface WeightMatrixEntry {
  pillar: Pillar;
  dimension: OperatingDimension;
  weight: number;
}

export interface ImprovementAction {
  id: string;
  name: string;
  dimension: OperatingDimension;
  pillar: Pillar | "Cross-cutting";
  impact: number;
  effort: "Low" | "Medium" | "High";
  timeline: string;
  category: "Foundational" | "Advanced";
}
