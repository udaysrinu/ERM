// Deterministic assistant reply engine for ERM Navigator.
// Pure function: maps a natural-language prompt + analysis snapshot to a terse reply.
// No LLM calls, no network. All numbers come from the analysis fixture.

const BENCHMARK_LABEL: Record<string, string> = {
  target: "Target",
  industry: "Industry",
  peer: "Peers",
  external: "External",
};

const FALLBACK =
  "I can answer questions about: weakest gap, top 3 priorities, a specific pillar, drift signals, roadmap, or benchmark. Try one of those.";

const COLD_DEFAULT =
  "ERM Navigator captures 100 standards-aligned responses, computes a weighted maturity vector, detects drift against prior baselines, and sequences improvement actions by uplift-per-effort.";

const formatBenchmark = (type: string): string => BENCHMARK_LABEL[type] || type || "Target";

// Test if prompt mentions a non-current business unit name.
const mentionsOtherBU = (prompt: string, currentEntity: string, businessUnits: string[]): string | null => {
  const lower = prompt.toLowerCase();
  const current = (currentEntity || "").toLowerCase();
  for (const bu of businessUnits) {
    const buLower = bu.toLowerCase();
    if (buLower && buLower !== current && lower.includes(buLower)) return bu;
  }
  return null;
};

const dimensionBreakdownStr = (dimensions: any[]): string =>
  (dimensions || [])
    .map((d) => `${d.name || d.dimension || d.id} ${Number(d.score).toFixed(2)}`)
    .join(", ");

const phaseSummary = (roadmap: any[], phase: string) => {
  const items = (roadmap || []).filter((r) => (r.phase || "").toLowerCase() === phase.toLowerCase());
  const upliftSum = items.reduce((acc, r) => acc + (Number(r.expectedUplift) || 0), 0);
  return { count: items.length, upliftSum };
};

export const getAssistantReply = (
  prompt: string,
  analysis: any,
  businessUnits: string[] = [],
): string => {
  const n = (prompt || "").toLowerCase();

  // Cold path — no analysis yet.
  if (!analysis) {
    if (n.includes("weight") || n.includes("score") || n.includes("formula") || n.includes("method") || n.includes("how"))
      return "Scoring uses a 10-pillar × 4-dimension weighted matrix. Each pillar rolls up as Σ(cell × weight) ÷ Σ(weight); overall score is the pillar-weighted average.";
    if (n.includes("benchmark") || n.includes("peer") || n.includes("industry") || n.includes("external") || n.includes("target"))
      return "Four benchmark profiles ship by default — Target (4.0), Industry average (~3.5), Peer operators (~3.3), External reference (~4.1).";
    if (n.includes("roadmap") || n.includes("action") || n.includes("priorit"))
      return "Roadmap sequencing ranks actions by expected uplift ÷ (cost × duration). Top three land in Phase 1, next three in Phase 2, the rest in Phase 3.";
    return COLD_DEFAULT;
  }

  const analytics: any[] = analysis.analytics || [];
  const dimensions: any[] = analysis.dimensions || [];
  const regressions: any[] = analysis.regressions || [];
  const roadmap: any[] = analysis.roadmap || [];
  const benchLabel = formatBenchmark(analysis.benchmarkType);

  const sortedByGap = [...analytics].sort((a, b) => b.gap - a.gap);
  const weakest = sortedByGap[0];

  // Pattern 2: top 3 gaps / priorities / focus
  if (
    n.includes("top gap") ||
    n.includes("top 3") ||
    n.includes("top three") ||
    n.includes("biggest issue") ||
    n.includes("biggest issues") ||
    n.includes("focus on") ||
    n.includes("worst pillar") ||
    n.includes("priorities")
  ) {
    const top3 = sortedByGap.slice(0, 3);
    const list = top3
      .map((p, i) => `${i + 1}) ${p.pillarName} ${Number(p.score).toFixed(2)} (gap ${Number(p.gap).toFixed(2)})`)
      .join("; ");
    return `Top 3 gaps vs ${benchLabel}: ${list}.`;
  }

  // Pattern 3: compare BUs
  if (n.includes("compare") || n.includes("vs ") || n.includes("versus") || n.includes(" against ")) {
    const otherBU = mentionsOtherBU(prompt, analysis.entityName || "", businessUnits);
    if (otherBU) {
      return "I can only see the active unit's analysis. Switch units in the sidebar to compare.";
    }
    return `${analysis.entityName} overall ${Number(analysis.overallScore).toFixed(2)} vs ${benchLabel} ${Number(analysis.benchmarkAverage).toFixed(2)} (avg gap ${Number(analysis.averageGap).toFixed(2)}).`;
  }

  // Pattern 10: phase explanation (check before roadmap so "phase 1" wins over "actions")
  const phaseMatch = n.match(/phase\s*([123])/);
  if (phaseMatch) {
    const phase = `Phase ${phaseMatch[1]}`;
    const { count, upliftSum } = phaseSummary(roadmap, phase);
    return `${phase}: ${count} action${count === 1 ? "" : "s"} queued, expected uplift +${upliftSum.toFixed(1)}.`;
  }

  // Pattern 9: roadmap top 3
  if (n.includes("roadmap") || n.includes("action") || n.includes("priorit")) {
    if (!roadmap.length) return "No roadmap actions required — selected unit is aligned with the benchmark.";
    const top3 = roadmap.slice(0, 3);
    const list = top3
      .map(
        (r, i) =>
          `${i + 1}) ${r.description || r.pillarName || "Action"} [${r.phase || "Phase 1"}, +${Number(r.expectedUplift).toFixed(1)}]`,
      )
      .join("; ");
    return `Top roadmap: ${list}.`;
  }

  // Pattern 11: mission status reasoning (must precede drift so "status drifting" → status)
  if (n.includes("status") || n.includes("why aligned") || n.includes("why drift") || n.includes("mission")) {
    const status = String(analysis.missionStatus || "").replaceAll("_", " ").toLowerCase();
    return `Status: ${status}. ${analysis.systemIntegrity}% of pillars at or above baseline; ${analysis.criticalRegressionsCount} critical regression${analysis.criticalRegressionsCount === 1 ? "" : "s"}.`;
  }

  // Pattern 8: regression / drift
  if (n.includes("regression") || n.includes("drift")) {
    if (!regressions.length) return "No negative drift detected across the assessed pillars.";
    const worst = regressions[0];
    return `${regressions.length} regression signal(s). Worst: ${worst.pillarName} Δ${Number(worst.delta).toFixed(3)} (${worst.severity || "FLAGGED"}).`;
  }

  // Pattern 12: benchmark explanation
  if (n.includes("benchmark") || n.includes("industry") || n.includes("peer") || n.includes("external") || (n.includes("target") && !n.includes("targeting"))) {
    return `Active profile: ${benchLabel} (avg ${Number(analysis.benchmarkAverage).toFixed(2)}). ${analysis.systemIntegrity}% of pillars meeting or exceeding this baseline.`;
  }

  // Pattern 5: dimension breakdown — must precede methodology so generic "how do dimensions look" still hits methodology
  // but specific "people / process / tech / governance / dimension" hits this first.
  if (
    n.includes("dimension") ||
    n.includes("people score") ||
    n.includes("process maturity") ||
    n.includes("tech score") ||
    n.includes("technology score") ||
    n.includes("governance dim")
  ) {
    return `Dimensions: ${dimensionBreakdownStr(dimensions)}.`;
  }

  // Pattern 6: evidence / documentation — must precede methodology so "how much evidence" doesn't get caught by `how`.
  if (n.includes("evidence") || n.includes("documentation") || n.includes("docs ")) {
    const rs = analysis.responseSummary || {};
    return `Evidence attached: ${rs.evidenceCount ?? 0}; notes: ${rs.noteCount ?? 0}.`;
  }

  // Pattern 7: last update / timestamp — also precedes methodology to avoid "when was this last computed" hijack.
  if (n.includes("when") || n.includes("stamp") || n.includes("last") || n.includes("updated") || n.includes("recent")) {
    const ts = analysis.responseSummary?.lastAnsweredAt;
    if (!ts) return "No timestamp available — no responses recorded yet.";
    return `Last response captured: ${new Date(ts).toLocaleString()}.`;
  }

  // Pattern 13: methodology — broad `how`/`method` keywords; placed AFTER specific patterns above.
  if (n.includes("how") || n.includes("method") || n.includes("formula") || n.includes("compute") || n.includes("calculat")) {
    return "Each pillar = weighted average across People/Process/Tech/Gov dimensions; overall = pillar-weighted average. 100 questions × dimension weights from ISO 31000 alignment.";
  }

  // Pattern 14: why score below target / underperforming
  if (n.includes("why low") || n.includes("why below") || n.includes("underperform") || n.includes("under-perform")) {
    const worstDim = [...dimensions].sort((a, b) => Number(a.score) - Number(b.score))[0];
    const topAction = roadmap[0];
    const dimPart = worstDim ? `weakest dimension ${worstDim.name || worstDim.dimension} at ${Number(worstDim.score).toFixed(2)}` : "no dimension data";
    const actionPart = topAction ? `start with: ${topAction.description || topAction.pillarName}` : "no roadmap action queued";
    return `${dimPart}; ${actionPart}.`;
  }

  // Pattern 4: explain a specific pillar (substring match)
  const pillarHit = analytics.find((a) => {
    const name = String(a.pillarName || "").toLowerCase();
    if (!name) return false;
    // check 3+ char tokens to avoid trivial collisions
    const tokens = name.split(/[^a-z0-9]+/).filter((t: string) => t.length >= 4);
    return tokens.some((t: string) => n.includes(t)) || n.includes(name);
  });
  if (pillarHit) {
    return `${pillarHit.pillarName}: ${Number(pillarHit.score).toFixed(2)}, target ${Number(pillarHit.target).toFixed(2)} (${benchLabel}). Dimensions: ${dimensionBreakdownStr(dimensions)}.`;
  }

  // Pattern 1: weakest / biggest gap
  if (n.includes("weak") || n.includes("gap") || n.includes("worst")) {
    return weakest
      ? `${weakest.pillarName} is the primary gap — ${Number(weakest.score).toFixed(2)} vs ${benchLabel} ${Number(weakest.target).toFixed(2)}. Deficit: ${Number(weakest.gap).toFixed(2)}.`
      : "All pillars are at or above the selected benchmark.";
  }

  // Pattern 15: explicit guided fallback (no dead-end)
  return FALLBACK;
};

export default getAssistantReply;
