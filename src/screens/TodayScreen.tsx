import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowUpDown, Command as CommandIcon, FileDown, X } from "lucide-react";
import {
  AnimatedNumber,
  BuGlyph,
  Card,
  Eyebrow,
  Pill,
  Sparkline,
  StatusDot,
} from "../components/primitives";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TrendChart } from "../components/TrendChart";
import { BU_TINTS } from "../lib/bu-tints";
import { BENCHMARK_LABEL } from "../lib/labels";

/*
 * Today / Live Brief — the named, time-stamped signal card for the current
 * assessment. Top bar carries BU dropdown, benchmark tabs, mission status
 * pill, and report/back actions. The body is a single Live Brief hero
 * (regression headline + 3 secondary metrics + CTAs + hero score with run
 * signature chip), then the pillar table (real per-pillar trajectories
 * from the trend API), the 4-tile Focus Inspector, response coverage,
 * the longitudinal pillar evolution chart, and the sequenced roadmap.
 *
 * Earlier iterations of this screen had 5 redundant chart cards (radar,
 * dimensions, drift mini, pillar delta, regression alerts) — all cut
 * because the same data was already in the headline + table + status
 * pills. The Live Brief carries the narrative; the table is the source
 * of truth.
 */
export function TodayScreen({
  analysis,
  bu,
  allBUs,
  benchmarkTypes,
  benchmarkType,
  onBenchmarkTypeChange,
  onEntityChange,
  onBack,
  onOpenPalette,
  onOpenActionPlan,
  onOpenProvenance,
  assessmentId,
  operatorEmail,
}: any) {
  type SortKey = "priority" | "uplift" | "phase";
  const [sortKey, setSortKey] = useState<SortKey>("priority");

  // Real per-pillar trajectories from /api/assessments/trend. Replaces
  // the deterministic Math.sin sparklines that synthesized "history" from
  // the current score — an integrity bug for a product whose patent claim
  // is reproducibility. When fewer than 2 sessions exist we render no
  // sparkline (rather than a misleading flat line or fabricated curve).
  const [pillarTrend, setPillarTrend] = useState<Record<string, number[]>>({});
  useEffect(() => {
    if (!bu?.id || !operatorEmail) return;
    const ctrl = new AbortController();
    fetch(`/api/assessments/trend?entityId=${bu.id}&operatorEmail=${encodeURIComponent(operatorEmail)}&benchmarkType=${benchmarkType}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        const sessions: any[] = data.sessions ?? [];
        if (sessions.length < 2) { setPillarTrend({}); return; }
        const byPillar: Record<string, number[]> = {};
        const pillarIds: string[] = sessions[0].pillars.map((p: any) => p.pillarId);
        for (const pid of pillarIds) {
          byPillar[pid] = sessions.map(s => s.pillars.find((x: any) => x.pillarId === pid)?.score ?? 0);
        }
        setPillarTrend(byPillar);
      })
      .catch(() => { /* abort or transient — leave map empty */ });
    return () => ctrl.abort();
  }, [bu?.id, operatorEmail, benchmarkType]);

  const {
    analytics,
    dimensions,
    regressions,
    roadmap,
    overallScore,
    systemIntegrity,
    entityName,
    criticalRegressionsCount,
    activeRoadmapCount,
    benchmarkAverage,
    responseSummary,
    missionStatus,
    signatures,
  } = analysis;
  void regressions;
  const [showSig, setShowSig] = useState(false);
  const alignedCount = analytics.filter((a: any) => a.score >= a.target).length;

  const statusMeta: Record<
    string,
    { dot: "amber" | "mint" | "coral" | "sky"; tone: "amber" | "mint" | "coral" | "sky"; label: string }
  > = {
    NOMINAL_SYNC: { dot: "mint", tone: "mint", label: "Aligned" },
    VECTOR_DRIFT: { dot: "amber", tone: "amber", label: "Drift detected" },
    CRITICAL_GAP: { dot: "coral", tone: "coral", label: "Critical gap" },
    STRUCTURAL_WEAKNESS: { dot: "coral", tone: "coral", label: "Structural weakness" },
  };
  const status = statusMeta[missionStatus] || statusMeta.NOMINAL_SYNC;

  const buTint = BU_TINTS[bu.id] ?? { tint: 'var(--color-bg-deep)', dot: 'var(--color-ink)' };

  return (
    <div className="min-h-screen">
      <div className="px-8 h-14 border-b hairline flex items-center justify-between bg-[var(--color-bg)]">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex items-center justify-center flex-shrink-0"
            style={{ width: 26, height: 26, borderRadius: 6, background: buTint.tint, color: buTint.dot }}
          >
            <BuGlyph id={bu.id} size={14} />
          </span>
          <select
            value={bu.id}
            onChange={e => onEntityChange(allBUs.find((b: any) => b.id === e.target.value))}
            className="bg-transparent text-[14px] font-medium text-[var(--color-ink)] outline-none cursor-pointer pr-1 appearance-none"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {allBUs.map((b: any) => (
              <option key={b.id} value={b.id} className="bg-[var(--color-surface)]">
                {b.name}
              </option>
            ))}
          </select>
          <span className="font-mono text-[11px] text-[var(--color-ink-muted)] hidden lg:inline">· {bu.industry}</span>
          <span className="h-[18px] w-px bg-[var(--color-border)] mx-2" />
          <Tabs value={benchmarkType} onValueChange={onBenchmarkTypeChange}>
            <TabsList>
              {benchmarkTypes.map((t: string) => (
                <TabsTrigger key={t} value={t}>{BENCHMARK_LABEL[t] || t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <Pill tone={status.tone}>
            <StatusDot color={status.dot} /> {status.label}
          </Pill>
          <button
            onClick={onOpenPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border hairline text-[11px] font-mono tracking-[0.06em] text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
            aria-label="Open command palette"
          >
            <CommandIcon size={11} />
            <span>K</span>
          </button>
          <button
            onClick={() => {
              if (!assessmentId) return;
              const url = `/api/assessments/${assessmentId}/pdf?benchmarkType=${benchmarkType}`;
              window.open(url, "_blank");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border hairline text-[11px] font-mono tracking-[0.06em] text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
            aria-label="Download executive PDF report"
          >
            <FileDown size={11} />
            <span>Report</span>
          </button>
          <button
            onClick={onBack}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-coral)] cursor-pointer transition-colors"
            aria-label="Back"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6 pb-20">
        {/* Live Brief hero — drift narrative + score + secondary metrics.
            Severity stripe lights coral when a CRITICAL regression is live. */}
        <Card severity={criticalRegressionsCount > 0 ? "coral" : (analysis.regressions?.length ?? 0) > 0 ? "amber" : "mint"} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <Eyebrow tone="accent">Live brief</Eyebrow>
                <h1
                  className="mt-3 text-[28px] font-medium leading-[1.25] tracking-[-0.018em] text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {(() => {
                    const worstReg = (analysis.regressions ?? [])[0];
                    if (worstReg) {
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenProvenance?.(worstReg.pillarId)}
                            className="text-[var(--color-coral)] hover:underline cursor-pointer"
                            title="View standards alignment for this pillar"
                          >
                            {worstReg.pillarName}
                          </button>{" "}
                          regressed{" "}
                          <span className="text-[var(--color-coral)]">
                            {worstReg.delta.toFixed(2)}
                          </span>{" "}
                          on {entityName} since the prior assessment.
                        </>
                      );
                    }
                    if (alignedCount >= 7) {
                      return (
                        <>
                          {entityName} is{" "}
                          <span className="text-[var(--color-mint)]">on benchmark</span>{" "}
                          across {alignedCount} of 10 pillars.
                        </>
                      );
                    }
                    return (
                      <>
                        {entityName} is{" "}
                        <span className="text-[var(--color-accent)]">drifting</span> on{" "}
                        {10 - alignedCount} of 10 pillars vs {BENCHMARK_LABEL[benchmarkType]}.
                      </>
                    );
                  })()}
                </h1>
                <p className="mt-3 text-[14px] leading-[1.55] text-[var(--color-ink-soft)] max-w-[640px]">
                  {analysis.regressions?.length > 0
                    ? `${analysis.regressions.length} regression signal${analysis.regressions.length === 1 ? '' : 's'} detected. ${activeRoadmapCount} roadmap action${activeRoadmapCount === 1 ? '' : 's'} sequenced by uplift / effort.`
                    : `${activeRoadmapCount} roadmap action${activeRoadmapCount === 1 ? '' : 's'} sequenced by expected uplift over delivery cost. ${BENCHMARK_LABEL[benchmarkType]} benchmark average ${benchmarkAverage.toFixed(2)}.`}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-[640px]">
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Eyebrow>Benchmark avg</Eyebrow>
                      <div className="mt-1 text-[20px] font-medium tabular text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {benchmarkAverage.toFixed(2)}
                        <span className="font-mono text-[10px] text-[var(--color-ink-muted)] ml-1">/ 5</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{BENCHMARK_LABEL[benchmarkType]} profile average across all 10 pillars.</TooltipContent>
                </UiTooltip>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Eyebrow>Aligned pillars</Eyebrow>
                      <div className={`mt-1 text-[20px] font-medium tabular ${alignedCount >= 7 ? 'text-[var(--color-mint)]' : alignedCount >= 4 ? 'text-[var(--color-accent)]' : 'text-[var(--color-coral)]'}`} style={{ fontFamily: 'var(--font-sans)' }}>
                        {alignedCount}
                        <span className="font-mono text-[10px] text-[var(--color-ink-muted)] ml-1">/ 10</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Pillars scoring at or above the active benchmark.</TooltipContent>
                </UiTooltip>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Eyebrow>Active roadmap</Eyebrow>
                      <div className="mt-1 text-[20px] font-medium tabular text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {activeRoadmapCount}
                        <span className="font-mono text-[10px] text-[var(--color-ink-muted)] ml-1">actions</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Sequenced by expected uplift ÷ (cost × duration).</TooltipContent>
                </UiTooltip>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={onOpenActionPlan}
                  disabled={activeRoadmapCount === 0}
                  className="btn-cta text-[12px] disabled:opacity-50"
                >
                  Open action plan <ArrowRight size={12} />
                </button>
                <button
                  onClick={onOpenPalette}
                  className="btn-ghost text-[12px]"
                >
                  Switch benchmark · ⌘K
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-end justify-between">
              <Eyebrow tone="accent">Maturity score</Eyebrow>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-end gap-3 cursor-help">
                    <div
                      className="text-[96px] font-medium leading-[0.95] tracking-[-0.04em] text-[var(--color-ink)] tabular"
                      style={{ fontFamily: 'var(--font-sans)', fontFeatureSettings: '"tnum","lnum","ss01"' }}
                    >
                      <AnimatedNumber value={overallScore} decimals={2} />
                    </div>
                    <Sparkline values={analytics.map((a: any) => a.score)} width={88} height={26} color="var(--color-accent)" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Weighted average of 10 pillars · each rolled up from 4-dimension × 10-question cells.
                </TooltipContent>
              </UiTooltip>
              <div className="flex flex-col items-end gap-2 mt-2">
                <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tracking-[0.06em] uppercase">
                  of 5.00 · overall
                </span>
                {/* Run signature — patent claim 24 made tangible. */}
                {signatures && (
                  <button
                    onClick={() => setShowSig(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border hairline bg-[var(--color-surface)] hover:border-[var(--color-accent)] cursor-pointer transition-colors"
                    aria-label="Inspect run signature"
                    title="Click to inspect the inputs that determined this score"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-mint)]" />
                    <span className="font-mono text-[10px] tracking-[0.06em] text-[var(--color-ink-soft)]">
                      sig·{signatures.scoringInputHashShort} · spec v{signatures.scoringSpecVersion} · {signatures.coverage?.ok ? "complete" : "incomplete"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {showSig && signatures && (
          <div
            className="fixed inset-0 z-[150] bg-[rgba(22,24,26,0.45)] backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowSig(false)}
          >
            <div
              className="card max-w-[640px] w-full p-7 shadow-[var(--shadow-deep)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-baseline justify-between">
                <Eyebrow tone="accent">Run signature · patent claim 24</Eyebrow>
                <button
                  onClick={() => setShowSig(false)}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
              <h3 className="mt-2 text-[20px] font-medium tracking-[-0.012em] text-[var(--color-ink)]">
                Same inputs always produce the same score.
              </h3>
              <p className="mt-2 text-[13px] text-[var(--color-ink-soft)] leading-[1.55]">
                These hashes are deterministic. Two assessments with the same scoring-input hash compute to the same overall score, byte-for-byte. Switching benchmark only changes the analysis hash, not the scoring hash.
              </p>

              <div className="mt-5 space-y-3">
                <div className="border-l-2 border-[var(--color-accent)] pl-3">
                  <Eyebrow tone="ink">Scoring-input hash</Eyebrow>
                  <code className="block mt-1 font-mono text-[11px] text-[var(--color-ink)] break-all leading-[1.5]">{signatures.scoringInputHash}</code>
                  <p className="mt-1 text-[11px] text-[var(--color-ink-muted)]">SHA-256 over canonical responses + catalog v{signatures.catalogVersion} (catalog·{signatures.catalogHash}) + spec v{signatures.scoringSpecVersion}.</p>
                </div>
                <div className="border-l-2 border-[var(--color-ink-faint)] pl-3">
                  <Eyebrow tone="ink">Analysis hash · {signatures.benchmarkType}</Eyebrow>
                  <code className="block mt-1 font-mono text-[11px] text-[var(--color-ink)] break-all leading-[1.5]">{signatures.analysisHash}</code>
                  <p className="mt-1 text-[11px] text-[var(--color-ink-muted)]">Adds the active benchmark profile to the scoring-input hash.</p>
                </div>
                <div>
                  <Eyebrow tone="ink">Coverage</Eyebrow>
                  <p className={`mt-1 font-mono text-[11px] ${signatures.coverage?.ok ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                    {signatures.coverage?.ok ? "complete · all questions answered exactly once" : `incomplete · ${signatures.coverage?.reason}`}
                  </p>
                </div>
                <div>
                  <Eyebrow tone="ink">Computed at</Eyebrow>
                  <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-muted)]">{signatures.computedAt}</p>
                </div>
              </div>

              <p className="mt-5 text-[11px] text-[var(--color-ink-muted)] leading-[1.55]">
                Note: this is an input fingerprint, not a tamper-evident signature. SHA-256 proves equality between two computations; HMAC + a server secret would be required for authenticity.
              </p>
            </div>
          </div>
        )}

        {/* Pillar table — D+ tabular layout with real per-pillar trajectories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Pillars · {analytics.length}</Eyebrow>
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular uppercase tracking-[0.18em]">
              Sort: gap desc
            </span>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b hairline">
                  <th className="px-5 py-3 text-left w-10"><Eyebrow>#</Eyebrow></th>
                  <th className="px-5 py-3 text-left"><Eyebrow>Pillar</Eyebrow></th>
                  <th className="px-5 py-3 text-right"><Eyebrow>Score</Eyebrow></th>
                  <th className="px-5 py-3 text-right"><Eyebrow>Bench</Eyebrow></th>
                  <th className="px-5 py-3 text-right"><Eyebrow>Δ</Eyebrow></th>
                  <th className="px-5 py-3 text-center"><Eyebrow>Trend</Eyebrow></th>
                  <th className="px-5 py-3 text-right"><Eyebrow>Status</Eyebrow></th>
                </tr>
              </thead>
              <tbody>
                {[...analytics].sort((a: any, b: any) => b.gap - a.gap).map((a: any, i: number) => {
                  const above = a.score >= a.target;
                  const near = a.score >= a.target * 0.8;
                  const sev = above ? "mint" : near ? "amber" : "coral";
                  const trend = pillarTrend[a.pillarId];
                  return (
                    <tr key={a.pillarId} className="border-b hairline last:border-b-0 hover:bg-[var(--color-bg-deep)]/40">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[var(--color-ink-muted)]">{(i + 1).toString().padStart(2, "0")}</td>
                      <td className="px-5 py-3.5 text-[var(--color-ink)] font-medium">
                        <button
                          type="button"
                          onClick={() => onOpenProvenance?.(a.pillarId)}
                          className="text-left hover:text-[var(--color-accent)] cursor-pointer transition-colors"
                          title="View standards alignment for this pillar"
                        >
                          {a.pillarName}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono tabular text-[var(--color-ink)]">{a.score.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-right font-mono tabular text-[var(--color-ink-muted)]">{a.target.toFixed(2)}</td>
                      <td className={`px-5 py-3.5 text-right font-mono tabular ${above ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                        {above ? "+" : "-"}{Math.abs(a.score - a.target).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {trend && trend.length >= 2 ? (
                            <Sparkline values={trend} width={88} height={22} color={sev === "mint" ? "var(--color-mint)" : sev === "coral" ? "var(--color-coral)" : "var(--color-accent)"} />
                          ) : (
                            <span className="font-mono text-[10px] text-[var(--color-ink-subtle)]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Pill tone={sev as any}>{above ? "Aligned" : near ? "Drifting" : "Critical"}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Focus Inspector — 4 dimension tiles vs 4.0 "Managed" reference. */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Focus inspector · operating dimensions</Eyebrow>
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular uppercase tracking-[0.18em]">
              Reference 4.00 · "Managed"
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {dimensions.map((d: any) => {
              const ref = 4.0;
              const above = d.score >= ref;
              const near = d.score >= ref * 0.85;
              const sev = above ? "mint" : near ? "amber" : "coral";
              const pct = Math.min(100, (d.score / 5) * 100);
              const refPct = (ref / 5) * 100;
              return (
                <Card key={d.id} severity={sev as any} variant="flat" className="p-5">
                  <div className="flex items-baseline justify-between">
                    <Eyebrow tone="ink">{d.name ?? d.id}</Eyebrow>
                    <Pill tone={sev as any}>{above ? "Aligned" : near ? "Drifting" : "Critical"}</Pill>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="display-num text-[34px] text-[var(--color-ink)]">
                      {d.score.toFixed(2)}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">/ 5.00</span>
                    <span className={`ml-auto font-mono text-[11px] font-semibold ${above ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                      {above ? "+" : "-"}{Math.abs(d.score - ref).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative mt-3 h-[5px] bg-[var(--color-surface-soft)] rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${pct}%`, background: above ? "var(--color-mint)" : near ? "var(--color-accent)" : "var(--color-coral)" }}
                    />
                    <div className="absolute inset-y-0 w-px bg-[var(--color-ink-faint)]" style={{ left: `${refPct}%` }} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Response coverage strip — what raw inputs underpin this analysis. */}
        <Card className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <Eyebrow>Vectors captured</Eyebrow>
              <p className="mt-2 display-num text-[22px] text-[var(--color-ink)]">
                {responseSummary.totalResponses}<span className="text-[12px] text-[var(--color-ink-muted)] ml-1">/ 100</span>
              </p>
            </div>
            <div>
              <Eyebrow>Evidence linked</Eyebrow>
              <p className="mt-2 display-num text-[22px] text-[var(--color-ink)]">
                {responseSummary.evidenceCount}
              </p>
            </div>
            <div>
              <Eyebrow>Notes captured</Eyebrow>
              <p className="mt-2 display-num text-[22px] text-[var(--color-ink)]">
                {responseSummary.noteCount}
              </p>
            </div>
            <div>
              <Eyebrow>System integrity</Eyebrow>
              <p className={`mt-2 display-num text-[22px] ${systemIntegrity >= 80 ? "text-[var(--color-mint)]" : systemIntegrity >= 50 ? "text-[var(--color-accent)]" : "text-[var(--color-coral)]"}`}>
                {systemIntegrity}<span className="text-[12px] text-[var(--color-ink-muted)] ml-1">%</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Pillar evolution — historical trend across past assessments. */}
        <TrendChart entityId={bu.id} operatorEmail={operatorEmail} benchmarkType={benchmarkType} />

        {/* Sequenced roadmap — preserved at top level for the audit narrative. */}
        <div>
          <Card className="p-0 overflow-hidden">
            <div className="px-7 py-5 border-b hairline flex items-center justify-between">
              <div>
                <Eyebrow tone="amber">Sequencing</Eyebrow>
                <h3 className="text-[18px] font-medium tracking-[-0.012em] text-[var(--color-ink)] mt-2">
                  Uplift roadmap
                </h3>
              </div>
              <Pill tone="ink">{activeRoadmapCount} actions</Pill>
            </div>
            <div className="overflow-auto max-h-[380px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-surface-soft)] border-b hairline sticky top-0 z-10">
                  <tr className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                    <th className="px-7 py-3 font-normal">Action</th>
                    <th className="px-3 py-3 font-normal">
                      <button
                        onClick={() => setSortKey("phase")}
                        className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] transition-colors ${sortKey === "phase" ? "text-[var(--color-ink)]" : ""}`}
                      >
                        Phase <ArrowUpDown size={10} className={sortKey === "phase" ? "text-[var(--color-gold)]" : ""} />
                      </button>
                    </th>
                    <th className="px-3 py-3 font-normal text-right">
                      <button
                        onClick={() => setSortKey("priority")}
                        className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] transition-colors ${sortKey === "priority" ? "text-[var(--color-ink)]" : ""}`}
                      >
                        Priority <ArrowUpDown size={10} className={sortKey === "priority" ? "text-[var(--color-gold)]" : ""} />
                      </button>
                    </th>
                    <th className="px-7 py-3 font-normal text-right">
                      <button
                        onClick={() => setSortKey("uplift")}
                        className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] transition-colors ${sortKey === "uplift" ? "text-[var(--color-ink)]" : ""}`}
                      >
                        Uplift <ArrowUpDown size={10} className={sortKey === "uplift" ? "text-[var(--color-gold)]" : ""} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...roadmap]
                    .sort((a: any, b: any) => {
                      if (sortKey === "uplift") return b.expectedUplift - a.expectedUplift;
                      if (sortKey === "phase") return (a.phase || "").localeCompare(b.phase || "") || (b.priorityScore - a.priorityScore);
                      return b.priorityScore - a.priorityScore;
                    })
                    .slice(0, 14)
                    .map((item: any, idx: number) => {
                      const pName =
                        analytics.find((e: any) => e.pillarId === item.pillarId)?.pillarName || item.pillarId;
                      const phaseTone =
                        item.phase === "Phase 1" ? "amber" : item.phase === "Phase 2" ? "sky" : "ink";
                      return (
                        <tr key={idx} className="border-b hairline last:border-0 hover:bg-[var(--color-surface-soft)] transition-colors">
                          <td className="px-7 py-4">
                            <p className="text-[13px] text-[var(--color-ink)]">{item.description}</p>
                            <p className="mt-1 font-mono text-[10px] text-[var(--color-ink-muted)]">
                              {pName} · {item.dimensionId}
                            </p>
                          </td>
                          <td className="px-3 py-4">
                            <Pill tone={phaseTone as any}>{item.phase}</Pill>
                          </td>
                          <td className="px-3 py-4 text-right font-mono text-[12px] tabular text-[var(--color-ink)]">
                            {item.priorityScore.toFixed(2)}
                          </td>
                          <td className="px-7 py-4 text-right font-mono text-[12px] tabular text-[var(--color-gold)] font-semibold">
                            +{item.expectedUplift.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
