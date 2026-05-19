import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Command as CommandIcon,
  FileDown,
  Minimize2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import {
  Brand,
  BrandMark,
  BuGlyph,
  Card,
  Eyebrow,
  HeaderBar,
  Keycap,
  Metric,
  OrnamentalRule,
  Pill,
  PullQuote,
  RunningFooter,
  SectionRule,
  StatusDot,
} from "./components/primitives";
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Progress } from "./components/ui/progress";
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

// ─── CONSTANTS ─────────────────────────────────────────────────────────────

const BENCHMARK_LABEL: Record<string, string> = {
  target: "Target",
  industry: "Industry",
  peer: "Peers",
  external: "External",
};

// Roman numeral for editorial chapter marks.
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// Recharts theme — editorial palette: ink as primary data color, gold for accent.
const CHART = {
  grid: "rgba(15, 42, 27, 0.07)",
  axis: "rgba(15, 42, 27, 0.30)",
  axisLabel: "rgba(15, 42, 27, 0.52)",
  primary: "#0F2A1B",
  accent: "#C8A14B",
  benchmark: "#1E4D73",
  critical: "#A64226",
  mint: "#2E6B48",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFDF8",
  border: "1px solid rgba(15, 42, 27, 0.12)",
  borderRadius: 8,
  padding: "10px 14px",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  color: "#0F2A1B",
  boxShadow: "0 2px 4px rgba(15,42,27,.06), 0 12px 32px rgba(15,42,27,.08)",
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

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    window.setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: getAssistantReply(userMsg, analysis) }]);
      setLoading(false);
    }, 200);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--color-ink)] text-[var(--color-highlight)] flex items-center justify-center rounded-full shadow-[0_8px_24px_rgba(15,42,27,0.24)] hover:scale-105 ease-premium transition-transform z-[100] cursor-pointer group"
        aria-label="Open assistant"
      >
        <Sparkles size={18} />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-gold)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-22 right-6 w-[400px] h-[540px] card flex flex-col overflow-hidden z-[101]"
          >
            <div className="px-5 py-4 border-b hairline flex items-center justify-between bg-[var(--color-surface-soft)]">
              <div className="flex items-center gap-3">
                <StatusDot color="amber" />
                <span className="eyebrow-amber">Navigator Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
                aria-label="Close"
              >
                <Minimize2 size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-5">
                  <div>
                    <Eyebrow tone="ink">Ask a question</Eyebrow>
                    <p className="mt-3 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
                      Ask about scoring matrix, benchmark profiles, drift signals, roadmap sequencing, or response coverage.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["weakest gap", "drift status", "top action"].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setInput(p);
                          setTimeout(handleSend, 0);
                        }}
                        className="px-3 py-1.5 border hairline rounded-full text-[11px] font-mono text-[var(--color-ink-soft)] hover:border-[var(--color-gold)] hover:text-[var(--color-ink)] cursor-pointer ease-premium transition-colors"
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
                <div className="flex items-center gap-2">
                  <StatusDot color="amber" />
                  <span className="eyebrow-amber">thinking</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t hairline flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="input-bare py-2"
                placeholder="Ask about your maturity…"
              />
              <button
                onClick={handleSend}
                className="text-[var(--color-ink)] hover:opacity-70 cursor-pointer"
                aria-label="Send"
              >
                <Send size={16} />
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
    <div className="min-h-screen flex items-stretch paper-grain overflow-hidden relative">
      {/* Masthead top edge */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-[1440px] mx-auto px-10 pt-8 flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
          <span>ERM Navigator · Volume I</span>
          <span>No. 001 · MMXXVI</span>
        </div>
      </div>

      {/* Left — credential form */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16 relative z-10">
        <div className="w-full max-w-[440px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-10">
              <BrandMark size={28} />
              <div className="flex flex-col leading-none">
                <span className="font-display text-[17px] tracking-tight text-[var(--color-ink)] font-medium">
                  ERM Navigator
                </span>
                <span className="font-mono text-[9px] tracking-[0.22em] text-[var(--color-ink-muted)] mt-1.5 uppercase">
                  SEC Risk Maturity Platform
                </span>
              </div>
            </div>

            <div className="chapter-mark mb-5">
              <span>Chapter I · Entry</span>
            </div>

            <h1 className="display-title text-[64px] text-[var(--color-ink)]">
              The risk<br />
              <span className="italic text-[var(--color-gold)]" style={{ fontWeight: 300 }}>navigator</span>
              <span className="text-[var(--color-ink)]">.</span>
            </h1>

            <p className="mt-5 text-[14.5px] text-[var(--color-ink-soft)] leading-[1.6] max-w-[380px]">
              An auditable maturity platform for Saudi Electricity Company. Aligned to ISO&nbsp;31000, COSO&nbsp;ERM, and NIST&nbsp;RMF.
            </p>

            <div className="mt-8 flex items-center gap-4 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
              <span>ISO 31000</span>
              <span className="text-[var(--color-gold)]">·</span>
              <span>COSO ERM</span>
              <span className="text-[var(--color-gold)]">·</span>
              <span>NIST RMF</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 space-y-6"
          >
            <div>
              <Eyebrow className="block mb-3">Email · operator</Eyebrow>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="analyst@gmail.com"
                className="input-bare"
                autoFocus
              />
            </div>
            <div>
              <Eyebrow className="block mb-3">Passphrase</Eyebrow>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="••••••••"
                className="input-bare"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="border hairline stripe-coral py-3 px-4 rounded-[8px] bg-[var(--color-coral-soft)]"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle size={14} className="text-[var(--color-coral)]" />
                  <span className="text-[12px] text-[var(--color-coral)]">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Enter the navigator"}
              {!loading && <ArrowRight size={14} />}
            </button>

            <div className="pt-5 border-t hairline flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-muted)] tracking-[0.18em] uppercase">
              <span>Demo · any @gmail</span>
              <div className="flex items-center gap-2">
                <StatusDot color="mint" />
                <span>Secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — editorial content pane */}
      <div className="hidden lg:flex flex-1 relative bg-[var(--color-bg-deep)] overflow-hidden border-l hairline items-center justify-center px-16">
        {/* Decorative watermark: oversized compass */}
        <svg
          viewBox="0 0 400 400"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] pointer-events-none"
          style={{ animation: "slow-drift 24s ease-in-out infinite" }}
          aria-hidden
        >
          <g stroke="rgba(15, 42, 27, 0.10)" strokeWidth="0.5" fill="none">
            {/* Concentric rings */}
            {[60, 110, 160, 200].map(r => (
              <circle key={r} cx="200" cy="200" r={r} />
            ))}
            {/* Radial tick marks every 22.5° */}
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i * 22.5 * Math.PI) / 180;
              const x1 = 200 + Math.cos(a) * 170;
              const y1 = 200 + Math.sin(a) * 170;
              const x2 = 200 + Math.cos(a) * 200;
              const y2 = 200 + Math.sin(a) * 200;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            {/* Cardinal axes */}
            <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(200, 161, 75, 0.35)" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(200, 161, 75, 0.35)" />
          </g>
          {/* 8-point star at center */}
          <path
            d="M200 90 L214 170 L290 140 L230 200 L290 260 L214 230 L200 310 L186 230 L110 260 L170 200 L110 140 L186 170 Z"
            fill="rgba(200, 161, 75, 0.10)"
            stroke="rgba(200, 161, 75, 0.45)"
            strokeWidth="1"
          />
          {/* Cardinal letters */}
          <g fontFamily="Fraunces, serif" fontSize="14" fontStyle="italic" fill="rgba(15, 42, 27, 0.40)">
            <text x="200" y="35" textAnchor="middle">N</text>
            <text x="375" y="205" textAnchor="middle">E</text>
            <text x="200" y="380" textAnchor="middle">S</text>
            <text x="25" y="205" textAnchor="middle">W</text>
          </g>
        </svg>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-[480px]"
        >
          <Eyebrow tone="amber">From the editor's desk</Eyebrow>

          <PullQuote attribution="ISO 31000 : 2018 · clause 5.4">
            Risk management should be an integral part of all organizational activities — dynamic, iterative, and responsive to change, informed by the best available information.
          </PullQuote>

          <div className="mt-10 grid grid-cols-3 gap-6 pt-6 border-t hairline-gold">
            <div>
              <div className="folio-num text-[44px] text-[var(--color-ink)]">
                100
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                Vectors<br/>per unit
              </p>
            </div>
            <div>
              <div className="folio-num text-[44px] text-[var(--color-ink)]">
                10
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                Pillars<br/>assessed
              </p>
            </div>
            <div>
              <div className="folio-num text-[44px] text-[var(--color-gold)]">
                24
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                Patent<br/>claims
              </p>
            </div>
          </div>

          <p className="mt-12 margin-note max-w-[380px]">
            Every assessment is auditable: every score, every note, every evidence link is stamped, addressable, and reproducible on demand.
          </p>
        </motion.div>

        {/* Bottom-right plate */}
        <div className="absolute bottom-8 right-12 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)] text-right leading-relaxed">
          Plate I<br/>
          <span className="italic font-display tracking-normal text-[12px]">compass rose</span>
        </div>
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
}) => (
  <div className="min-h-screen paper-grain">
    <HeaderBar
      crumb={<Eyebrow tone="ink">Operating Scope</Eyebrow>}
      right={
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end leading-tight">
            <span className="font-mono text-[12px] text-[var(--color-ink)]">{operatorEmail}</span>
            <Eyebrow className="mt-0.5">Operator</Eyebrow>
          </div>
          <button
            onClick={onLogout}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-coral)] cursor-pointer transition-colors"
            aria-label="Log out"
          >
            <X size={16} />
          </button>
        </div>
      }
    />

    <div className="max-w-[1440px] mx-auto px-10 py-14">
      {/* Editorial lede — 2-column */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14"
      >
        <div className="lg:col-span-7">
          <div className="chapter-mark mb-5">
            <span>Chapter II · Scope</span>
          </div>
          <h1 className="display-title text-[72px] text-[var(--color-ink)] leading-[0.96]">
            Choose the unit<br/>
            <span className="italic text-[var(--color-gold)]" style={{ fontWeight: 300 }}>to measure</span>
            <span className="text-[var(--color-ink)]">.</span>
          </h1>
          <p className="mt-6 text-[15px] text-[var(--color-ink-soft)] leading-[1.65] max-w-[580px]">
            Every operating unit runs a hundred-vector assessment and rolls up into a weighted pillar-dimension matrix. Results are benchmarked against Target, Industry, Peer, and External reference profiles.
          </p>
        </div>
        <div className="lg:col-span-5 lg:pt-8 lg:border-l hairline-gold lg:pl-10">
          <Eyebrow tone="amber">Run parameters</Eyebrow>
          <dl className="mt-5 space-y-4 text-[13px]">
            {[
              ["Units available", String(entities.length), "operating"],
              ["Vectors per unit", "100", "questions"],
              ["Pillars", "10", "ERM domains"],
              ["Dimensions", "4", "People · Process · Tech · Gov"],
              ["Benchmark profiles", "4", "Target · Industry · Peer · External"],
            ].map(([k, v, annot]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b hairline pb-3 last:border-0 last:pb-0">
                <dt>
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">{k}</div>
                  <div className="mt-1 editorial-italic text-[12px] text-[var(--color-ink-subtle)]">{annot}</div>
                </dt>
                <dd className="display-num text-[28px] text-[var(--color-ink)] tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.div>

      {/* Archive — past sessions for this operator. Always rendered so first-time
          users can see where their history will appear. */}
      <div className="mt-14 mb-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="display-heading text-[22px] text-[var(--color-ink)]">
            <span className="editorial-italic text-[var(--color-ink-muted)] mr-3">From the</span>
            Archive
          </h2>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
            {historyLoading
              ? "loading…"
              : history.length === 0
                ? "no sessions yet"
                : `${history.length} session${history.length === 1 ? "" : "s"} · newest first`}
          </div>
        </div>

        {historyLoading ? (
          <div className="border-t border-b hairline py-12 text-center">
            <p className="editorial-italic text-[14px] text-[var(--color-ink-muted)]">
              Retrieving your past sessions…
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="border-t border-b hairline py-12 px-6 flex items-start gap-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0 mt-1" aria-hidden>
              <rect x="6" y="8" width="28" height="24" rx="2" stroke="var(--color-gold)" strokeWidth="1" opacity="0.6" />
              <path d="M6 14 L34 14" stroke="var(--color-gold)" strokeWidth="1" opacity="0.6" />
              <path d="M12 20 L28 20 M12 24 L24 24" stroke="var(--color-ink-muted)" strokeWidth="1" />
            </svg>
            <div className="flex-1">
              <p className="display-heading text-[18px] text-[var(--color-ink)]">
                <span className="editorial-italic text-[var(--color-ink-muted)]">A blank page,</span> for now.
              </p>
              <p className="mt-2 text-[13px] text-[var(--color-ink-soft)] leading-relaxed max-w-[560px]">
                Your completed assessments will stamp here — each one with its score, operating unit, and a transaction ID. Complete an assessment below to begin your archive and unlock drift detection across future runs.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-t hairline">
              {history.slice(0, 8).map(item => {
                const d = new Date(item.createdAt);
                const when = d.toLocaleString(undefined, {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "numeric", minute: "2-digit",
                });
                const score = typeof item.overallScore === "number" ? item.overallScore.toFixed(2) : "—";
                return (
                  <button
                    key={item.id}
                    onClick={() => onOpenHistorical(item)}
                    className="w-full border-b hairline py-5 px-2 flex items-center gap-6 text-left group cursor-pointer hover:bg-[var(--color-surface-soft)]/60 transition-colors"
                  >
                    <div className="w-[80px] flex-shrink-0">
                      <div className="folio-num text-[32px] text-[var(--color-ink)] leading-none">
                        {score}
                      </div>
                      <div className="mt-1 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                        / 5.00
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="display-heading text-[20px] text-[var(--color-ink)]">
                          {item.entityName}
                        </h3>
                        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                          {item.entityId}
                        </span>
                      </div>
                      <p className="mt-1 editorial-italic text-[12px] text-[var(--color-ink-muted)]">
                        {when} · transaction <span className="font-mono tracking-wide">{item.id}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors">
                      <span>Open</span>
                      <ArrowUpRight size={12} className="ease-premium transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
            {history.length > 8 && (
              <p className="mt-3 font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-subtle)]">
                showing 8 of {history.length} · older entries available via command palette
              </p>
            )}
          </>
        )}
      </div>

      <OrnamentalRule color="gold" />

      <div className="mt-10 flex items-baseline justify-between mb-8">
        <h2 className="display-heading text-[22px] text-[var(--color-ink)]">
          <span className="editorial-italic text-[var(--color-ink-muted)] mr-3">Table of</span>
          Operating Units
        </h2>
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
          {entities.length} entries · all ready
        </div>
      </div>

      {/* Editorial chapter list — BU glyph + name; code in display serif as folio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
        {entities.map((bu, idx) => (
          <motion.button
            key={bu.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onSelect(bu)}
            className="text-left group relative cursor-pointer border-b hairline py-7 px-2 hover:bg-[var(--color-surface-soft)]/60 transition-colors"
          >
            <div className="flex items-start gap-6">
              {/* Glyph column */}
              <div className="flex flex-col items-center justify-start pt-2 w-[56px] flex-shrink-0">
                <div className="w-[48px] h-[48px] rounded-full border hairline-strong flex items-center justify-center group-hover:border-[var(--color-ink)] ease-premium transition-colors">
                  <BuGlyph id={bu.id} size={26} />
                </div>
                <span className="mt-3 font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
                  {bu.id}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3">
                  <h3 className="display-heading text-[32px] text-[var(--color-ink)] leading-tight">
                    {bu.name}
                  </h3>
                  <span className="editorial-italic text-[14px] text-[var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
                    →
                  </span>
                </div>
                <p className="mt-1.5 editorial-italic text-[13px] text-[var(--color-ink-muted)] truncate">
                  {bu.industry}
                </p>

                <div className="mt-5 pt-4 border-t hairline flex items-center justify-between">
                  <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.22em] uppercase">
                    <StatusDot color="mint" />
                    <span className="text-[var(--color-mint)]">Ready</span>
                    <span className="text-[var(--color-ink-subtle)]">·</span>
                    <span className="text-[var(--color-ink-muted)]">100 vectors</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors">
                    <span className="font-mono text-[10px] tracking-[0.22em] uppercase">
                      Begin assessment
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="ease-premium transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>

    <RunningFooter folio="Scope · Folio II" />
  </div>
);

// ─── QUESTIONNAIRE ─────────────────────────────────────────────────────────

const VectorCapturePipeline = ({ questions, pillars, bu, onComplete, onBack }: any) => {
  const [currIdx, setCurrIdx] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [evidenceNames, setEvidenceNames] = useState<Record<number, string>>({});
  const [answeredAt, setAnsweredAt] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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
    if (currIdx < questions.length - 1) {
      setTimeout(() => setCurrIdx(currIdx + 1), 160);
    } else if (Object.keys(newR).length === questions.length) {
      setShowSummary(true);
    }
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
      <div className="min-h-screen paper-grain">
        <HeaderBar
          crumb={
            <div className="flex items-center gap-3">
              <Eyebrow>Unit</Eyebrow>
              <span className="font-mono text-[12px] text-[var(--color-ink)]">{bu.name}</span>
              <ChevronRight size={12} className="text-[var(--color-ink-muted)]" />
              <Eyebrow tone="ink">Summary</Eyebrow>
            </div>
          }
        />
        <div className="max-w-[1100px] mx-auto px-10 py-14">
          <div className="chapter-mark mb-5">
            <span>Chapter III · Summary</span>
          </div>
          <h1 className="display-title text-[56px] text-[var(--color-ink)]">
            All vectors <span className="italic text-[var(--color-gold)]" style={{ fontWeight: 300 }}>captured</span>.
          </h1>
          <p className="mt-5 text-[15px] text-[var(--color-ink-soft)] max-w-[640px] leading-[1.65]">
            Review your coverage below. Finalizing triggers the scoring engine, drift detection, and roadmap sequencer in turn.
          </p>

          <OrnamentalRule color="gold" />

          <div className="mt-10 mb-8 flex items-baseline justify-between">
            <h2 className="display-heading text-[20px] text-[var(--color-ink)]">
              <span className="editorial-italic text-[var(--color-ink-muted)] mr-2">Per-pillar</span>
              Coverage
            </h2>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
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
              className="btn-accent flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
      {/* Sidebar */}
      <aside className="w-80 border-r hairline bg-[var(--color-surface-soft)] flex flex-col">
        <div className="p-6 border-b hairline">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-mono text-[10px] uppercase tracking-[0.22em] transition-colors mb-5 cursor-pointer"
            aria-label="Back to operating scope"
          >
            <ArrowLeft size={12} /> Back to scope
          </button>
          <Eyebrow>Assessing</Eyebrow>
          <p className="display-heading text-[22px] text-[var(--color-ink)] mt-2">{bu.name}</p>

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
      <main className="flex-1 overflow-y-auto paper-grain">
        <div className="max-w-[820px] mx-auto px-12 py-16">
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <Pill tone="amber">{currentPillar?.name}</Pill>
            <Pill tone="ink">{currentQ.dimensionId}</Pill>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.22em] uppercase">
              Vector {currIdx + 1} / {questions.length}
            </span>
          </div>

          <motion.h2
            key={currentQ.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="display-title text-[42px] text-[var(--color-ink)] leading-[1.1]"
          >
            {currentQ.text}
          </motion.h2>

          <div className="mt-12">
            <Eyebrow>Maturity level · 1 Ad-hoc ⇢ 5 Optimized</Eyebrow>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[1, 2, 3, 4, 5].map(score => {
                const selected = responses[currentQ.id] === score;
                const labels = ["Ad-hoc", "Partial", "Defined", "Managed", "Optimized"];
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`aspect-[4/3] flex flex-col items-center justify-center border rounded-[10px] transition-all cursor-pointer ${
                      selected
                        ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-highlight)] shadow-[0_4px_12px_rgba(15,42,27,0.22)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink)] hover:-translate-y-0.5"
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    <span className={`display-num text-[32px] ${selected ? "" : "text-[var(--color-ink)]"}`}>
                      {score}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.22em] mt-1 ${
                      selected ? "text-[var(--color-highlight)]/80" : "text-[var(--color-ink-muted)]"
                    }`}>
                      {labels[score - 1]}
                    </span>
                  </button>
                );
              })}
            </div>
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
  assessmentId,
  operatorEmail,
}: any) => {
  type SortKey = "priority" | "uplift" | "phase";
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const {
    analytics,
    dimensions,
    driftProfile,
    regressions,
    roadmap,
    overallScore,
    systemIntegrity,
    entityName,
    criticalRegressionsCount,
    activeRoadmapCount,
    benchmarkAverage,
    averageGap,
    responseSummary,
    missionStatus,
  } = analysis;

  const radarData = useMemo(
    () => analytics.map((a: any) => ({ pillar: a.pillarName, score: a.score, target: a.target, fullMark: 5 })),
    [analytics],
  );
  const barData = useMemo(
    () =>
      analytics.map((a: any) => ({
        pillar: a.pillarName.split(/[\s&]+/)[0].slice(0, 8),
        score: a.score,
        benchmark: a.target,
      })),
    [analytics],
  );
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

  return (
    <div className="min-h-screen paper-grain">
      <HeaderBar
        crumb={
          <div className="flex items-center gap-3">
            <Eyebrow>Unit</Eyebrow>
            <select
              value={bu.id}
              onChange={e => onEntityChange(allBUs.find((b: any) => b.id === e.target.value))}
              className="bg-transparent font-mono text-[12px] text-[var(--color-ink)] outline-none border-b hairline hover:border-[var(--color-ink)] cursor-pointer py-1 pr-2 appearance-none transition-colors"
            >
              {allBUs.map((b: any) => (
                <option key={b.id} value={b.id} className="bg-[var(--color-surface)]">
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronRight size={12} className="text-[var(--color-ink-muted)]" />
            <Eyebrow tone="ink">Command Center</Eyebrow>
          </div>
        }
        right={
          <div className="flex items-center gap-4">
            <Pill tone={status.tone}>
              <StatusDot color={status.dot} /> {status.label}
            </Pill>
            <button
              onClick={onOpenPalette}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border hairline text-[11px] font-mono tracking-[0.14em] uppercase text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
              aria-label="Open command palette"
            >
              <CommandIcon size={12} />
              <span>K</span>
            </button>
            <button
              onClick={() => {
                if (!assessmentId) return;
                const url = `/api/assessments/${assessmentId}/pdf?benchmarkType=${benchmarkType}`;
                window.open(url, "_blank");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border hairline text-[11px] font-mono tracking-[0.14em] uppercase text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
              aria-label="Download executive PDF report"
            >
              <FileDown size={12} />
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
        }
      />

      <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-6 pb-24">
        {/* Top HUD — editorial masthead */}
        <Card severity={status.tone === "mint" ? "none" : status.tone} className="p-10">
          <div className="flex items-start justify-between gap-10 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <Eyebrow>Active unit · {BENCHMARK_LABEL[benchmarkType]}</Eyebrow>
              <div className="flex items-baseline gap-4 mt-3">
                <h1 className="display-title text-[56px] text-[var(--color-ink)]">
                  {entityName}
                </h1>
                <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular">
                  {bu.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-6 flex-wrap">
                <Eyebrow>Benchmark</Eyebrow>
                <Tabs value={benchmarkType} onValueChange={onBenchmarkTypeChange}>
                  <TabsList>
                    {benchmarkTypes.map((t: string) => (
                      <TabsTrigger key={t} value={t}>{BENCHMARK_LABEL[t] || t}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="flex items-stretch gap-10 flex-wrap">
              <UiTooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col justify-between cursor-help">
                    <Eyebrow tone="amber">Maturity score</Eyebrow>
                    <div className="display-num text-[96px] text-[var(--color-ink)] leading-none mt-3">
                      {overallScore.toFixed(2)}
                    </div>
                    <span className="font-mono text-[11px] text-[var(--color-ink-muted)] mt-2 tracking-wide uppercase">
                      of 5.00 · overall
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Weighted average of 10 pillars · each rolled up from 4-dimension × 10-question cells.
                </TooltipContent>
              </UiTooltip>
              <div className="w-px bg-[var(--color-border)]" />
              <div className="flex flex-col gap-5 justify-between min-w-[140px]">
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help"><Metric label="Benchmark avg" value={benchmarkAverage.toFixed(2)} unit="/ 5" size="sm" /></div>
                  </TooltipTrigger>
                  <TooltipContent side="left">{BENCHMARK_LABEL[benchmarkType]} profile average across all 10 pillars.</TooltipContent>
                </UiTooltip>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <Metric
                        label="Aligned pillars"
                        value={`${alignedCount}`}
                        unit="/ 10"
                        size="sm"
                        tone={alignedCount >= 7 ? "mint" : alignedCount >= 4 ? "amber" : "coral"}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">Pillars scoring at or above the active benchmark.</TooltipContent>
                </UiTooltip>
                <UiTooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help"><Metric label="Active roadmap" value={activeRoadmapCount} unit="actions" size="sm" /></div>
                  </TooltipTrigger>
                  <TooltipContent side="left">Sequenced by expected uplift ÷ (cost × duration).</TooltipContent>
                </UiTooltip>
              </div>
            </div>
          </div>
        </Card>

        {/* Pillar grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Pillar vectors</Eyebrow>
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular uppercase tracking-[0.18em]">
              Current vs {(BENCHMARK_LABEL[benchmarkType] || benchmarkType).toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analytics.map((a: any) => {
              const above = a.score >= a.target;
              const near = a.score >= a.target * 0.8;
              const sev = above ? "mint" : near ? "amber" : "coral";
              return (
                <Card key={a.pillarId} severity={sev} variant="flat" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Eyebrow>{a.pillarName.split(/[\s&]+/)[0].slice(0, 6).toUpperCase()}</Eyebrow>
                    <StatusDot color={sev as any} />
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-muted)] leading-tight mb-3 h-8">
                    {a.pillarName}
                  </p>
                  <div className="display-num text-[26px] text-[var(--color-ink)]">
                    {a.score.toFixed(2)}
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] tabular">
                    <span className="text-[var(--color-ink-muted)]">Δ</span>
                    <span className={a.gap > 0 ? "delta-down" : "delta-up"}>
                      {a.gap > 0 ? `-${a.gap.toFixed(2)}` : "aligned"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-5 p-7">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Eyebrow tone="amber">Pillar scope</Eyebrow>
                <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
                  Maturity vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tabular tracking-[0.18em] uppercase">10 × 5</span>
            </div>
            <div className="h-[340px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                  <PolarGrid stroke={CHART.grid} />
                  <PolarAngleAxis
                    dataKey="pillar"
                    stroke={CHART.axis}
                    tick={{ fill: CHART.axisLabel, fontSize: 9, fontFamily: "Inter" }}
                  />
                  <PolarRadiusAxis stroke={CHART.axis} tick={false} axisLine={false} domain={[0, 5]} />
                  <Radar
                    name="Current"
                    dataKey="score"
                    stroke={CHART.primary}
                    fill={CHART.primary}
                    fillOpacity={0.14}
                    strokeWidth={2}
                    dot={{ fill: CHART.primary, r: 3 }}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="target"
                    stroke={CHART.accent}
                    fill="transparent"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 pt-4 border-t hairline">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[var(--color-ink)]" />
                <span className="text-[11px] text-[var(--color-ink-soft)]">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 border-t border-dashed border-[var(--color-gold)]" />
                <span className="text-[11px] text-[var(--color-ink-soft)]">
                  {BENCHMARK_LABEL[benchmarkType] || benchmarkType}
                </span>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-4 p-7">
            <div>
              <Eyebrow tone="amber">Operating dimensions</Eyebrow>
              <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
                People · Process · Technology · Governance
              </h3>
            </div>
            <div className="space-y-6 mt-7">
              {dimensions.map((d: any) => {
                const pct = (d.score / 5) * 100;
                const above = d.score >= 4.0;
                return (
                  <div key={d.id} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[13px] font-medium text-[var(--color-ink)]">
                        {d.name}
                      </span>
                      <span className={`display-num text-[20px] ${above ? "text-[var(--color-gold)]" : "text-[var(--color-ink)]"}`}>
                        {d.score.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={pct} accent={above ? "mint" : "ink"} />
                  </div>
                );
              })}
            </div>
            <div className="mt-7 pt-5 border-t hairline grid grid-cols-2 gap-4">
              <div>
                <Eyebrow>Avg gap</Eyebrow>
                <p className="mt-1 display-num text-[18px] text-[var(--color-coral)]">
                  {averageGap.toFixed(2)}
                </p>
              </div>
              <div>
                <Eyebrow>Integrity</Eyebrow>
                <p className="mt-1 display-num text-[18px] text-[var(--color-mint)]">
                  {systemIntegrity}%
                </p>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-3 flex flex-col gap-5">
            <Card severity={regressions.length > 0 ? "coral" : "none"} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Eyebrow tone="amber">Drift signal</Eyebrow>
                <StatusDot color={regressions.length > 0 ? "coral" : "mint"} />
              </div>
              <div className="h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={driftProfile}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="pillar" hide />
                    <YAxis stroke={CHART.axis} tick={{ fontSize: 9, fontFamily: "Inter", fill: CHART.axisLabel }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                    <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="2 2" />
                    <Line
                      type="step"
                      dataKey="delta"
                      stroke={CHART.accent}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART.accent }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-3 border-t hairline flex justify-between text-[11px]">
                <span className="text-[var(--color-ink-muted)]">vs prior baseline</span>
                <span className={regressions.length > 0 ? "delta-down" : "delta-up"}>
                  {regressions.length} signals
                </span>
              </div>
            </Card>

            <Card className="p-5 flex-1">
              <Eyebrow className="mb-3 block">Response coverage</Eyebrow>
              <div className="space-y-3">
                {[
                  ["Vectors", `${responseSummary.totalResponses}/100`],
                  ["Evidence", String(responseSummary.evidenceCount)],
                  ["Notes", String(responseSummary.noteCount)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px] pb-2 border-b hairline last:border-0 last:pb-0">
                    <span className="font-mono text-[var(--color-ink-muted)] tracking-wide">{k}</span>
                    <span className="text-[var(--color-ink)] tabular">{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Eyebrow tone="amber">Pillar delta</Eyebrow>
              <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
                Current vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType} by pillar
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.18em] uppercase">
              Avg {benchmarkAverage.toFixed(2)}
            </span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="pillar"
                  stroke={CHART.axis}
                  tick={{ fontSize: 10, fontFamily: "Inter", fill: CHART.axisLabel }}
                  tickLine={false}
                  axisLine={{ stroke: CHART.grid }}
                />
                <YAxis
                  domain={[0, 5]}
                  stroke={CHART.axis}
                  tick={{ fontSize: 10, fontFamily: "Inter", fill: CHART.axisLabel }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(200,161,75,0.08)" }} />
                <Bar dataKey="score" fill={CHART.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" fill={CHART.accent} opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pillar evolution — historical trend across past assessments */}
        <TrendChart entityId={bu.id} operatorEmail={operatorEmail} benchmarkType={benchmarkType} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div className="px-7 py-5 border-b hairline flex items-center justify-between">
              <div>
                <Eyebrow tone="amber">Sequencing</Eyebrow>
                <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
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

          <Card severity={criticalRegressionsCount > 0 ? "coral" : "none"} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Eyebrow tone="amber">Regression alerts</Eyebrow>
              {criticalRegressionsCount > 0 && <StatusDot color="coral" />}
            </div>
            {regressions.length > 0 ? (
              <div className="space-y-2">
                {regressions.slice(0, 6).map((r: any, i: number) => (
                  <div
                    key={i}
                    className="border hairline p-3 rounded-[8px] flex items-center justify-between hover:border-[var(--color-coral)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-0.5 h-5 rounded-full ${r.severity === "CRITICAL" ? "bg-[var(--color-coral)]" : "bg-[var(--color-gold)]"}`}
                      />
                      <div>
                        <p className="text-[12px] text-[var(--color-ink)] font-medium">
                          {r.pillarName}
                        </p>
                        <p className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-wide uppercase">
                          {r.severity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[12px] text-[var(--color-coral)] tabular">
                      {r.delta.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShieldCheck size={28} className="mx-auto text-[var(--color-mint)] mb-3" />
                <p className="text-[11px] text-[var(--color-ink-muted)] font-mono tracking-[0.22em] uppercase">
                  All pillars nominal
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      <RunningFooter folio="Command · Folio IV" />
    </div>
  );
};

// ─── APP SHELL ─────────────────────────────────────────────────────────────

type Screen = "login" | "scope" | "assessment" | "navigator";

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

  const handleEntitySelect = (bu: any) => {
    setAssessmentId(generateAssessmentId());
    setSelectedBU(bu);
    setScreen("assessment");
  };

  const fetchAnalysis = async (aid: string, bType = benchmarkType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/${aid}/analysis?benchmarkType=${bType}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  return (
    <TooltipProvider delayDuration={120}>
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {screen === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />
          </motion.div>
        )}
        {screen === "scope" && (
          <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <ScopeScreen
              entities={entities}
              onSelect={handleEntitySelect}
              operatorEmail={loginEmail}
              onLogout={() => { setHistory([]); setScreen("login"); }}
              history={history}
              historyLoading={historyLoading}
              onOpenHistorical={openHistoricalAssessment}
            />
          </motion.div>
        )}
        {screen === "assessment" && (
          <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <VectorCapturePipeline
              bu={selectedBU}
              questions={metadata.questions}
              pillars={metadata.pillars}
              onBack={() => setScreen("scope")}
              onComplete={handleAssessmentComplete}
            />
          </motion.div>
        )}
        {screen === "navigator" && analysis && (
          <motion.div key="navigator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
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
              assessmentId={assessmentId}
              operatorEmail={loginEmail}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)] w-12">{b.id}</span>
                <span className="flex-1">{b.name}</span>
                <span className="editorial-italic text-[12px] text-[var(--color-ink-muted)]">{b.industry}</span>
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
