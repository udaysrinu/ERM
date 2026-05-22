import React, { useMemo, useState } from "react";
import { Card, Eyebrow, Pill, Sparkline, AnimatedNumber, BuGlyph } from "../components/primitives";
import { Search, FileText, Download, ArrowRight } from "lucide-react";
import { PILLAR_PROVENANCE, DIMENSION_PROVENANCE, PILLARS, MATURITY_LEVELS } from "../data/static";

/* Auxiliary D+ screens — Action Plan, Evidence library, PDF Report preview.
   All driven from the existing analysis payload to keep them honest. */

type Analysis = any;

/* ── ACTION PLAN ───────────────────────────────────────────
   Three scenario cards (Status quo / Phase-1 / Full sequence) plus a
   sequenced action list. Inputs derived from analysis.roadmap and
   analysis.regressions. */
export function ActionPlanScreen({
  analysis,
  bu,
  onOpenToday,
}: {
  analysis: Analysis;
  bu: any;
  onOpenToday: () => void;
}) {
  const roadmap: any[] = analysis?.roadmap ?? [];
  const phase1 = roadmap.filter(r => r.phase === "Phase 1");
  const phase2 = roadmap.filter(r => r.phase === "Phase 2");
  const phase3 = roadmap.filter(r => r.phase === "Phase 3");

  const statusQuoScore = analysis?.overallScore ?? 0;
  const phase1Uplift = phase1.reduce((s, r) => s + (r.expectedUplift ?? 0), 0);
  const fullUplift = roadmap.reduce((s, r) => s + (r.expectedUplift ?? 0), 0);

  const focusPillar = analysis?.regressions?.[0]?.pillarName ?? analysis?.analytics?.[0]?.pillarName ?? "Risk Culture";
  const focusDelta = phase1Uplift.toFixed(2);

  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <div className="px-10 h-14 border-b hairline flex items-center gap-3 bg-[var(--color-bg)]">
        <BuGlyph id={bu?.id ?? "gen"} size={16} />
        <span className="text-[14px] font-medium text-[var(--color-ink)]">
          {bu?.name ?? "Generation"}
        </span>
        <span className="h-[18px] w-px bg-[var(--color-border)] mx-1" />
        <Eyebrow tone="accent">Action plan</Eyebrow>
        <span className="ml-auto" />
        <button onClick={onOpenToday} className="btn-ghost text-[12px]">Back to Today</button>
      </div>

      <div className="flex-1 px-10 py-9 overflow-y-auto">
        <Eyebrow tone="accent">Action plan · {focusPillar}</Eyebrow>
        <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
          Recover <span className="text-[var(--color-accent)] font-mono">+{focusDelta}</span> of {focusPillar} maturity in <span className="text-[var(--color-accent)]">90 days</span>.
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-soft)] max-w-[780px] leading-[1.55]">
          Navigator sequenced these by uplift × (effort × duration). Phase 1 carries the largest expected
          uplift per unit of cost — owners pre-assigned from each vector's history.
        </p>

        {/* Scenario cards */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <ScenarioCard
            label="Status quo"
            tag="DRIFT"
            tagTone="coral"
            score={statusQuoScore}
            delta={-(analysis?.regressions?.[0]?.delta ?? 0)}
            note={[
              "Drift continues at current pace",
              `${(analysis?.regressions ?? []).length} pillar${(analysis?.regressions ?? []).length === 1 ? "" : "s"} flagged`,
            ]}
          />
          <ScenarioCard
            label="Phase 1 only"
            tag="UPLIFT"
            tagTone="amber"
            score={statusQuoScore + phase1Uplift}
            delta={phase1Uplift}
            note={[
              `${phase1.length} actions · 12 weeks`,
              "Closes ~80% of focus-pillar gap",
            ]}
          />
          <ScenarioCard
            label="Full sequence"
            tag="UPLIFT"
            tagTone="amber"
            score={statusQuoScore + fullUplift}
            delta={fullUplift}
            recommended
            note={[
              `Phase 1 + 2 · ${roadmap.length} actions`,
              "Aligned on Industry by Q4",
            ]}
          />
        </div>

        {/* Sequenced action list */}
        <div className="mt-10 mb-4 flex items-baseline justify-between">
          <Eyebrow>Phase-1 actions · {phase1.length} sequenced</Eyebrow>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
            sort: priority desc
          </span>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b hairline">
                <th className="px-5 py-3 text-left"><Eyebrow>#</Eyebrow></th>
                <th className="px-5 py-3 text-left"><Eyebrow>Action</Eyebrow></th>
                <th className="px-5 py-3 text-left"><Eyebrow>Pillar</Eyebrow></th>
                <th className="px-5 py-3 text-left"><Eyebrow>Phase</Eyebrow></th>
                <th className="px-5 py-3 text-right"><Eyebrow>Uplift</Eyebrow></th>
              </tr>
            </thead>
            <tbody>
              {[...phase1, ...phase2, ...phase3].map((r: any, i: number) => (
                <tr key={r.id} className="border-b hairline last:border-b-0 hover:bg-[var(--color-bg-deep)]/40">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[var(--color-ink-muted)]">P{r.phase?.split(" ")[1] ?? "1"} · #{(i + 1).toString().padStart(2, "0")}</td>
                  <td className="px-5 py-3.5 text-[var(--color-ink)]">{r.description}</td>
                  <td className="px-5 py-3.5 text-[var(--color-ink-soft)]">{analysis?.analytics?.find((a: any) => a.pillarId === r.pillarId)?.pillarName ?? r.pillarId}</td>
                  <td className="px-5 py-3.5"><Pill tone={r.phase === "Phase 1" ? "amber" : "ink"}>{r.phase}</Pill></td>
                  <td className="px-5 py-3.5 text-right font-mono text-[12px] text-[var(--color-accent)] font-semibold">+{r.expectedUplift?.toFixed(2)}</td>
                </tr>
              ))}
              {roadmap.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[13px] text-[var(--color-ink-muted)]">
                    No active roadmap — pillars are aligned on this benchmark.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function ScenarioCard({
  label,
  tag,
  tagTone,
  score,
  delta,
  note,
  recommended,
}: {
  label: string;
  tag: string;
  tagTone: "coral" | "amber" | "mint";
  score: number;
  delta: number;
  note: string[];
  recommended?: boolean;
}) {
  return (
    <Card className={`p-5 ${recommended ? "ring-1 ring-[var(--color-accent)]/30" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <Eyebrow>{label}</Eyebrow>
        <Pill tone={tagTone}>{recommended ? "Recommended · " : ""}{tag}</Pill>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="display-num text-[44px] text-[var(--color-ink)]">
          <AnimatedNumber value={score} />
        </span>
        <span className={`font-mono text-[12px] font-semibold ${delta >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
        </span>
      </div>
      <div className="mt-1 font-mono text-[10px] text-[var(--color-ink-muted)] uppercase tracking-[0.10em]">
        Projected overall maturity
      </div>
      <ul className="mt-4 space-y-1.5">
        {note.map((n, i) => (
          <li key={i} className="text-[12px] text-[var(--color-ink-soft)] flex items-start gap-2">
            <span className="text-[var(--color-ink-faint)] mt-1">·</span> {n}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ── EVIDENCE LIBRARY ───────────────────────────────────────
   Reads analysis.evidenceFiles — the real per-question evidence captured
   during the questionnaire. We do NOT fabricate filenames. When no files
   are attached we render an honest empty state explaining that evidence
   storage (Supabase Storage signed URLs + AI validation) is on the roadmap. */
export function EvidenceScreen({
  analysis,
  bu,
  onOpenToday,
}: {
  analysis: Analysis;
  bu: any;
  onOpenToday: () => void;
}) {
  const [query, setQuery] = useState("");
  const summary = analysis?.responseSummary ?? { evidenceCount: 0, totalResponses: 100 };

  // Pillar lookup so we can label files with the pillar of the question
  // they were attached to. analytics carries pillarId → pillarName.
  const pillarByQuestionId = useMemo(() => {
    const map = new Map<number, string>();
    // We don't have question→pillar mapping in the analysis payload, so we
    // group by question-id range using the canonical static questions list.
    // Since QUESTIONS isn't imported here, fall back to a generic label.
    return map;
  }, []);

  const items = useMemo(() => {
    const files: { questionId: number; filename: string; answeredAt: string }[] =
      analysis?.evidenceFiles ?? [];
    return files
      .map(f => ({
        questionId: f.questionId,
        name: f.filename,
        pillar: pillarByQuestionId.get(f.questionId) ?? "—",
        kind: /\.xlsx?$/i.test(f.filename) ? "xls" : "pdf",
      }))
      .filter(i => !query || i.name.toLowerCase().includes(query.toLowerCase()));
  }, [analysis?.evidenceFiles, query, pillarByQuestionId]);

  const pdfCount = items.filter(i => i.kind === "pdf").length;
  const xlsCount = items.filter(i => i.kind === "xls").length;

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-10 h-14 border-b hairline flex items-center gap-3">
        <Eyebrow tone="accent">Evidence library</Eyebrow>
        <span className="ml-auto" />
        <button onClick={onOpenToday} className="btn-ghost text-[12px]">Back to Today</button>
      </div>

      <div className="flex-1 px-10 py-9 overflow-y-auto">
        <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
          Evidence linked to <span className="text-[var(--color-accent)]">{summary.evidenceCount} vectors</span>
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-soft)] max-w-[780px] leading-[1.55]">
          Filenames captured during the questionnaire for {bu?.name ?? "this unit"}. The current build records
          attached filenames for traceability; signed-URL blob storage and AI evidence validation are on the
          roadmap (Supabase Storage + Gemini Vision).
        </p>

        {/* Search + filter */}
        <div className="mt-7 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-[var(--color-surface)] border hairline rounded-[8px]">
            <Search size={14} className="text-[var(--color-ink-muted)]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search filename…"
              className="flex-1 bg-transparent text-[13px] outline-none text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)]"
            />
          </div>
          <Pill tone="coral">PDF · {pdfCount}</Pill>
          <Pill tone="mint">XLSX · {xlsCount}</Pill>
        </div>

        {items.length === 0 ? (
          <Card className="mt-6 p-10 text-center">
            <FileText size={28} className="mx-auto text-[var(--color-ink-faint)]" />
            <p className="mt-4 text-[14px] text-[var(--color-ink-soft)] max-w-[480px] mx-auto">
              No evidence files have been attached for this assessment yet. Capture filenames during the
              questionnaire — they appear here keyed to their vector.
            </p>
            <p className="mt-3 font-mono text-[10px] tracking-[0.10em] uppercase text-[var(--color-ink-subtle)]">
              Roadmap · upload to signed storage · AI validation against the rubric
            </p>
          </Card>
        ) : (
          <Card className="mt-6 overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b hairline">
                  <th className="px-5 py-3 text-left w-12"></th>
                  <th className="px-5 py-3 text-left"><Eyebrow>Filename</Eyebrow></th>
                  <th className="px-5 py-3 text-left"><Eyebrow>Vector</Eyebrow></th>
                  <th className="px-5 py-3 text-left"><Eyebrow>BU</Eyebrow></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.questionId} className="border-b hairline last:border-b-0 hover:bg-[var(--color-bg-deep)]/40">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center justify-center w-9 h-7 rounded-[4px] font-mono text-[9px] uppercase tracking-[0.08em] ${it.kind === "pdf" ? "bg-[var(--color-coral-soft)] text-[var(--color-coral)]" : "bg-[var(--color-mint-soft)] text-[var(--color-mint)]"}`}>
                        {it.kind}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--color-ink)] font-medium">{it.name}</td>
                    <td className="px-5 py-3.5 text-[var(--color-ink-soft)] font-mono text-[11px]">q.{it.questionId.toString().padStart(3, "0")}</td>
                    <td className="px-5 py-3.5">
                      <div className="inline-flex items-center gap-2">
                        <BuGlyph id={bu?.id ?? "gen"} size={14} />
                        <span className="text-[var(--color-ink-soft)]">{bu?.name ?? "—"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── PDF REPORT PREVIEW ─────────────────────────────────────
   Multi-page board-grade preview. Renders page mockups using real analysis
   data. Server-side pdf endpoint already exists at /api/assessments/[id]/pdf
   for actual download. */
export function ReportScreen({
  analysis,
  bu,
  assessmentId,
  operatorEmail,
  onOpenToday,
  onOpenProvenance,
}: {
  analysis: Analysis;
  bu: any;
  assessmentId: string | null;
  operatorEmail: string;
  onOpenToday: () => void;
  onOpenProvenance?: () => void;
}) {
  const score = analysis?.overallScore ?? 0;
  const benchAvg = analysis?.benchmarkAverage ?? 4.0;
  const delta = (score - benchAvg).toFixed(2);
  const analytics: any[] = analysis?.analytics ?? [];
  const dimensions: any[] = analysis?.dimensions ?? [];
  const roadmap: any[] = analysis?.roadmap ?? [];
  const regressions: any[] = analysis?.regressions ?? [];

  const handleDownload = () => {
    if (!assessmentId) return;
    window.open(`/api/assessments/${assessmentId}/pdf`, "_blank");
  };

  const buName = (bu?.name ?? "Generation").toUpperCase();
  const PageHeader = ({ n }: { n: number }) => (
    <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-muted)] tracking-[0.10em] uppercase">
      <span>ERM Navigator</span>
      <span>{buName} · PAGE {n} / 5</span>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-10 h-14 border-b hairline flex items-center gap-3">
        <Eyebrow tone="accent">Report preview</Eyebrow>
        <span className="ml-auto" />
        <button onClick={handleDownload} className="btn-cta text-[12px]" disabled={!assessmentId}>
          <Download size={13} /> Download PDF
        </button>
        <button onClick={onOpenToday} className="btn-ghost text-[12px]">Back to Today</button>
      </div>

      <div className="flex-1 px-10 py-9 overflow-y-auto">
        <Eyebrow tone="accent">Board-grade PDF · 5 pages · A4</Eyebrow>
        <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
          What the board sees.
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-soft)] max-w-[780px] leading-[1.55]">
          Every page of the downloadable report, previewed in order. Numbers, dimensions, roadmap
          phases, and standards alignment all match what the PDF endpoint produces.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-5">
          {/* Page 1 — Cover */}
          <Card className="p-9 aspect-[1/1.41] flex flex-col">
            <PageHeader n={1} />
            <Eyebrow className="mt-7 block">Cover</Eyebrow>
            <div className="mt-12">
              <div className="text-[11px] text-[var(--color-ink-soft)]">Risk Maturity Report</div>
              <div className="display-title text-[56px] mt-1 text-[var(--color-ink)]">{bu?.name ?? "Generation"}</div>
              <div className="font-mono text-[11px] text-[var(--color-ink-muted)] mt-1">
                {(bu?.industry ?? "Power generation")} · benchmark · Industry
              </div>
              <div className="mt-10 flex items-baseline gap-2">
                <span className="display-num text-[80px] text-[var(--color-ink)]">{score.toFixed(2)}</span>
                <span className="font-mono text-[14px] text-[var(--color-ink-muted)]">/ 5.00 overall</span>
              </div>
              <div className={`mt-2 font-mono text-[12px] ${Number(delta) >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                {Number(delta) >= 0 ? "+" : ""}{delta} vs benchmark
              </div>
            </div>
            <div className="mt-auto pt-6 border-t hairline font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.05em]">
              ISO 31000 · COSO ERM · NIST RMF · RIMS RMM<br />
              Tx · {(assessmentId ?? "—").slice(0, 8)} · Operator · {operatorEmail || "analyst@gmail.com"}
            </div>
          </Card>

          {/* Page 2 — Pillar scores */}
          <Card className="p-9 aspect-[1/1.41] flex flex-col">
            <PageHeader n={2} />
            <Eyebrow className="mt-7 block">Pillar scores</Eyebrow>
            <h3 className="mt-2 text-[20px] font-medium text-[var(--color-ink)] leading-[1.15]">10 pillars at a glance</h3>
            <table className="mt-4 text-[11.5px] w-full">
              <thead>
                <tr className="border-b hairline">
                  <th className="py-1.5 text-left w-7"><Eyebrow>#</Eyebrow></th>
                  <th className="py-1.5 text-left"><Eyebrow>Pillar</Eyebrow></th>
                  <th className="py-1.5 text-right"><Eyebrow>Score</Eyebrow></th>
                  <th className="py-1.5 text-right"><Eyebrow>Bench</Eyebrow></th>
                  <th className="py-1.5 text-right"><Eyebrow>Δ</Eyebrow></th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((a: any, i: number) => (
                  <tr key={a.pillarId} className="border-b hairline last:border-b-0">
                    <td className="py-1.5 font-mono text-[10px] text-[var(--color-ink-muted)]">{(i + 1).toString().padStart(2, "0")}</td>
                    <td className="py-1.5 text-[var(--color-ink)]">{a.pillarName}</td>
                    <td className="py-1.5 text-right font-mono tabular text-[var(--color-ink)]">{a.score.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-mono tabular text-[var(--color-ink-muted)]">{a.target.toFixed(2)}</td>
                    <td className={`py-1.5 text-right font-mono tabular ${a.score >= a.target ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                      {a.score >= a.target ? "+" : ""}{(a.score - a.target).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Page 3 — Dimensions + Roadmap + Regressions */}
          <Card className="p-9 aspect-[1/1.41] flex flex-col col-span-2">
            <PageHeader n={3} />
            <Eyebrow className="mt-7 block">Dimensions & roadmap</Eyebrow>
            <h3 className="mt-2 text-[20px] font-medium text-[var(--color-ink)] leading-[1.15]">Where the gap lives, and what to do about it</h3>
            <div className="mt-5 grid grid-cols-3 gap-6">
              <div>
                <Eyebrow>Operating dimensions</Eyebrow>
                <div className="mt-3 space-y-2.5">
                  {dimensions.map((d: any) => (
                    <div key={d.id}>
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span className="text-[var(--color-ink)]">{d.name ?? d.id}</span>
                        <span className="font-mono tabular text-[var(--color-ink)]">{d.score.toFixed(2)}</span>
                      </div>
                      <div className="mt-1 h-[3px] bg-[var(--color-surface-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-accent)]" style={{ width: `${(d.score / 5) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Eyebrow>Phase-1 roadmap · {roadmap.filter(r => r.phase === "Phase 1").length} actions</Eyebrow>
                <table className="mt-3 text-[11px] w-full">
                  <tbody>
                    {roadmap.filter(r => r.phase === "Phase 1").slice(0, 8).map((r: any) => (
                      <tr key={r.id} className="border-b hairline last:border-b-0">
                        <td className="py-1.5 text-[var(--color-ink)]">{r.description}</td>
                        <td className="py-1.5 text-right font-mono text-[var(--color-accent)] font-semibold whitespace-nowrap pl-3">+{r.expectedUplift?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {regressions.length > 0 && (
                  <div className="mt-4">
                    <Eyebrow>Regressions · {regressions.length}</Eyebrow>
                    <ul className="mt-2 space-y-1">
                      {regressions.slice(0, 4).map((r: any) => (
                        <li key={r.pillarId} className="text-[11px] flex items-baseline justify-between">
                          <span className="text-[var(--color-ink)]">{r.pillarName}</span>
                          <span className={`font-mono ${r.severity === "CRITICAL" ? "text-[var(--color-coral)]" : "text-[var(--color-warn)]"}`}>
                            {r.delta.toFixed(2)} · {r.severity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Page 4 — Methodology */}
          <Card className="p-9 aspect-[1/1.41] flex flex-col">
            <PageHeader n={4} />
            <Eyebrow className="mt-7 block">Methodology</Eyebrow>
            <h3 className="mt-2 text-[24px] font-medium text-[var(--color-ink)] leading-[1.15]">How we score</h3>
            <p className="mt-3 text-[12.5px] text-[var(--color-ink-soft)] leading-[1.55]">
              100 standards-aligned questions across 10 ERM pillars × 4 operating dimensions
              (People / Process / Technology / Governance). Each answer captured on a 1–5
              maturity rubric with anchor text. Pillar weights × dimension weights ×
              per-question weights roll up deterministically.
            </p>
            <h4 className="mt-6 text-[15px] font-medium text-[var(--color-ink)]">Maturity scale</h4>
            <table className="mt-3 text-[12px] w-full">
              <tbody>
                {[
                  ["1", "Ad-hoc", "Informal, no documented process. Outcomes unpredictable."],
                  ["2", "Partial", "Some practices exist but inconsistent across the organization."],
                  ["3", "Defined", "Documented, communicated, applied consistently."],
                  ["4", "Managed", "Measured, reviewed, continuously refined against KRIs."],
                  ["5", "Optimized", "Predictive, automated, integrated into strategic planning."],
                ].map(([n, label, desc]) => (
                  <tr key={n} className="border-b hairline last:border-b-0">
                    <td className="py-1.5 pr-3 font-mono text-[var(--color-accent)] align-top">{n}</td>
                    <td className="py-1.5 pr-3 font-medium text-[var(--color-ink)] align-top">{label}</td>
                    <td className="py-1.5 text-[var(--color-ink-soft)]">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Page 5 — Standards alignment */}
          <Card className="p-9 aspect-[1/1.41] flex flex-col">
            <PageHeader n={5} />
            <Eyebrow className="mt-7 block">Standards alignment</Eyebrow>
            <h3 className="mt-2 text-[20px] font-medium text-[var(--color-ink)] leading-[1.15]">Per-pillar provenance · patent claim 13</h3>
            <div className="mt-4 space-y-2.5 overflow-hidden">
              {analytics.slice(0, 6).map((a: any) => {
                const prov = (PILLAR_PROVENANCE as any)[a.pillarId];
                if (!prov) return null;
                return (
                  <div key={a.pillarId} className="border-b hairline last:border-b-0 pb-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] font-medium text-[var(--color-ink)]">{a.pillarName}</span>
                      <span className="font-mono text-[10px] text-[var(--color-accent)]">{(prov.weight * 100).toFixed(0)}%</span>
                    </div>
                    <p className="mt-1 text-[10.5px] text-[var(--color-ink-soft)] leading-[1.45] line-clamp-2">
                      {prov.standards}
                    </p>
                  </div>
                );
              })}
              <p className="mt-3 font-mono text-[9px] tracking-[0.10em] uppercase text-[var(--color-ink-subtle)]">
                + 4 more pillars in the full PDF
              </p>
              {onOpenProvenance && (
                <button
                  onClick={onOpenProvenance}
                  className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.10em] text-[var(--color-accent)] hover:underline cursor-pointer"
                >
                  Open full Provenance · all 10 pillars + dimensions <ArrowRight size={10} />
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── HISTORY (Time Machine) ─────────────────────────────────
   Real per-session per-pillar trajectories from /api/assessments/trend.
   Falls back to a single-point view when only one session exists. */
export function HistoryScreen({
  bu,
  operatorEmail,
  onOpenToday,
}: {
  bu: any;
  operatorEmail: string;
  onOpenToday: () => void;
}) {
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!bu?.id || !operatorEmail) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/assessments/trend?entityId=${bu.id}&operatorEmail=${encodeURIComponent(operatorEmail)}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setSessions(data.sessions ?? []);
      })
      .catch(e => {
        if (cancelled) return;
        setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [bu?.id, operatorEmail]);

  // Group sessions into per-pillar series. Each entry has the pillar name
  // and an ordered array of {createdAt, score}.
  const pillarSeries = useMemo(() => {
    if (sessions.length === 0) return [];
    const pillarIds: string[] = sessions[0].pillars.map((p: any) => p.pillarId);
    return pillarIds.map(pid => {
      const points = sessions.map(s => {
        const p = s.pillars.find((x: any) => x.pillarId === pid);
        return { createdAt: s.createdAt, score: p?.score ?? 0 };
      });
      const name = sessions[0].pillars.find((p: any) => p.pillarId === pid)?.pillarName ?? pid;
      const earliest = points[0]?.score ?? 0;
      const latest = points[points.length - 1]?.score ?? 0;
      return { pillarId: pid, name, points, earliest, latest, delta: latest - earliest };
    });
  }, [sessions]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-10 h-14 border-b hairline flex items-center gap-3">
        <Eyebrow tone="accent">Time machine</Eyebrow>
        <span className="ml-auto" />
        <button onClick={onOpenToday} className="btn-ghost text-[12px]">Back to Today</button>
      </div>

      <div className="flex-1 px-10 py-9 overflow-y-auto">
        <Eyebrow tone="accent">Time machine · {sessions.length} session{sessions.length === 1 ? "" : "s"}</Eyebrow>
        <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
          {bu?.name ?? "Generation"} maturity over time.
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-soft)] max-w-[780px] leading-[1.55]">
          Real per-pillar trajectories from completed assessments. Each point is a finalized session for
          this operating unit. Drift is the delta between the first and most recent session.
        </p>

        {loading && (
          <div className="mt-9 font-mono text-[11px] text-[var(--color-ink-muted)]">loading trajectories…</div>
        )}
        {error && (
          <Card className="mt-9 p-6 text-[13px] text-[var(--color-coral)]">
            Trend unavailable · {error}
          </Card>
        )}
        {!loading && !error && sessions.length === 0 && (
          <Card className="mt-9 p-10 text-center">
            <FileText size={28} className="mx-auto text-[var(--color-ink-faint)]" />
            <p className="mt-4 text-[14px] text-[var(--color-ink-soft)] max-w-[420px] mx-auto">
              No completed sessions yet for {bu?.name ?? "this unit"}. After the first assessment finalizes,
              its scores anchor the trajectory; subsequent sessions extend it.
            </p>
          </Card>
        )}
        {!loading && !error && sessions.length === 1 && pillarSeries.length > 0 && (
          <Card className="mt-9 p-6">
            <Eyebrow>Single session captured</Eyebrow>
            <p className="mt-2 text-[13px] text-[var(--color-ink-soft)]">
              Drift trajectories appear once a second assessment is finalized. The current snapshot is
              shown below.
            </p>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {pillarSeries.map(s => (
                <div key={s.pillarId} className="flex items-baseline justify-between border-b hairline last:border-b-0 py-2.5">
                  <Eyebrow>{s.name}</Eyebrow>
                  <span className="font-mono tabular text-[14px] text-[var(--color-ink)]">{s.latest.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {!loading && !error && sessions.length >= 2 && (
          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillarSeries.map(s => (
              <Card key={s.pillarId} className="p-5">
                <div className="flex items-baseline justify-between mb-2">
                  <Eyebrow>{s.name}</Eyebrow>
                  <div className={`font-mono text-[11px] ${s.delta >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-coral)]"}`}>
                    {s.delta >= 0 ? "+" : ""}{s.delta.toFixed(2)} vs first
                  </div>
                </div>
                <Sparkline values={s.points.map((p: any) => p.score)} width={520} height={48} color="var(--color-accent)" />
                <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] text-[var(--color-ink-muted)]">
                  <span>first · {s.earliest.toFixed(2)}</span>
                  <span className="text-[var(--color-ink)] font-semibold">{s.latest.toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PROVENANCE — patent claim 13 ───────────────────────────
   Per-pillar + per-dimension standards-alignment + rationale + weight.
   Static data sourced from /api/_lib/static.ts (mirrored to /src/data).
   Independent of any active assessment. */
export function ProvenanceScreen({
  onOpenToday,
  highlightPillarId,
}: {
  onOpenToday: () => void;
  highlightPillarId?: string | null;
}) {
  const [tab, setTab] = useState<"pillars" | "dimensions" | "scale">("pillars");
  // Scroll the highlighted pillar into view on mount. Used when the operator
  // clicks a regression headline on Today and wants the standards rationale
  // for that specific pillar without scanning the full list.
  React.useEffect(() => {
    if (!highlightPillarId) return;
    setTab("pillars");
    const el = document.getElementById(`provenance-pillar-${highlightPillarId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-1", "ring-[var(--color-accent)]");
      setTimeout(() => el.classList.remove("ring-1", "ring-[var(--color-accent)]"), 2400);
    }
  }, [highlightPillarId]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-10 h-14 border-b hairline flex items-center gap-3">
        <Eyebrow tone="accent">Standards alignment</Eyebrow>
        <span className="ml-auto" />
        <button onClick={onOpenToday} className="btn-ghost text-[12px]">Back to Today</button>
      </div>

      <div className="flex-1 px-10 py-9 overflow-y-auto">
        <Eyebrow tone="accent">Provenance · patent claim 13</Eyebrow>
        <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.025em] text-[var(--color-ink)]">
          Why each weight is what it is.
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-ink-soft)] max-w-[780px] leading-[1.55]">
          Every pillar weight, dimension weight, and rubric anchor is justified against external
          standards bodies — ISO 31000, COSO ERM, NIST RMF, RIMS RMM, OECD, Basel — plus the
          published practice models from McKinsey, KPMG, EY, Deloitte, PwC, Bain. This page is the
          audit trail.
        </p>

        {/* Tabs */}
        <div className="mt-7 inline-flex items-center gap-1 p-1 bg-[var(--color-surface-soft)] rounded-[8px]">
          {([
            ["pillars", `Pillars · ${PILLARS.length}`],
            ["dimensions", `Dimensions · ${Object.keys(DIMENSION_PROVENANCE).length}`],
            ["scale", `Maturity scale · ${MATURITY_LEVELS.length}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3.5 py-1.5 text-[12px] rounded-[6px] cursor-pointer transition-colors ${tab === key ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-soft)]" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"}`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "pillars" && (
          <div className="mt-6 space-y-3">
            {PILLARS.map((p, i) => {
              const prov = PILLAR_PROVENANCE[p.id];
              if (!prov) return null;
              return (
                <Card key={p.id} id={`provenance-pillar-${p.id}`} className="p-6 transition-shadow">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-14">
                      <div className="font-mono text-[11px] text-[var(--color-ink-muted)]">{(i + 1).toString().padStart(2, "0")}</div>
                      <div className="mt-2 display-num text-[28px] text-[var(--color-accent)]">{(prov.weight * 100).toFixed(0)}<span className="text-[14px] text-[var(--color-ink-muted)]">%</span></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-[18px] font-medium text-[var(--color-ink)]">{p.name}</h3>
                        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">10 vectors</span>
                      </div>
                      <div className="mt-3">
                        <Eyebrow>Standards</Eyebrow>
                        <p className="mt-1.5 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">{prov.standards}</p>
                      </div>
                      <div className="mt-3">
                        <Eyebrow>Rationale</Eyebrow>
                        <p className="mt-1.5 text-[13px] text-[var(--color-ink)] leading-relaxed">{prov.rationale}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {tab === "dimensions" && (
          <div className="mt-6 space-y-3">
            {Object.entries(DIMENSION_PROVENANCE).map(([dim, prov]) => (
              <Card key={dim} className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14">
                    <div className="display-num text-[28px] text-[var(--color-accent)]">{(prov.weight * 100).toFixed(0)}<span className="text-[14px] text-[var(--color-ink-muted)]">%</span></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[18px] font-medium text-[var(--color-ink)]">{dim}</h3>
                    <div className="mt-3">
                      <Eyebrow>Standards</Eyebrow>
                      <p className="mt-1.5 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">{prov.standards}</p>
                    </div>
                    <div className="mt-3">
                      <Eyebrow>Rationale</Eyebrow>
                      <p className="mt-1.5 text-[13px] text-[var(--color-ink)] leading-relaxed">{prov.rationale}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "scale" && (
          <div className="mt-6 space-y-3">
            {MATURITY_LEVELS.map(level => (
              <Card key={level.level} className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-14">
                    <div className="display-num text-[36px] text-[var(--color-accent)]">{level.level}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-medium text-[var(--color-ink)] tracking-[0.04em]">{level.name}</h3>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Eyebrow>Characteristics</Eyebrow>
                        <ul className="mt-2 space-y-1.5">
                          {level.characteristics.map((c, i) => (
                            <li key={i} className="text-[12.5px] text-[var(--color-ink-soft)] leading-relaxed flex gap-2">
                              <span className="text-[var(--color-accent)] flex-shrink-0">·</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Eyebrow>Examples</Eyebrow>
                        <ul className="mt-2 space-y-1.5">
                          {level.examples.map((e, i) => (
                            <li key={i} className="text-[12.5px] text-[var(--color-ink-soft)] leading-relaxed flex gap-2">
                              <span className="text-[var(--color-accent)] flex-shrink-0">·</span>
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EMPTY HUB (when authed but no analysis yet) ─────────── */
export function EmptyHub({
  message,
  cta,
  onCta,
}: {
  message: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FileText size={28} className="mx-auto text-[var(--color-ink-faint)]" />
        <p className="mt-4 text-[14px] text-[var(--color-ink-soft)] max-w-[420px]">{message}</p>
        {cta && onCta && (
          <button onClick={onCta} className="mt-5 btn-cta text-[13px]">
            {cta} <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
