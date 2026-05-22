import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Upload } from "lucide-react";
import {
  BuGlyph,
  Card,
  Eyebrow,
  Keycap,
  Metric,
  Pill,
} from "../components/primitives";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";

/*
 * 100-vector questionnaire. Two layouts in one component:
 *
 *  1. Question view — pillar-progress rail on the left, question card +
 *     5-button maturity rubric + analyst note + evidence upload on the right.
 *  2. Summary view — per-pillar coverage cards + finalize button. Renders
 *     when showSummary toggles true (after the last question is answered).
 *
 * The lifted `draft` is owned by App.tsx so navigating away and back via
 * the sidebar preserves in-progress responses. Setters use functional
 * parent updates so multiple setters fired in the same handler compose
 * correctly (Codex P1 catch — earlier version closed over stale `draft`
 * and lost the score).
 */
export function VectorCapturePipeline({
  questions,
  pillars,
  bu,
  onComplete,
  onBack,
  draft,
  onDraftChange,
}: any) {
  const [currIdx, setCurrIdx] = useState(0);
  const responses: Record<number, number> = draft?.responses ?? {};
  const notes: Record<number, string> = draft?.notes ?? {};
  const evidenceNames: Record<number, string> = draft?.evidenceNames ?? {};
  const answeredAt: Record<number, string> = draft?.answeredAt ?? {};

  const setResponses = (next: Record<number, number> | ((prev: Record<number, number>) => Record<number, number>)) => {
    onDraftChange?.((prev: any) => ({
      ...prev,
      responses: typeof next === "function" ? (next as any)(prev?.responses ?? {}) : next,
    }));
  };
  const setNotes = (next: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => {
    onDraftChange?.((prev: any) => ({
      ...prev,
      notes: typeof next === "function" ? (next as any)(prev?.notes ?? {}) : next,
    }));
  };
  const setEvidenceNames = (next: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => {
    onDraftChange?.((prev: any) => ({
      ...prev,
      evidenceNames: typeof next === "function" ? (next as any)(prev?.evidenceNames ?? {}) : next,
    }));
  };
  const setAnsweredAt = (next: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => {
    onDraftChange?.((prev: any) => ({
      ...prev,
      answeredAt: typeof next === "function" ? (next as any)(prev?.answeredAt ?? {}) : next,
    }));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Resume cursor at the first unanswered question on remount.
  useEffect(() => {
    if (Object.keys(responses).length === 0) return;
    const firstUnanswered = questions.findIndex((q: any) => responses[q.id] === undefined);
    if (firstUnanswered >= 0) setCurrIdx(firstUnanswered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = questions[currIdx];
  const currentPillar = pillars.find((p: any) => p.id === currentQ?.pillarId);
  const progress = (Object.keys(responses).length / questions.length) * 100;
  const isAnswered = responses[currentQ?.id] !== undefined;
  const allAnswered = Object.keys(responses).length === questions.length;
  const noteCount = Object.values(notes).filter(Boolean).length;
  const evidenceCount = Object.values(evidenceNames).filter(Boolean).length;

  const pillarsProgress = useMemo(() => {
    return pillars.map((p: any) => {
      const pQs = questions.filter((q: any) => q.pillarId === p.id);
      const answered = pQs.filter((q: any) => responses[q.id] !== undefined).length;
      return { ...p, answered, total: pQs.length };
    });
  }, [pillars, questions, responses]);

  const handleAnswer = (score: number) => {
    const ts = new Date().toISOString();
    setResponses(prev => ({ ...prev, [currentQ.id]: score }));
    setAnsweredAt(prev => ({ ...prev, [currentQ.id]: ts }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({ responses, notes, evidenceNames, answeredAt });
    } catch {
      alert("Assessment submission failed. Please verify all required responses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSummary) {
    return (
      <div className="min-h-screen">
        <div className="px-10 h-14 border-b hairline flex items-center gap-3 bg-[var(--color-bg)]">
          <BuGlyph id={bu.id} size={16} />
          <span className="text-[14px] font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
            {bu.name}
          </span>
          <span className="font-mono text-[11px] text-[var(--color-ink-muted)]">· {bu.industry || ''}</span>
          <span className="h-[18px] w-px bg-[var(--color-border)] mx-1" />
          <Eyebrow tone="accent">Summary</Eyebrow>
        </div>
        <div className="max-w-[1100px] mx-auto px-10 py-10">
          <Eyebrow tone="accent">All vectors captured</Eyebrow>
          <h1
            className="mt-3 text-[36px] font-medium leading-[1.1] tracking-[-0.022em] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Ready to finalize.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-ink-soft)] max-w-[640px] leading-[1.55]">
            Review coverage below. Finalizing triggers the scoring engine, drift detection, and roadmap sequencer in turn.
          </p>

          <div className="mt-8 mb-5 flex items-baseline justify-between">
            <h2 className="text-[16px] font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Per-pillar coverage
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
              10 pillars · 100 vectors
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
            {pillarsProgress.map((p: any) => {
              const complete = p.answered === p.total;
              return (
                <Card
                  key={p.id}
                  severity={complete ? "mint" : "coral"}
                  className="p-5 flex items-center justify-between"
                >
                  <div>
                    <Eyebrow>{p.name}</Eyebrow>
                    <p className="mt-2 font-mono text-[14px] text-[var(--color-ink)]">
                      {p.answered} / {p.total}
                      <span className="text-[var(--color-ink-muted)]"> vectors</span>
                    </p>
                  </div>
                  {complete ? (
                    <CheckCircle2 size={20} className="text-[var(--color-mint)]" />
                  ) : (
                    <AlertCircle size={20} className="text-[var(--color-coral)]" />
                  )}
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-10">
            <Card className="p-5">
              <Metric label="Analyst notes" value={noteCount} unit="entries" size="md" />
            </Card>
            <Card className="p-5">
              <Metric label="Evidence linked" value={evidenceCount} unit="files" size="md" />
            </Card>
            <Card className="p-5">
              <Metric label="Vectors total" value={Object.keys(responses).length} unit="/ 100" size="md" tone="amber" />
            </Card>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowSummary(false)} className="btn-ghost flex-1 flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Revise responses
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="btn-cta flex-1"
            >
              {isSubmitting ? "Computing maturity vector…" : "Compute & finalize"}
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[288px] border-r hairline bg-[var(--color-bg-deep)] flex flex-col">
        <div className="p-6 border-b hairline">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-mono text-[10px] uppercase tracking-[0.10em] transition-colors mb-5 cursor-pointer"
            aria-label="Back to operating scope"
          >
            <ArrowLeft size={12} /> Back to scope
          </button>
          <Eyebrow>Assessing</Eyebrow>
          <p className="text-[18px] font-medium tracking-[-0.012em] text-[var(--color-ink)] mt-2">{bu.name}</p>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <Eyebrow>Progress</Eyebrow>
              <span className="font-mono text-[11px] text-[var(--color-ink)] tabular">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-[3px] bg-[var(--color-border)] relative rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-[var(--color-gold)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--color-ink-muted)] tabular">
              <span>{Object.keys(responses).length}/100</span>
              <span>Q{currIdx + 1}/{questions.length}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <Eyebrow className="px-3 block mb-3">Pillars</Eyebrow>
          <div className="space-y-0.5">
            {pillarsProgress.map((p: any, pIdx: number) => {
              const isCurrent = currentPillar?.id === p.id;
              const pct = (p.answered / p.total) * 100;
              const complete = p.answered === p.total;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    const i = questions.findIndex((q: any) => q.pillarId === p.id);
                    if (i !== -1) setCurrIdx(i);
                  }}
                  className={`w-full px-3 py-3 text-left rounded-[8px] transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                      : "hover:bg-[var(--color-surface)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[12px] truncate ${
                        isCurrent ? "text-[var(--color-highlight)]" : "text-[var(--color-ink)]"
                      }`}
                    >
                      <span className={`font-mono text-[9px] tracking-[0.2em] mr-2 tabular ${isCurrent ? "text-[var(--color-bg)]/60" : "text-[var(--color-ink-muted)]"}`}>
                        {String(pIdx + 1).padStart(2, "0")}
                      </span>
                      {p.name}
                    </span>
                    <span className={`font-mono text-[10px] flex-shrink-0 tabular ${
                      isCurrent ? "text-[var(--color-bg)]/70" : "text-[var(--color-ink-muted)]"
                    }`}>
                      {p.answered}/{p.total}
                    </span>
                  </div>
                  <div className={`mt-2 h-[2px] rounded-full ${isCurrent ? "bg-[var(--color-bg)]/20" : "bg-[var(--color-border)]"}`}>
                    <div
                      className={`h-full rounded-full ${
                        complete ? "bg-[var(--color-mint)]" : isCurrent ? "bg-[var(--color-highlight)]" : "bg-[var(--color-ink-muted)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t hairline flex items-center justify-between font-mono text-[10px] text-[var(--color-ink-muted)] tracking-wide">
          <span>
            <Keycap>1</Keycap>–<Keycap>5</Keycap> score
          </span>
          <span>
            <Keycap>←</Keycap>
            <Keycap>→</Keycap> nav
          </span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[820px] mx-auto px-12 py-12">
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Pill tone="amber">{currentPillar?.name}</Pill>
            <Pill tone="ink">{currentQ.dimensionId}</Pill>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.10em] uppercase">
              Vector {currIdx + 1} / {questions.length}
            </span>
          </div>

          <motion.h2
            key={currentQ.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[28px] font-medium leading-[1.25] tracking-[-0.018em] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {currentQ.text}
          </motion.h2>

          <div className="mt-10">
            <Eyebrow>Maturity level · 1 Ad-hoc → 5 Optimized</Eyebrow>
            <div className="grid grid-cols-5 gap-2 mt-3.5">
              {[1, 2, 3, 4, 5].map(score => {
                const selected = responses[currentQ.id] === score;
                const labels = ["Ad-hoc", "Partial", "Defined", "Managed", "Optimized"];
                const rubricText = (currentQ as any).rubric?.[score] || "";
                const button = (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`aspect-[4/3] w-full flex flex-col items-center justify-center border rounded-[8px] transition-all cursor-pointer ${
                      selected
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] hover:-translate-y-0.5"
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)", boxShadow: selected ? 'var(--shadow-cta)' : undefined }}
                  >
                    <span className={`text-[28px] font-medium tabular ${selected ? 'text-white' : 'text-[var(--color-ink)]'}`} style={{ fontFamily: 'var(--font-sans)' }}>
                      {score}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.10em] mt-0.5 ${
                      selected ? "text-white/85" : "text-[var(--color-ink-muted)]"
                    }`}>
                      {labels[score - 1]}
                    </span>
                  </button>
                );
                return rubricText ? (
                  <UiTooltip key={score}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[320px] text-[12px] leading-[1.5] whitespace-normal">
                      {rubricText}
                    </TooltipContent>
                  </UiTooltip>
                ) : button;
              })}
            </div>
            {(currentQ as any).rubric && responses[currentQ.id] !== undefined && (
              <motion.div
                key={`rubric-${currentQ.id}-${responses[currentQ.id]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="mt-4 px-4 py-3 border-l-2 border-[var(--color-gold)] bg-[var(--color-surface-soft)]/50 rounded-r-[8px]"
              >
                <div className="font-mono text-[9px] tracking-[0.10em] uppercase text-[var(--color-gold)] mb-1.5">
                  Level {responses[currentQ.id]} criteria
                </div>
                <p className="text-[12.5px] leading-[1.6] text-[var(--color-ink-soft)]">
                  {(currentQ as any).rubric[responses[currentQ.id]]}
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Eyebrow>Analyst note</Eyebrow>
              <textarea
                value={notes[currentQ.id] || ""}
                onChange={e => setNotes(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                placeholder="Context, assumptions, control observations…"
                className="w-full mt-3 min-h-32 bg-[var(--color-surface)] border hairline focus:border-[var(--color-gold)] p-3.5 text-[14px] text-[var(--color-ink)] outline-none resize-none placeholder:text-[var(--color-ink-subtle)] rounded-[8px] transition-colors"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Eyebrow>Evidence reference</Eyebrow>
                <label className="mt-3 flex items-center justify-between gap-3 border hairline hover:border-[var(--color-gold)] px-4 py-3.5 rounded-[8px] cursor-pointer transition-colors group bg-[var(--color-surface)]">
                  <span className="text-[13px] text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)] truncate">
                    {evidenceNames[currentQ.id] || "Attach supporting file"}
                  </span>
                  <Upload size={14} className="text-[var(--color-ink)] flex-shrink-0" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      setEvidenceNames(prev => ({ ...prev, [currentQ.id]: f?.name || "" }));
                    }}
                  />
                </label>
              </div>
              <Card variant="subtle" className="p-4 space-y-2">
                <Eyebrow>Metadata</Eyebrow>
                {[
                  ["Score", isAnswered ? `${responses[currentQ.id]} / 5` : "—"],
                  ["Stamped", answeredAt[currentQ.id] ? new Date(answeredAt[currentQ.id]).toLocaleTimeString() : "pending"],
                  ["Evidence", evidenceNames[currentQ.id] ? "linked" : "none"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px]">
                    <span className="font-mono text-[var(--color-ink-muted)] tracking-wide">{k}</span>
                    <span className="text-[var(--color-ink)]">{v}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrIdx(Math.max(0, currIdx - 1))}
              disabled={currIdx === 0}
              className="btn-ghost p-3 disabled:opacity-0"
              aria-label="Previous"
            >
              <ArrowLeft size={16} />
            </button>

            {allAnswered && (
              <button onClick={() => setShowSummary(true)} className="btn-accent flex items-center gap-3">
                Review vectors <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={() => setCurrIdx(Math.min(questions.length - 1, currIdx + 1))}
              disabled={!isAnswered || currIdx === questions.length - 1}
              className="btn-ghost p-3 disabled:opacity-30"
              aria-label="Next"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
