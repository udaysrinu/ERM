import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "../../_lib/cors.js";
import { sql } from "../../_lib/db.js";
import {
  computeAnalytics,
  computeDrift,
  computeVectors,
  generateRoadmap,
  missionStatus,
  type RawResponse,
} from "../../_lib/engines.js";
import { BUSINESS_UNIT_NAMES, BENCHMARKS, PILLAR_IDS } from "../../_lib/static.js";
import { computeRunSignatures, validateScoringInputCoverage } from "../../_lib/signatures.js";
import { mediumPrivate } from "../../_lib/cache.js";

/*
 * Single unified endpoint — reads raw responses from the 2-table DB and
 * runs ALL engines (scoring, drift, roadmap, analytics) in-memory per request.
 * No cached engine-output tables. Always-fresh dashboard.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const id = req.query.id as string;
  const benchmarkType = (typeof req.query.benchmarkType === "string" ? req.query.benchmarkType : "target");

  try {
    // Load current assessment + its raw responses.
    const [assessment] = await sql<
      { id: string; entityId: string; createdAt: string; status: string; operatorEmail: string | null }[]
    >`SELECT id, "entityId", "createdAt", status, "operatorEmail" FROM assessments WHERE id = ${id}`;
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const rawResponses = await sql<
      { questionId: number; score: number; note: string; evidenceName: string; evidencePath: string; answeredAt: string }[]
    >`
      SELECT "questionId", score, note, "evidenceName", "evidencePath", "answeredAt"
      FROM responses WHERE "assessmentId" = ${id}
    `;

    // Current assessment — full engine pass.
    const responses: RawResponse[] = rawResponses.map(r => ({
      questionId: r.questionId,
      score: r.score,
      note: r.note,
      evidenceName: r.evidenceName,
      answeredAt: r.answeredAt,
    }));
    const { pillarScores, dimensionScores, overallScore } = computeVectors(responses);
    const { analytics, benchmarkAverage, averageGap, systemIntegrity } = computeAnalytics(
      pillarScores,
      benchmarkType,
    );

    // Drift — compare to the prior COMPLETED assessment for the same operator
    // and the same entity. Operator-scoping prevents cross-tenant data bleed
    // into the Live Brief headline; status-scoping ensures we never compare
    // against an abandoned/in-flight row.
    const [prior] = await sql<{ id: string }[]>`
      SELECT id FROM assessments
      WHERE "entityId" = ${assessment.entityId}
        AND id != ${id}
        AND "createdAt" < ${assessment.createdAt}
        AND status = 'completed'
        AND "operatorEmail" = ${assessment.operatorEmail}
      ORDER BY "createdAt" DESC LIMIT 1
    `;
    let driftProfile: any[] = [];
    let regressions: any[] = [];
    if (prior) {
      const priorResponses = await sql<
        { questionId: number; score: number }[]
      >`SELECT "questionId", score FROM responses WHERE "assessmentId" = ${prior.id}`;
      const { pillarScores: priorScores } = computeVectors(
        priorResponses.map(r => ({ questionId: r.questionId, score: r.score })),
      );
      const drift = computeDrift(pillarScores, priorScores);
      driftProfile = drift.driftProfile;
      regressions = drift.regressions;
    }

    // Roadmap.
    const roadmap = generateRoadmap(pillarScores, benchmarkType);

    // Meta.
    const criticalRegressionsCount = regressions.filter(r => r.severity === "CRITICAL").length;
    const status = missionStatus({
      criticalRegressionsCount,
      overallScore,
      benchmarkAverage,
      regressionsCount: regressions.length,
    });
    const isSynced = systemIntegrity >= 80 && criticalRegressionsCount === 0;

    const responseSummary = {
      totalResponses: rawResponses.length,
      evidenceCount: rawResponses.filter(r => r.evidenceName && r.evidenceName.length > 0).length,
      noteCount: rawResponses.filter(r => r.note && r.note.length > 0).length,
      lastAnsweredAt: rawResponses.reduce<string>(
        (max, r) => (r.answeredAt && r.answeredAt > max ? r.answeredAt : max),
        assessment.createdAt,
      ),
    };

    // Per-question evidence — what was actually attached during capture.
    // Used by the Evidence library so the UI never fabricates filenames.
    const evidenceFiles = rawResponses
      .filter(r => r.evidenceName && r.evidenceName.length > 0)
      .map(r => ({
        questionId: r.questionId,
        filename: r.evidenceName,
        // hasUpload tells the UI whether a real file is in storage (true)
        // or only the filename was captured (false). Drives the Evidence
        // library "Download" affordance.
        hasUpload: !!(r.evidencePath && r.evidencePath.length > 0),
        answeredAt: r.answeredAt,
      }));

    // Run signatures — patent claim 24 surfaced for the UI. We compute
    // them on every read so the user can SEE that same inputs always
    // produce the same hash. If the response set doesn't cover every
    // question exactly once we still compute (best-effort) but flag
    // the coverage status so the UI can warn instead of pretending.
    const coverage = validateScoringInputCoverage(
      rawResponses.map(r => ({ questionId: r.questionId, score: r.score })),
    );
    const signatures = computeRunSignatures(
      rawResponses.map(r => ({ questionId: r.questionId, score: r.score })),
      benchmarkType,
    );

    const profile = BENCHMARKS[benchmarkType] ?? BENCHMARKS.target;
    const benchmarkProfile = PILLAR_IDS.map(pid => ({
      pillarId: pid,
      score: Number((profile[pid] ?? 4.0).toFixed(2)),
    }));

    return mediumPrivate(res).json({
      assessmentId: id,
      entityId: assessment.entityId,
      entityName: BUSINESS_UNIT_NAMES[assessment.entityId] ?? assessment.entityId,
      overallScore: Number(overallScore.toFixed(2)),
      systemIntegrity,
      status: assessment.status,
      benchmarkType,
      benchmarkAverage,
      averageGap,
      timestamp: assessment.createdAt,
      criticalRegressionsCount,
      activeRoadmapCount: roadmap.length,
      targetBaseline: benchmarkAverage,
      missionStatus: status,
      isSynced,
      responseSummary,
      benchmarkProfile,
      analytics,
      dimensions: [...dimensionScores.entries()].map(([id, score]) => ({
        id,
        name: id,
        score: Number(score.toFixed(2)),
      })),
      driftProfile: driftProfile.map(d => ({ pillar: d.pillar, delta: Number(d.delta.toFixed(3)) })),
      regressions,
      roadmap,
      evidenceFiles,
      signatures: {
        ...signatures,
        coverage,
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("analysis endpoint failed:", error);
    return res.status(500).json({ error: "analysis failure", details: String(error) });
  }
}
