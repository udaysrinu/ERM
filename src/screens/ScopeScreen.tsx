import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BuGlyph, Eyebrow, Pill } from "../components/primitives";
import { BU_TINTS } from "../lib/bu-tints";

/*
 * Operating-scope picker. D+ pastel-tile mosaic — each BU rendered as a
 * card with last-known overallScore (pulled from the operator's history)
 * and a status pill (On benchmark / Drifting / Critical / No data).
 * Below the mosaic: archive list of past sessions.
 */
export function ScopeScreen({
  entities,
  onSelect,
  history,
  historyLoading,
  onOpenHistorical,
}: {
  entities: any[];
  onSelect: (bu: any) => void;
  operatorEmail: string;
  onLogout: () => void;
  history: any[];
  historyLoading: boolean;
  onOpenHistorical: (item: any) => void;
}) {
  // Latest session per entityId wins; missing → "no data".
  const latestByBu = new Map<string, any>();
  for (const item of history ?? []) {
    if (!latestByBu.has(item.entityId)) latestByBu.set(item.entityId, item);
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <Eyebrow tone="accent">Operating scope</Eyebrow>
          <h1
            className="mt-3 text-[44px] font-medium leading-[1.05] tracking-[-0.028em] text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Choose the unit to measure.
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-ink-soft)] leading-[1.55] max-w-[680px]">
            Every operating unit runs a 100-vector assessment and rolls up into a weighted pillar–dimension matrix. Results are benchmarked against Target, Industry, Peer, and External reference profiles.
          </p>

          <div className="mt-6 flex items-center gap-6 flex-wrap text-[12.5px]">
            {[
              { k: "Units", v: String(entities.length) },
              { k: "Vectors per unit", v: "100" },
              { k: "Pillars × dimensions", v: "10 × 4" },
              { k: "Benchmark profiles", v: "4" },
            ].map(p => (
              <div key={p.k} className="flex items-baseline gap-2">
                <span className="text-[15px] font-medium tabular text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>{p.v}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">{p.k}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((bu, idx) => {
            const t = BU_TINTS[bu.id] ?? { tint: 'var(--color-bg-deep)', dot: 'var(--color-ink)' };
            const last = latestByBu.get(bu.id);
            const score = last && typeof last.overallScore === "number" ? last.overallScore : null;
            const ageDays = last
              ? Math.floor((Date.now() - new Date(last.createdAt).getTime()) / 86400000)
              : null;
            const status: "ok" | "warn" | "crit" | "empty" =
              score === null ? "empty" :
              score >= 3.5 ? "ok" :
              score >= 3.0 ? "warn" : "crit";
            const statusLabel = status === "ok" ? "On benchmark" :
                                status === "warn" ? "Drifting" :
                                status === "crit" ? "Critical" : "No data";
            const statusTone = status === "ok" ? "mint" : status === "warn" ? "amber" : status === "crit" ? "coral" : "ink";

            return (
              <motion.button
                key={bu.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => onSelect(bu)}
                className="group relative text-left bg-[var(--color-surface)] border hairline rounded-[10px] overflow-hidden hover:border-[var(--color-ink)] cursor-pointer transition-colors"
                style={{ minHeight: 168 }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[8px]"
                  style={{ background: t.tint }}
                  aria-hidden
                />
                <div className="p-5 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-flex items-center justify-center flex-shrink-0"
                        style={{ width: 32, height: 32, borderRadius: 7, background: t.tint, color: t.dot }}
                      >
                        <BuGlyph id={bu.id} size={16} />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
                          {bu.id}
                        </span>
                      </div>
                    </div>
                    <Pill tone={statusTone as any}>{statusLabel}</Pill>
                  </div>

                  <div className="mt-3.5">
                    <h3
                      className="text-[20px] font-medium leading-[1.15] tracking-[-0.012em] text-[var(--color-ink)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {bu.name}
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)] truncate">
                      {bu.industry}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t hairline flex items-end justify-between">
                    <div>
                      {score !== null ? (
                        <>
                          <div className="text-[24px] font-medium tabular text-[var(--color-ink)] leading-none" style={{ fontFamily: 'var(--font-sans)' }}>
                            {score.toFixed(2)}
                          </div>
                          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                            {ageDays === 0 ? "today" : ageDays === 1 ? "1d ago" : `${ageDays}d ago`}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[15px] text-[var(--color-ink-subtle)] italic" style={{ fontFamily: 'var(--font-wordmark)' }}>
                            Not yet assessed
                          </div>
                          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)]">
                            100 vectors ready
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                      <span className="font-mono text-[10px] uppercase tracking-[0.06em]">
                        {score !== null ? "Open" : "Begin"}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="ease-premium transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-12">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[18px] font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Past sessions
            </h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
              {historyLoading
                ? "loading…"
                : history.length === 0
                  ? "no sessions yet"
                  : `${history.length} session${history.length === 1 ? "" : "s"} · newest first`}
            </div>
          </div>

          {historyLoading ? (
            <div className="border-t border-b hairline py-10 text-center">
              <p className="text-[13px] text-[var(--color-ink-muted)]">Retrieving your past sessions…</p>
            </div>
          ) : history.length === 0 ? (
            <div className="border-t border-b hairline py-10 px-5 flex items-start gap-5">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="flex-shrink-0 mt-1" aria-hidden>
                <rect x="6" y="8" width="28" height="24" rx="2" stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" />
                <path d="M6 14 L34 14" stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" />
                <path d="M12 20 L28 20 M12 24 L24 24" stroke="var(--color-ink-muted)" strokeWidth="1" />
              </svg>
              <div className="flex-1">
                <p className="text-[16px] font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  A blank page, for now.
                </p>
                <p className="mt-1.5 text-[13px] text-[var(--color-ink-soft)] leading-[1.55] max-w-[560px]">
                  Your completed assessments will stamp here — each one with its score, operating unit, and a transaction ID. Complete an assessment above to begin your archive and unlock drift detection across future runs.
                </p>
              </div>
            </div>
          ) : (
            <div className="border-t hairline">
              {history.slice(0, 8).map(item => {
                const d = new Date(item.createdAt);
                const when = d.toLocaleString(undefined, {
                  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
                });
                const score = typeof item.overallScore === "number" ? item.overallScore.toFixed(2) : "—";
                const t = BU_TINTS[item.entityId] ?? { tint: 'var(--color-bg-deep)', dot: 'var(--color-ink)' };
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenHistorical(item)}
                    className="w-full border-b hairline py-3.5 px-3 flex items-center gap-5 text-left group cursor-pointer hover:bg-[var(--color-bg-deep)]/60 transition-colors"
                  >
                    <span
                      className="inline-flex items-center justify-center flex-shrink-0"
                      style={{ width: 30, height: 30, borderRadius: 7, background: t.tint, color: t.dot }}
                    >
                      <BuGlyph id={item.entityId} size={14} />
                    </span>
                    <div className="w-[60px] flex-shrink-0">
                      <div className="text-[20px] font-medium tabular text-[var(--color-ink)] leading-none" style={{ fontFamily: 'var(--font-sans)' }}>
                        {score}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[14px] font-medium text-[var(--color-ink)] truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                          {item.entityName}
                        </span>
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
                          {item.entityId}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10.5px] text-[var(--color-ink-muted)]">
                        {when} · <span className="tracking-wide">{item.id}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                      <span>Open</span>
                      <ArrowUpRight size={12} className="ease-premium transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </button>
                );
              })}
              {history.length > 8 && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-ink-subtle)]">
                  showing 8 of {history.length} · older entries available via the command palette
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
