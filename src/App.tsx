import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Command as CommandIcon,
  FileDown,
  Minimize2,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AnimatedNumber,
  BrandMark,
  BuGlyph,
  Card,
  Eyebrow,
  Keycap,
  Metric,
  Pill,
  Sparkline,
  StatusDot,
} from "./components/primitives";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "./components/ui/command";
import {
  BENCHMARKS,
  BENCHMARK_TYPES,
  BUSINESS_UNITS,
  PILLARS,
  QUESTIONS,
  WEIGHTS,
} from "./data/static";
import { getAssistantReply } from "./lib/assistant";
import { TrendChart } from "./components/TrendChart";
import {
  ActionPlanScreen,
  EvidenceScreen,
  ReportScreen,
  HistoryScreen,
  ProvenanceScreen,
  EmptyHub,
} from "./screens/AuxiliaryScreens";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────

const BENCHMARK_LABEL: Record<string, string> = {
  target: "Target",
  industry: "Industry",
  peer: "Peers",
  external: "External",
};

// Recharts theme — D+ palette: ink as primary data color, terracotta accent,
// muted blue for benchmark line, desaturated coral/mint for severity.
const CHART = {
  grid: "rgba(22, 24, 26, 0.06)",
  axis: "rgba(22, 24, 26, 0.28)",
  axisLabel: "rgba(22, 24, 26, 0.52)",
  primary: "#16181A",
  accent: "#C4542A",
  benchmark: "#2C5F8C",
  critical: "#A6442B",
  mint: "#3F7A57",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(22, 24, 26, 0.10)",
  borderRadius: 7,
  padding: "10px 14px",
  fontFamily: "Inter Tight, Inter, sans-serif",
  fontSize: "12px",
  color: "#16181A",
  boxShadow: "0 2px 4px rgba(22,24,26,.04), 0 12px 32px rgba(22,24,26,.08)",
} as const;

// ─── ASSISTANT ─────────────────────────────────────────────────────────────
// `getAssistantReply` is implemented in ./lib/assistant.ts (deterministic, testable, 15 patterns).

const NavigatorAssistant = ({ analysis }: { analysis?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Context-aware prompt chips — built from the live analysis so each
  // suggestion points at something the engine actually knows.
  const suggestions = useMemo(() => {
    const base = ["Weakest gap", "Drift status", "Top action"];
    if (!analysis) return base;
    const reg = analysis.regressions?.[0];
    const action = analysis.roadmap?.[0];
    const dynamic: string[] = [];
    if (reg) dynamic.push(`Why did ${reg.pillarName} regress?`);
    if (action) dynamic.push(`What does "${action.description?.slice(0, 28)}…" cost?`);
    return [...dynamic, ...base].slice(0, 4);
  }, [analysis]);

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text.trim() }]);
    setLoading(true);
    window.setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: getAssistantReply(text.trim(), analysis) }]);
      setLoading(false);
    }, 220);
  };

  const handleSend = () => sendMessage(input);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-[52px] h-[52px] bg-[var(--color-ink)] text-[var(--color-accent-ink)] flex items-center justify-center rounded-full shadow-[var(--shadow-floated)] hover:scale-[1.04] ease-premium transition-transform z-[100] cursor-pointer group"
        aria-label="Open Navigator Assistant"
      >
        <Sparkles size={18} />
        {analysis?.regressions?.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-accent)] rounded-full ring-2 ring-[var(--color-bg)]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-6 w-[440px] h-[600px] card flex flex-col overflow-hidden z-[101] shadow-[var(--shadow-deep)]"
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b hairline flex items-center justify-between bg-[var(--color-surface-soft)]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-accent-ink)] flex items-center justify-center">
                  <Sparkles size={13} />
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-[13px] font-medium text-[var(--color-ink)]">Navigator Assistant</span>
                  <span className="font-mono text-[9px] tracking-[0.10em] uppercase text-[var(--color-ink-muted)] mt-0.5">
                    {analysis ? `Context · ${analysis.entityName ?? "Active assessment"}` : "Standby"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
                aria-label="Close"
              >
                <Minimize2 size={14} />
              </button>
            </div>

            {/* Live analysis context strip */}
            {analysis && (
              <div className="px-5 py-2.5 border-b hairline bg-[var(--color-bg)] flex items-center gap-4 text-[11px] font-mono text-[var(--color-ink-muted)]">
                <span>Score <span className="text-[var(--color-ink)] font-semibold">{analysis.overallScore?.toFixed(2)}</span></span>
                <span>Aligned <span className="text-[var(--color-ink)] font-semibold">{analysis.analytics?.filter((a: any) => a.score >= a.target).length}/{analysis.analytics?.length}</span></span>
                {analysis.regressions?.length > 0 && (
                  <span>Drift <span className="text-[var(--color-coral)] font-semibold">{analysis.regressions.length}</span></span>
                )}
                <span>Actions <span className="text-[var(--color-ink)] font-semibold">{analysis.activeRoadmapCount}</span></span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-5">
                  <div>
                    <Eyebrow tone="ink">How can I help?</Eyebrow>
                    <p className="mt-3 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
                      I can read your live analysis — pillar gaps, drift signals, roadmap sequencing,
                      benchmark profiles. Ask in plain English, or pick a starting point below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(p => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="px-3 py-1.5 border hairline rounded-full text-[11px] text-[var(--color-ink-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] cursor-pointer ease-premium transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3.5 py-2.5 max-w-[85%] text-[13px] leading-relaxed rounded-[10px] ${
                      m.role === "user"
                        ? "bg-[var(--color-ink)] text-[var(--color-bg)]"
                        : "bg-[var(--color-surface-soft)] text-[var(--color-ink)]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 max-w-[120px] rounded-[10px] bg-[var(--color-surface-soft)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: "120ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" style={{ animationDelay: "240ms" }} />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="px-4 py-3 border-t hairline flex gap-2 items-center bg-[var(--color-surface)]">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)]"
                placeholder="Ask about your maturity…"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:scale-105 ease-premium transition-transform"
                aria-label="Send"
              >
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
// Editorial masthead layout: left column = credential form with brand
// lockup and ISO/COSO/NIST citation. Right column = pull-quote with a
// decorative compass watermark, establishing institutional gravitas.

const LoginScreen = ({
  onLogin,
  loading,
  error,
}: {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--color-bg)] overflow-hidden">
      {/* Left — credential form */}
      <div className="flex flex-col px-8 lg:px-20 py-12">
        {/* Brand — 8-point compass-star mark + Fraunces wordmark + mono subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <BrandMark size={28} />
          <div className="flex flex-col leading-none">
            <span className="wordmark text-[17px] text-[var(--color-ink)]">
              ERM Navigator
            </span>
            <span className="font-mono text-[9px] tracking-[0.10em] text-[var(--color-ink-muted)] mt-1.5 uppercase">
              Risk Maturity Platform
            </span>
          </div>
        </motion.div>

        {/* Sign-in form anchored to bottom-of-content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-auto max-w-[440px] w-full"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-[var(--color-accent)] font-medium">
            <span>●</span><span>Sign in</span>
          </div>

          <h1 className="mt-4 text-[44px] font-medium leading-[1.05] tracking-[-0.028em] text-[var(--color-ink)] font-sans">
            The risk navigator.
          </h1>

          <p className="mt-4 text-[14.5px] leading-[1.55] text-[var(--color-ink-soft)] max-w-[400px]">
            An auditable maturity platform for enterprise risk programs. Aligned to ISO&nbsp;31000, COSO&nbsp;ERM, and NIST&nbsp;RMF.
          </p>

          <div className="mt-9 flex flex-col gap-4">
            <div>
              <Eyebrow className="block mb-2">Operator email</Eyebrow>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="analyst@gmail.com"
                autoFocus
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border hairline rounded-[7px] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <Eyebrow className="block mb-2">Passphrase</Eyebrow>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border hairline rounded-[7px] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="border hairline py-2.5 px-3 rounded-[7px] bg-[var(--color-coral-soft)]"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className="text-[var(--color-coral)]" />
                  <span className="text-[12px] text-[var(--color-coral)]">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading}
              className="btn-cta w-full mt-2"
            >
              {loading ? "Signing in…" : "Enter the Navigator"}
              {!loading && <ArrowRight size={13} />}
            </button>
          </div>

          {/* Trust strip — outcomes, not implementation. */}
          <div className="mt-7 inline-flex items-center gap-3.5 px-3.5 py-2 rounded-full border hairline bg-[var(--color-bg-deep)] font-mono text-[11px] text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[var(--color-mint)]">●</span> Replayable
            </span>
            <span className="w-px h-3 bg-[var(--color-border-strong)]" />
            <span>Audit-traceable</span>
            <span className="w-px h-3 bg-[var(--color-border-strong)]" />
            <span>Standards-aligned</span>
          </div>
        </motion.div>

        {/* Footer alignment row */}
        <div className="mt-auto pt-8 font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-muted)]">
          ISO 31000 · COSO ERM · NIST RMF · RIMS RMM
        </div>
      </div>

      {/* Right — proof panel: ISO 31000 citation + numerical anchors. */}
      <div className="hidden lg:flex flex-col justify-center px-16 py-20 bg-[var(--color-bg-deep)] border-l hairline">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[560px]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-accent)] font-medium">
            The framework, in its own words
          </div>

          {/* ISO 31000 clause 5.4 — the canonical statement of what risk
              management is supposed to do, used here as borrowed authority. */}
          <blockquote
            className="mt-6 pl-5 border-l-2 text-[24px] leading-[1.4] tracking-[-0.018em] text-[var(--color-ink)]"
            style={{ borderColor: 'var(--color-accent-line)', fontWeight: 400 }}
          >
            Risk management should be an integral part of all organizational activities — <span className="text-[var(--color-accent)]">dynamic, iterative, and responsive to change</span>, informed by the best available information.
          </blockquote>
          <div className="mt-3 pl-5 font-mono text-[10.5px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
            ISO 31000 : 2018 · clause 5.4
          </div>

          <p className="mt-10 text-[14.5px] leading-[1.6] text-[var(--color-ink-soft)] italic max-w-[480px]" style={{ fontFamily: 'var(--font-wordmark)' }}>
            Every assessment is auditable: every score, every note, every evidence link is stamped, addressable, and reproducible on demand.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { n: '100',  l: 'standards-aligned\nvectors per unit' },
              { n: '10×4', l: 'pillars × operating\ndimensions' },
              { n: '24',   l: 'patent claims\ncovered' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-[18px] bg-[var(--color-surface)] rounded-[10px] border hairline"
              >
                <div className="text-[32px] font-medium leading-none tracking-[-0.025em] text-[var(--color-accent)]">
                  {s.n}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)] whitespace-pre-line leading-[1.4]">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── BUSINESS UNIT SELECTION ───────────────────────────────────────────────
// Editorial table-of-contents pattern: each BU is a numbered chapter
// with a commissioned glyph, Roman folio, and brief descriptor. Left
// column is a wide editorial lede; right column lists every unit.

const ScopeScreen = ({
  entities,
  onSelect,
  operatorEmail,
  onLogout,
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
}) => {
  // Map last-known score per BU from the operator's history.
  // Latest session per entityId wins; missing → "no data".
  const latestByBu = new Map<string, any>();
  for (const item of history ?? []) {
    if (!latestByBu.has(item.entityId)) latestByBu.set(item.entityId, item);
  }

  return (
  <div className="min-h-screen">
    <div className="max-w-[1440px] mx-auto px-10 py-12">
      {/* D+ lede — single column, tighter than editorial 2-col */}
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

        {/* Run parameters strip — flat row, mono labels */}
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

      {/* Operating-unit mosaic — D+ pastel-tile pattern.
          Each tile pulls last-known overallScore from the operator's history
          if available; otherwise renders a 'no data' placeholder. */}
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
              {/* Pastel tint header strip */}
              <div
                className="absolute inset-x-0 top-0 h-[8px]"
                style={{ background: t.tint }}
                aria-hidden
              />
              <div className="p-5 pt-6">
                {/* Top row: glyph + code + status */}
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

                {/* Name + industry */}
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

                {/* Bottom row: score or "no data" + age + arrow */}
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

      {/* Archive — full session history */}
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
};

// ─── QUESTIONNAIRE ─────────────────────────────────────────────────────────

const VectorCapturePipeline = ({ questions, pillars, bu, onComplete, onBack, draft, onDraftChange }: any) => {
  // Responses/notes/evidence/answeredAt are owned by the App so they survive
  // unmount/remount when the user navigates away and back via the sidebar.
  // currIdx/showSummary stay local — those are pure view state.
  const [currIdx, setCurrIdx] = useState(0);
  const responses: Record<number, number> = draft?.responses ?? {};
  const notes: Record<number, string> = draft?.notes ?? {};
  const evidenceNames: Record<number, string> = draft?.evidenceNames ?? {};
  const answeredAt: Record<number, string> = draft?.answeredAt ?? {};
  // Each setter uses a FUNCTIONAL parent update so multiple setters fired
  // in the same handler compose correctly. The previous version closed over
  // a stale `draft` reference and the second batched setter overwrote the
  // first — losing the score on every click. Codex P1 catch.
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
    const newR = { ...responses, [currentQ.id]: score };
    setResponses(newR);
    setAnsweredAt(prev => ({ ...prev, [currentQ.id]: ts }));
    // Intentionally NOT auto-advancing. The rubric preview, analyst note, and
    // evidence upload all need the user to stay on this question after
    // picking a score. User advances via Next button or → key.
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

  // Summary screen
  if (showSummary) {
    return (
      <div className="min-h-screen">
        {/* D+ top bar — BU breadcrumb + screen mode */}
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
      {/* Inner pillar-progress rail (sits inside the global D+ shell) */}
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

      {/* Main */}
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
            {/* Inline rubric preview — full text of the currently-selected level. */}
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
};

// ─── RNOS COMMAND CENTER ───────────────────────────────────────────────────

const RNOSCommandCenter = ({
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
}: any) => {
  type SortKey = "priority" | "uplift" | "phase";
  const [sortKey, setSortKey] = useState<SortKey>("priority");

  // Real per-pillar trajectories from /api/assessments/trend. Replaces the
  // deterministic Math.sin sparklines that were synthesizing "history" from
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
      {/* D+ top bar — BU breadcrumb + benchmark tabs (left) ; status + actions (right) */}
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
        {/* Live Brief hero — drift narrative + score + secondary metrics
            Severity stripe lights coral when a CRITICAL regression is live, so
            the most important moment of the screen carries its alarm. */}
        <Card severity={criticalRegressionsCount > 0 ? "coral" : (analysis.regressions?.length ?? 0) > 0 ? "amber" : "mint"} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: drift narrative */}
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

              {/* Secondary metric strip — tooltips intact, mono labels, tabular numbers */}
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

              {/* Live Brief CTAs — routes the operator to the next obvious move */}
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

            {/* Right: hero score + sparkline trail */}
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
                {/* Run signature — patent claim 24 made tangible. Click to
                    inspect the inputs that determined this score. */}
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

        {/* Signature inspector modal */}
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

        {/* Pillar table — D+ prototype tabular layout with inline sparklines */}
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
                  // Real trend points, or none. Never fabricate.
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

        {/* Focus Inspector — 4 dimension tiles. Each surfaces dim score + gap
            against a 4.0 reference, the canonical "Managed" maturity threshold.
            Color drives off above/below the threshold so an operator scanning
            the row sees which axis is bleeding without reading numbers. */}
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
                  {/* Bar with reference tick at 4.0 */}
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

        {/* Response coverage strip — what raw inputs underpin this analysis.
            Audit-trail-friendly. The radar/dimensions/drift cards that used
            to sit here were redundant with the pillar table + Focus Inspector
            + Live Brief headline; cut to reduce chart inflation. */}
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

        {/* Pillar evolution — historical trend across past assessments.
            Real longitudinal data, not redundant with anything else. */}
        <TrendChart entityId={bu.id} operatorEmail={operatorEmail} benchmarkType={benchmarkType} />

        {/* Sequenced roadmap — preserved at top level for the audit narrative.
            Regression Alerts card was cut: same data shown by Live Brief
            headline + pillar-table status pills. */}
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
};

// ─── D+ SHELL — persistent sidebar + top bar wrapped around authed screens ──

// Per-BU tints — mirrors the CSS custom properties --bu-tint-* / --bu-dot-*
// so JSX consumers can pull them without reading computed style.
const BU_TINTS: Record<string, { tint: string; dot: string }> = {
  gen:  { tint: "#F5E4C8", dot: "#D49E3C" },
  tra:  { tint: "#D8E4EF", dot: "#6B8FAE" },
  dis:  { tint: "#D9E5D3", dot: "#7B9A6B" },
  corp: { tint: "#EEE6D7", dot: "#A89673" },
  sub:  { tint: "#EBDEE0", dot: "#B08894" },
  jv:   { tint: "#DDD8E9", dot: "#8E82A8" },
};

const DPSidebar = ({
  entities,
  activeBuId,
  screen,
  onSelectBU,
  onNavigate,
  onLogout,
  loginEmail,
}: {
  entities: any[];
  activeBuId: string | null;
  screen: Screen;
  onSelectBU: (bu: any) => void;
  onNavigate: (to: Screen) => void;
  onLogout: () => void;
  loginEmail: string;
}) => {
  // Workspace nav highlights based on the current screen — the labels are
  // product taxonomy (matches CONTEXT.md), the active state is computed.
  const workspaceItems: { key: string; label: string; target: Screen | null; active: boolean }[] = [
    { key: "today",    label: "Today",          target: "navigator",  active: screen === "navigator" },
    { key: "scope",    label: "Operating units", target: "scope",     active: screen === "scope" },
    // Assessment is intentionally not directly navigable — it requires a BU
    // selection (see handleEntitySelect). Clicking the nav item routes to
    // scope so the user picks a unit; the "active" highlight still lights up
    // when the assessment is in progress.
    { key: "assess",   label: "Assessment",     target: screen === "assessment" ? "assessment" : "scope", active: screen === "assessment" },
    { key: "action",   label: "Action plan",    target: "action",     active: screen === "action" },
    { key: "evidence", label: "Evidence",       target: "evidence",   active: screen === "evidence" },
    { key: "history",  label: "History",        target: "history",    active: screen === "history" },
    { key: "report",   label: "Report",         target: "report",     active: screen === "report" },
    { key: "provenance", label: "Provenance",   target: "provenance", active: screen === "provenance" },
  ];

  return (
    <aside
      className="flex flex-col bg-[var(--color-surface)] border-r hairline px-[18px] pt-5 pb-4"
      style={{ width: 240, flexShrink: 0 }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-6">
        <BrandMark size={22} />
        <span className="wordmark text-[15px] text-[var(--color-ink)]">
          ERM Navigator
        </span>
      </div>

      {/* Operating units */}
      <Eyebrow className="block mb-2">Operating units</Eyebrow>
      <div className="flex flex-col gap-0.5">
        {entities.map((bu: any) => {
          const t = BU_TINTS[bu.id] ?? { tint: "var(--color-bg-deep)", dot: "var(--color-ink-muted)" };
          const active = bu.id === activeBuId;
          return (
            <button
              key={bu.id}
              onClick={() => onSelectBU(bu)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] text-left text-[13px] cursor-pointer transition-colors hover:bg-[var(--color-bg-deep)] ${active ? 'nav-item-active' : 'text-[var(--color-ink-soft)]'}`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span
                className="inline-flex items-center justify-center flex-shrink-0"
                style={{ width: 26, height: 26, borderRadius: 6, background: t.tint, color: t.dot }}
              >
                <BuGlyph id={bu.id} size={14} />
              </span>
              <span className="flex-1 truncate">{bu.name}</span>
              {active && (
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-accent)' }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-[var(--color-border)] my-3.5" />

      {/* Workspace nav */}
      <Eyebrow className="block mb-2">Workspace</Eyebrow>
      <div className="flex flex-col gap-0.5">
        {workspaceItems.map(it => {
          const enabled = !!it.target;
          return (
            <button
              key={it.key}
              onClick={() => { if (it.target) onNavigate(it.target); }}
              disabled={!enabled}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-left text-[13px] transition-colors ${it.active ? 'nav-item-active' : 'text-[var(--color-ink-soft)]'} ${enabled ? 'cursor-pointer hover:bg-[var(--color-bg-deep)]' : 'cursor-default opacity-60'}`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-[var(--color-border)] my-3.5" />

      {/* Operator + standards footer */}
      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--color-mint)' }} />
          <span className="font-mono text-[10px] text-[var(--color-ink-soft)] tracking-[0.06em] truncate">
            {loginEmail || 'analyst@gmail.com'}
          </span>
        </div>
        <div className="font-mono text-[10px] tracking-[0.04em] text-[var(--color-ink-subtle)] mb-3">
          ISO 31000 · COSO · NIST · RIMS
        </div>
        <button
          onClick={onLogout}
          className="text-[11px] font-mono text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] tracking-[0.10em] uppercase cursor-pointer"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

// ─── APP SHELL ─────────────────────────────────────────────────────────────

type Screen =
  | "login"
  | "scope"
  | "assessment"
  | "navigator"
  | "action"
  | "evidence"
  | "report"
  | "history"
  | "provenance";

export default function App() {
  const [screen, setScreenState] = useState<Screen>("login");

  // Browser-history sync: each screen transition pushes a history entry so
  // the browser Back button walks backward through our SPA instead of
  // leaving the app entirely.
  const suppressPushRef = useRef(false);
  const setScreen = (next: Screen) => {
    setScreenState(next);
    if (!suppressPushRef.current && typeof window !== "undefined") {
      window.history.pushState({ screen: next }, "");
    }
    suppressPushRef.current = false;
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Seed the initial entry so popping from login doesn't escape the app.
    window.history.replaceState({ screen: "login" }, "");
    const onPop = (e: PopStateEvent) => {
      const target: Screen = (e.state && (e.state as any).screen) || "login";
      suppressPushRef.current = true;
      setScreenState(target);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [selectedBU, setSelectedBU] = useState<any>(null);
  const [benchmarkType, setBenchmarkType] = useState("target");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  // Lifted draft for the in-progress questionnaire so navigating away and
  // back via the sidebar doesn't blow away captured responses. Keyed by
  // assessmentId so a different BU starts a fresh draft.
  // Provenance deep-link target — when set, opening the Provenance screen
  // scrolls to and highlights this pillar. Cleared on next setScreen.
  const [provenancePillarId, setProvenancePillarId] = useState<string | null>(null);
  const openProvenance = (pillarId?: string | null) => {
    setProvenancePillarId(pillarId ?? null);
    setScreen("provenance");
  };
  const [assessmentDraft, setAssessmentDraft] = useState<{
    id: string | null;
    responses: Record<number, number>;
    notes: Record<number, string>;
    evidenceNames: Record<number, string>;
    answeredAt: Record<number, string>;
  }>({ id: null, responses: {}, notes: {}, evidenceNames: {}, answeredAt: {} });

  const entities = BUSINESS_UNITS;
  const metadata = { pillars: PILLARS, questions: QUESTIONS, weights: WEIGHTS };
  const benchmarkTypes = BENCHMARK_TYPES;
  void BENCHMARKS;

  // Past-sessions archive (populated on login + after each finalize).
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const loadHistory = async (email: string) => {
    if (!email) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/assessments?operatorEmail=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("history fetch failed");
      const data = await res.json();
      setHistory(data.assessments ?? []);
    } catch (e) {
      console.error(e);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistoricalAssessment = async (item: any) => {
    const bu = entities.find(b => b.id === item.entityId) ?? entities[0];
    setSelectedBU(bu);
    setAssessmentId(item.id);
    await fetchAnalysis(item.id, benchmarkType);
    setScreen("navigator");
  };

  // Command palette — ⌘K on navigator screen
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (!/^[^@\s]+@gmail\.com$/i.test(normalized)) {
      setLoginError("Use any @gmail.com address to enter the demo.");
      return;
    }
    if (!password.trim()) {
      setLoginError("Any password. Fake auth is intentional for the demo.");
      return;
    }
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized, password }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Unable to authorize.");
      }
      setLoginEmail(normalized);
      loadHistory(normalized);
      setScreen("scope");
    } catch (e: any) {
      setLoginError(e.message || "Unable to authorize.");
    } finally {
      setLoading(false);
    }
  };

  const generateAssessmentId = () =>
    "TX" + Math.random().toString(36).substring(2, 11).toUpperCase();

  // Explicit "begin new assessment" — used by Scope tile click and the
  // explicit "+ New assessment" affordance. Resets the draft because this
  // is the user's deliberate action to start fresh.
  const handleEntitySelect = (bu: any) => {
    const aid = generateAssessmentId();
    setAssessmentId(aid);
    setSelectedBU(bu);
    setAssessmentDraft({ id: aid, responses: {}, notes: {}, evidenceNames: {}, answeredAt: {} });
    setScreen("assessment");
  };

  // Sidebar BU click — filter the workspace to that unit. Adopts the
  // mental model: clicking a BU NEVER creates or mutates records. If a
  // prior completed assessment exists, open it. Otherwise route to scope
  // so the user can explicitly begin one. Never silently overwrite.
  const handleSidebarBuSelect = async (bu: any) => {
    setSelectedBU(bu);
    const priorForBu = history.find((h: any) => h.entityId === bu.id);
    if (priorForBu) {
      setAssessmentId(priorForBu.id);
      await fetchAnalysis(priorForBu.id, benchmarkType);
      setScreen("navigator");
    } else {
      // No prior — clear analysis so Today's empty hub fires correctly,
      // then route to scope so the user explicitly initiates a new assessment.
      setAnalysis(null);
      setAssessmentId(null);
      setScreen("scope");
    }
  };

  // Race-safe analysis fetch. When the operator switches BU mid-fetch we
  // abort the in-flight request so a stale response can't overwrite the
  // newer selection's analysis.
  const analysisAbortRef = useRef<AbortController | null>(null);
  const fetchAnalysis = async (aid: string, bType = benchmarkType) => {
    analysisAbortRef.current?.abort();
    const ctrl = new AbortController();
    analysisAbortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/${aid}/analysis?benchmarkType=${bType}`, { signal: ctrl.signal });
      const data = await res.json();
      if (!ctrl.signal.aborted) setAnalysis(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  };

  const handleAssessmentComplete = async ({ responses, notes, evidenceNames, answeredAt }: any) => {
    const qCount = metadata.questions.length;
    const ansCount = Object.keys(responses).filter(k => responses[k as any] !== undefined).length;
    if (ansCount !== qCount) {
      alert(`Pipeline block: ${qCount - ansCount} vectors missing.`);
      return;
    }
    setLoading(true);
    try {
      const formatted = metadata.questions.map((q: any) => ({
        questionId: q.id,
        score: Number(responses[q.id]),
        note: notes[q.id] || "",
        evidenceName: evidenceNames[q.id] || "",
        answeredAt: answeredAt[q.id] || new Date().toISOString(),
      }));
      const save = await fetch("/api/responses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          entityId: selectedBU?.id,
          operatorEmail: loginEmail,
          responses: formatted,
        }),
      });
      if (!save.ok) {
        const err = await save.json();
        throw new Error(err.message || "Storage failure");
      }
      await fetchAnalysis(assessmentId!, benchmarkType);
      loadHistory(loginEmail);
      setScreen("navigator");
    } catch (e: any) {
      alert(`Pipeline failure: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Logout helper — clears every operator-scoped state slot so the next
  // operator inherits no preferences, drafts, or analyses from the previous
  // session. Operator A's mid-questionnaire draft must not be visible to B.
  const handleLogout = () => {
    setHistory([]);
    setLoginEmail("");
    setSelectedBU(null);
    setAnalysis(null);
    setAssessmentId(null);
    setBenchmarkType("target");
    setAssessmentDraft({ id: null, responses: {}, notes: {}, evidenceNames: {}, answeredAt: {} });
    setScreen("login");
  };

  // Authed screens share the persistent sidebar + main-canvas shell.
  // Login is the only full-bleed screen (no sidebar).
  const isAuthedScreen = screen !== "login";

  return (
    <TooltipProvider delayDuration={120}>
    <div className="min-h-screen">
      {screen === "login" && (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />
        </motion.div>
      )}

      {isAuthedScreen && (
        <div className="flex min-h-screen">
          <DPSidebar
            entities={entities}
            activeBuId={selectedBU?.id ?? null}
            screen={screen}
            onSelectBU={handleSidebarBuSelect}
            onNavigate={(to) => setScreen(to)}
            onLogout={handleLogout}
            loginEmail={loginEmail}
          />
          <main className="flex-1 min-w-0 flex flex-col">
            <AnimatePresence mode="wait">
              {screen === "scope" && (
                <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1">
                  <ScopeScreen
                    entities={entities}
                    onSelect={handleEntitySelect}
                    operatorEmail={loginEmail}
                    onLogout={handleLogout}
                    history={history}
                    historyLoading={historyLoading}
                    onOpenHistorical={openHistoricalAssessment}
                  />
                </motion.div>
              )}
              {screen === "assessment" && (
                <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1">
                  <VectorCapturePipeline
                    bu={selectedBU}
                    questions={metadata.questions}
                    pillars={metadata.pillars}
                    onBack={() => setScreen("scope")}
                    onComplete={handleAssessmentComplete}
                    draft={assessmentDraft}
                    onDraftChange={setAssessmentDraft}
                  />
                </motion.div>
              )}
              {screen === "action" && (
                <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  {analysis ? (
                    <ActionPlanScreen analysis={analysis} bu={selectedBU} onOpenToday={() => setScreen("navigator")} />
                  ) : (
                    <EmptyHub message="No live assessment selected. Open an operating unit from Today or Operating units to view its action plan." cta="Operating units" onCta={() => setScreen("scope")} />
                  )}
                </motion.div>
              )}
              {screen === "evidence" && (
                <motion.div key="evidence" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  {analysis ? (
                    <EvidenceScreen analysis={analysis} bu={selectedBU} onOpenToday={() => setScreen("navigator")} />
                  ) : (
                    <EmptyHub message="Evidence is scoped to the active assessment. Pick an operating unit first." cta="Operating units" onCta={() => setScreen("scope")} />
                  )}
                </motion.div>
              )}
              {screen === "report" && (
                <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  {analysis ? (
                    <ReportScreen
                      analysis={analysis}
                      bu={selectedBU}
                      assessmentId={assessmentId}
                      operatorEmail={loginEmail}
                      onOpenToday={() => setScreen("navigator")}
                      onOpenProvenance={() => openProvenance(null)}
                    />
                  ) : (
                    <EmptyHub message="The report previews an assessment's board-grade PDF. Open one first." cta="Operating units" onCta={() => setScreen("scope")} />
                  )}
                </motion.div>
              )}
              {screen === "provenance" && (
                <motion.div key="provenance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  <ProvenanceScreen
                    onOpenToday={() => setScreen(analysis ? "navigator" : "scope")}
                    highlightPillarId={provenancePillarId}
                  />
                </motion.div>
              )}
              {screen === "history" && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  {selectedBU ? (
                    <HistoryScreen bu={selectedBU} operatorEmail={loginEmail} onOpenToday={() => setScreen(analysis ? "navigator" : "scope")} />
                  ) : (
                    <EmptyHub message="History needs an operating unit. Pick one to see its full trajectory." cta="Operating units" onCta={() => setScreen("scope")} />
                  )}
                </motion.div>
              )}
              {screen === "navigator" && !analysis && (
                <motion.div key="navigator-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1 flex flex-col">
                  <EmptyHub
                    message="Today reads a live assessment. Open one from Operating units to see its Live Brief, drift, and roadmap."
                    cta="Operating units"
                    onCta={() => setScreen("scope")}
                  />
                </motion.div>
              )}
              {screen === "navigator" && analysis && (
                <motion.div key="navigator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.20 }} className="flex-1">
                  <RNOSCommandCenter
                    analysis={analysis}
                    bu={selectedBU}
                    allBUs={entities}
                    benchmarkTypes={benchmarkTypes}
                    benchmarkType={benchmarkType}
                    onBenchmarkTypeChange={async (t: string) => {
                      setBenchmarkType(t);
                      if (assessmentId) await fetchAnalysis(assessmentId, t);
                    }}
                    onEntityChange={(bu: any) => {
                      setAssessmentId(generateAssessmentId());
                      setSelectedBU(bu);
                      setScreen("assessment");
                    }}
                    onBack={() => setScreen("scope")}
                    onOpenPalette={() => setPaletteOpen(true)}
                    onOpenActionPlan={() => setScreen("action")}
                    onOpenProvenance={(pid: string) => openProvenance(pid)}
                    assessmentId={assessmentId}
                    operatorEmail={loginEmail}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Search units, benchmarks, actions…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Switch unit">
            {entities.map((b: any) => (
              <CommandItem
                key={b.id}
                value={`unit ${b.name} ${b.industry}`}
                onSelect={() => {
                  setAssessmentId(generateAssessmentId());
                  setSelectedBU(b);
                  setScreen("assessment");
                  setPaletteOpen(false);
                }}
              >
                <span className="font-mono text-[10px] tracking-[0.10em] uppercase text-[var(--color-ink-muted)] w-12">{b.id}</span>
                <span className="flex-1">{b.name}</span>
                <span className="text-[12px] text-[var(--color-ink-muted)]">{b.industry}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Benchmark profile">
            {benchmarkTypes.map((t: string) => (
              <CommandItem
                key={t}
                value={`benchmark ${BENCHMARK_LABEL[t]}`}
                onSelect={async () => {
                  setBenchmarkType(t);
                  if (assessmentId) await fetchAnalysis(assessmentId, t);
                  setPaletteOpen(false);
                }}
              >
                <span className="flex-1">{BENCHMARK_LABEL[t]}</span>
                <CommandShortcut>{t === benchmarkType ? "active" : ""}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem value="scope operating units" onSelect={() => { setScreen("scope"); setPaletteOpen(false); }}>
              Back to operating scope
              <CommandShortcut>⌘ ⇧ S</CommandShortcut>
            </CommandItem>
            <CommandItem value="logout" onSelect={() => { setScreen("login"); setPaletteOpen(false); }}>
              Log out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {screen !== "login" && <NavigatorAssistant analysis={analysis} />}

      {loading && (
        <div className="fixed inset-0 bg-[var(--color-bg)]/85 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <StatusDot color="amber" />
              <StatusDot color="amber" />
              <StatusDot color="amber" />
            </div>
            <span className="eyebrow-amber">Computing</span>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
