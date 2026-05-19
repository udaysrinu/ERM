import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Command as CommandIcon,
  FileDown,
  LogOut,
  Minimize2,
  Search,
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
  Area,
  AreaChart,
} from "recharts";
import {
  AnimatedNumber,
  Brand,
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

// Recharts theme — Runway palette: ink primary data, gold accent, hairline grid
const CHART = {
  grid: "rgba(26, 25, 21, 0.06)",
  axis: "rgba(26, 25, 21, 0.28)",
  axisLabel: "rgba(26, 25, 21, 0.52)",
  ink: "#1A1915",
  gold: "#C89A3E",
  mint: "#2E6B48",
  coral: "#A64226",
  sky: "#1E4D73",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(26, 25, 21, 0.12)",
  borderRadius: 6,
  padding: "8px 12px",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  color: "#1A1915",
  boxShadow: "0 4px 12px rgba(26,25,21,.06), 0 12px 32px rgba(26,25,21,.08)",
} as const;

// ─── ASSISTANT ─────────────────────────────────────────────────────────────
// `getAssistantReply` is implemented in ./lib/assistant.ts (deterministic, testable).

const NavigatorAssistant = ({ analysis }: { analysis?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
        className="fixed bottom-6 right-6 w-11 h-11 bg-[var(--color-ink)] text-[var(--color-highlight)] flex items-center justify-center rounded-full shadow-[0_6px_18px_rgba(26,25,21,0.22)] hover:scale-105 ease-premium transition-transform z-[100] cursor-pointer"
        aria-label="Open assistant"
      >
        <Sparkles size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-6 w-[380px] h-[520px] card flex flex-col overflow-hidden z-[101]"
          >
            <div className="px-4 py-3 border-b hairline flex items-center justify-between bg-[var(--color-surface-soft)]">
              <div className="flex items-center gap-2.5">
                <StatusDot color="amber" />
                <span className="eyebrow-amber">Navigator Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer" aria-label="Close">
                <Minimize2 size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <p className="text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
                    Ask about scoring, benchmark profiles, drift signals, roadmap sequencing, or response coverage.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["weakest gap", "drift status", "top action"].map(p => (
                      <button
                        key={p}
                        onClick={() => { setInput(p); setTimeout(handleSend, 0); }}
                        className="px-2.5 py-1 border hairline rounded-full text-[11px] font-mono text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 max-w-[85%] text-[13px] leading-relaxed rounded-[8px] ${
                    m.role === "user"
                      ? "bg-[var(--color-ink)] text-[var(--color-surface)]"
                      : "bg-[var(--color-surface-soft)] text-[var(--color-ink)]"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2"><StatusDot color="amber" /><span className="eyebrow-amber">thinking</span></div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t hairline flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="input-bare py-1.5"
                placeholder="Ask about your maturity…"
              />
              <button onClick={handleSend} className="text-[var(--color-ink)] hover:opacity-70 cursor-pointer" aria-label="Send">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────
// Editorial two-column — left: credential form with gold CTA, right: decorative
// compass + ISO 31000 pull-quote + folio stats. The one surface where pure
// atmosphere beats dense data.

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
    <div className="min-h-screen flex items-stretch overflow-hidden relative">
      {/* Masthead edge */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="max-w-[1440px] mx-auto px-10 pt-6 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)]">
          <span>ERM Navigator · Volume I</span>
          <span>No. 001 · MMXXVI</span>
        </div>
      </div>

      {/* Left — credentials */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16 relative z-10 bg-[var(--color-bg)]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="flex items-center gap-2.5 mb-10">
            <BrandMark size={22} />
            <div className="flex flex-col leading-none">
              <span className="wordmark text-[16px] text-[var(--color-ink)]">ERM Navigator</span>
              <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--color-ink-muted)] mt-1.5 uppercase">
                Risk Maturity Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="w-6 h-px bg-[var(--color-gold-line)]" />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)]">
              Chapter I · Entry
            </span>
          </div>

          <h1 className="display-heading text-[44px] text-[var(--color-ink)] leading-[1.02]" style={{ letterSpacing: "-0.02em" }}>
            The risk navigator.
          </h1>

          <p className="mt-4 text-[14px] text-[var(--color-ink-soft)] leading-[1.55] max-w-[360px]">
            An auditable maturity platform for enterprise risk programs. Aligned to ISO&nbsp;31000, COSO&nbsp;ERM, and NIST&nbsp;RMF.
          </p>

          <div className="mt-5 flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)]">
            <span>ISO 31000</span>
            <span className="text-[var(--color-gold)]">·</span>
            <span>COSO ERM</span>
            <span className="text-[var(--color-gold)]">·</span>
            <span>NIST RMF</span>
          </div>

          <div className="mt-10 space-y-4">
            <div>
              <label className="block eyebrow mb-2">Email · operator</label>
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
              <label className="block eyebrow mb-2">Passphrase</label>
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
                className="border hairline stripe-coral py-2.5 px-3 rounded-[6px] bg-[var(--color-coral-soft)]"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-[var(--color-coral)]" />
                  <span className="text-[12px] text-[var(--color-coral)]">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing in…" : "Enter the navigator"}
              {!loading && <ArrowRight size={14} />}
            </button>

            <div className="pt-5 border-t hairline flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-muted)] tracking-[0.14em] uppercase">
              <span>Demo · any @gmail</span>
              <div className="flex items-center gap-1.5">
                <StatusDot color="mint" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right — editorial pane */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center px-16"
           style={{ background: "linear-gradient(180deg, #EEE9DC 0%, #E3DFD5 100%)" }}>
        {/* Oversized compass watermark */}
        <svg
          viewBox="0 0 400 400"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] pointer-events-none"
          style={{ animation: "slow-drift 28s ease-in-out infinite" }}
          aria-hidden
        >
          <g stroke="rgba(38, 27, 7, 0.10)" strokeWidth="0.5" fill="none">
            {[60, 110, 160, 200].map(r => (
              <circle key={r} cx="200" cy="200" r={r} />
            ))}
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i * 22.5 * Math.PI) / 180;
              const x1 = 200 + Math.cos(a) * 170;
              const y1 = 200 + Math.sin(a) * 170;
              const x2 = 200 + Math.cos(a) * 200;
              const y2 = 200 + Math.sin(a) * 200;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(249, 166, 0, 0.40)" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(249, 166, 0, 0.40)" />
          </g>
          <path
            d="M200 90 L214 170 L290 140 L230 200 L290 260 L214 230 L200 310 L186 230 L110 260 L170 200 L110 140 L186 170 Z"
            fill="rgba(249, 166, 0, 0.12)"
            stroke="rgba(249, 166, 0, 0.55)"
            strokeWidth="1"
          />
          <g fontFamily="Fraunces, serif" fontSize="14" fontStyle="italic" fill="rgba(38, 27, 7, 0.44)">
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
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-gold)] mb-4">
            From the editor's desk
          </div>

          <figure className="pl-5 border-l-2 relative" style={{ borderColor: "var(--color-gold)" }}>
            <span
              className="absolute font-serif text-[72px] leading-[0.8] text-[var(--color-gold)] opacity-40 pointer-events-none"
              style={{ top: "-10px", left: "4px", fontFamily: "Fraunces, serif" }}
              aria-hidden
            >
              “
            </span>
            <blockquote
              className="font-serif text-[21px] leading-[1.4] text-[var(--color-ink)]"
              style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.015em" }}
            >
              Risk management should be an integral part of all organizational activities — dynamic, iterative, and responsive to change, informed by the best available information.
            </blockquote>
            <figcaption className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] mt-4">
              — ISO 31000 · 2018 · clause 5.4
            </figcaption>
          </figure>

          <div
            className="mt-10 grid grid-cols-3 gap-6 pt-5"
            style={{ borderTop: "1px solid var(--color-gold-line)" }}
          >
            <div>
              <div
                className="text-[40px] text-[var(--color-ink)] leading-none"
                style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.02em" }}
              >
                100
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] leading-[1.5]">
                Vectors<br/>per unit
              </p>
            </div>
            <div>
              <div
                className="text-[40px] text-[var(--color-ink)] leading-none"
                style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.02em" }}
              >
                10
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] leading-[1.5]">
                Pillars<br/>assessed
              </p>
            </div>
            <div>
              <div
                className="text-[40px] text-[var(--color-gold)] leading-none"
                style={{ fontFamily: "Fraunces, serif", fontWeight: 300, fontStyle: "italic", letterSpacing: "-0.02em" }}
              >
                24
              </div>
              <p className="mt-2 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] leading-[1.5]">
                Patent<br/>claims
              </p>
            </div>
          </div>

          <p
            className="mt-10 text-[13px] leading-[1.55] text-[var(--color-ink-soft)] max-w-[400px]"
            style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 300 }}
          >
            Every assessment is auditable: every score, every note, every evidence link is stamped, addressable, and reproducible on demand.
          </p>
        </motion.div>

        {/* Plate mark */}
        <div className="absolute bottom-6 right-10 font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] text-right leading-relaxed">
          Plate I<br/>
          <span style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontSize: "12px", letterSpacing: 0 }}>
            compass rose
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR SHELL ─────────────────────────────────────────────────────────
// Persistent left rail. Once authed, every screen renders inside this.

const Sidebar = ({
  entities,
  activeBU,
  onSelectBU,
  operatorEmail,
  onLogout,
  onOpenPalette,
  history,
  current,
}: {
  entities: any[];
  activeBU: any;
  onSelectBU: (bu: any) => void;
  operatorEmail: string;
  onLogout: () => void;
  onOpenPalette: () => void;
  history: any[];
  current: "scope" | "assessment" | "navigator";
}) => (
  <aside className="w-[240px] flex-shrink-0 border-r hairline bg-[var(--color-surface-soft)] flex flex-col">
    {/* Brand */}
    <div className="px-4 py-4 border-b hairline">
      <div className="flex items-center gap-2.5">
        <BrandMark size={20} />
        <span className="wordmark text-[14px] text-[var(--color-ink)]">ERM Navigator</span>
      </div>
    </div>

    {/* Command palette trigger */}
    <button
      onClick={onOpenPalette}
      className="mx-3 mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-[6px] border hairline text-[12px] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-2">
        <Search size={12} />
        <span>Search</span>
      </div>
      <div className="flex items-center gap-0.5">
        <Keycap>⌘</Keycap><Keycap>K</Keycap>
      </div>
    </button>

    {/* BU list */}
    <div className="px-3 mt-5">
      <div className="px-1 mb-2 flex items-baseline justify-between">
        <Eyebrow>Operating units</Eyebrow>
        <span className="font-mono text-[9px] text-[var(--color-ink-muted)] tabular">{entities.length}</span>
      </div>
      <div className="space-y-0.5">
        {entities.map(bu => {
          const active = activeBU?.id === bu.id;
          return (
            <button
              key={bu.id}
              onClick={() => onSelectBU(bu)}
              className={`nav-item ${active ? "nav-item-active" : ""}`}
            >
              <BuGlyph id={bu.id} size={14} />
              <span className="flex-1 truncate">{bu.name}</span>
              <span className="font-mono text-[9px] text-[var(--color-ink-subtle)] tracking-[0.12em] uppercase">{bu.id}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Archive */}
    <div className="px-3 mt-6 flex-1 overflow-y-auto custom-scrollbar">
      <div className="px-1 mb-2 flex items-baseline justify-between">
        <Eyebrow>Archive</Eyebrow>
        <span className="font-mono text-[9px] text-[var(--color-ink-muted)] tabular">{history.length}</span>
      </div>
      {history.length === 0 ? (
        <p className="px-1 text-[11px] text-[var(--color-ink-subtle)] leading-relaxed">
          Past sessions will collect here as you finalize assessments.
        </p>
      ) : (
        <div className="space-y-0.5">
          {history.slice(0, 12).map(item => {
            const d = new Date(item.createdAt);
            const when = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            const score = typeof item.overallScore === "number" ? item.overallScore.toFixed(2) : "—";
            return (
              <button
                key={item.id}
                onClick={() => {/* handled via onSelectBU/palette */}}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-[5px] hover:bg-[var(--color-surface-hover)] cursor-pointer transition-colors"
                title={`${item.entityName} · ${when}`}
              >
                <span className="display-num text-[13px] tabular text-[var(--color-ink)] w-[36px]">{score}</span>
                <span className="flex-1 text-[11px] truncate text-[var(--color-ink-soft)]">{item.entityName}</span>
                <span className="font-mono text-[9px] text-[var(--color-ink-subtle)]">{when}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>

    {/* Operator footer */}
    <div className="px-3 py-3 border-t hairline">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-highlight)] flex items-center justify-center text-[11px] font-medium uppercase flex-shrink-0">
          {operatorEmail.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-[var(--color-ink)] truncate">{operatorEmail}</div>
          <div className="eyebrow mt-0.5">Operator</div>
        </div>
        <button
          onClick={onLogout}
          className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors p-1"
          aria-label="Log out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  </aside>
);

// ─── SCOPE ─────────────────────────────────────────────────────────────────
// With the sidebar present, scope is now a short "start" canvas.

const ScopeScreen = ({
  entities,
  onSelect,
  history,
  onOpenHistorical,
}: {
  entities: any[];
  onSelect: (bu: any) => void;
  history: any[];
  onOpenHistorical: (item: any) => void;
}) => (
  <div className="flex-1 overflow-y-auto">
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <Eyebrow>Overview</Eyebrow>
      <h1 className="mt-2 display-heading text-[32px] text-[var(--color-ink)] tracking-tight">
        Choose an operating unit to measure.
      </h1>
      <p className="mt-2 text-[14px] text-[var(--color-ink-soft)] max-w-[580px]">
        Every unit runs a 100-vector assessment and rolls up into a weighted pillar-dimension matrix, benchmarked against four reference profiles.
      </p>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
        {entities.map((bu, idx) => (
          <motion.button
            key={bu.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onSelect(bu)}
            className="card p-5 text-left cursor-pointer ease-premium transition-all group relative overflow-hidden hover:-translate-y-[1px]"
            style={{ transitionDuration: "200ms" }}
          >
            {/* Pastel tint header — Runway-style color-per-card */}
            <div
              className="absolute inset-x-0 top-0 h-[76px] pointer-events-none"
              style={{ background: `var(--bu-tint-${bu.id}, var(--color-surface-soft))` }}
              aria-hidden
            />
            <div className="relative flex items-start justify-between mb-10">
              <div
                className="w-10 h-10 rounded-[7px] flex items-center justify-center text-[var(--color-ink)] bg-[var(--color-surface)] border hairline"
                style={{ boxShadow: "0 1px 2px rgba(38,27,7,0.06)" }}
              >
                <BuGlyph id={bu.id} size={18} />
              </div>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-ink-soft)] bg-[var(--color-surface)]/60 px-1.5 py-0.5 rounded-[3px]">
                {bu.id}
              </span>
            </div>
            <div className="relative">
              <h3 className="display-heading text-[17px] text-[var(--color-ink)]">{bu.name}</h3>
              <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{bu.industry}</p>
              <div className="mt-5 pt-3 border-t hairline flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <StatusDot color="mint" />
                  <span className="text-[var(--color-mint)] font-mono tracking-[0.12em] uppercase text-[10px]">Ready</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase">100 vectors</span>
                  <ArrowUpRight size={12} className="ease-premium transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent sessions (if any) — compact row list */}
      {history.length > 0 && (
        <div className="mt-14">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <Eyebrow>Recent sessions</Eyebrow>
              <h2 className="mt-1.5 display-heading text-[18px] text-[var(--color-ink)]">Your archive</h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-ink-muted)]">{history.length} total</span>
          </div>
          <Card className="overflow-hidden">
            {history.slice(0, 5).map((item, idx) => {
              const d = new Date(item.createdAt);
              const when = d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
              const score = typeof item.overallScore === "number" ? item.overallScore.toFixed(2) : "—";
              return (
                <button
                  key={item.id}
                  onClick={() => onOpenHistorical(item)}
                  className={`w-full px-5 py-3.5 flex items-center gap-5 text-left hover:bg-[var(--color-surface-soft)] cursor-pointer transition-colors ${idx > 0 ? "border-t hairline" : ""}`}
                >
                  <span className="display-num text-[20px] tabular text-[var(--color-ink)] w-[52px]">{score}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--color-ink)]">{item.entityName}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-muted)] tracking-wide">
                      {when} · <span className="tabular">{item.id}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-[var(--color-ink-muted)]" />
                </button>
              );
            })}
          </Card>
        </div>
      )}
    </div>
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
      setTimeout(() => setCurrIdx(currIdx + 1), 140);
    } else if (Object.keys(newR).length === questions.length) {
      setShowSummary(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try { await onComplete({ responses, notes, evidenceNames, answeredAt }); }
    catch { alert("Assessment submission failed."); }
    finally { setIsSubmitting(false); }
  };

  if (showSummary) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-10 py-14">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowSummary(false)} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors flex items-center gap-1.5 text-[12px]">
              <ArrowLeft size={12} /> Back to vectors
            </button>
          </div>
          <Eyebrow>Assessment summary · {bu.name}</Eyebrow>
          <h1 className="mt-2 display-heading text-[32px] text-[var(--color-ink)]">
            All vectors captured.
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-ink-soft)] max-w-[600px]">
            Review coverage below. Finalizing triggers the scoring engine, drift detection, and roadmap sequencer.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="p-4"><Metric label="Vectors" value={`${Object.keys(responses).length}/100`} size="md" /></Card>
            <Card className="p-4"><Metric label="Analyst notes" value={noteCount} unit="entries" size="md" /></Card>
            <Card className="p-4"><Metric label="Evidence" value={evidenceCount} unit="files" size="md" tone="amber" /></Card>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {pillarsProgress.map((p: any) => {
              const complete = p.answered === p.total;
              return (
                <Card key={p.id} severity={complete ? "mint" : "coral"} variant="flat" className="p-4 flex items-center justify-between">
                  <div>
                    <div className="eyebrow">{p.name}</div>
                    <div className="mt-1 font-mono text-[13px] text-[var(--color-ink)] tabular">
                      {p.answered} / {p.total} <span className="text-[var(--color-ink-muted)]">vectors</span>
                    </div>
                  </div>
                  {complete
                    ? <CheckCircle2 size={18} className="text-[var(--color-mint)]" />
                    : <AlertCircle size={18} className="text-[var(--color-coral)]" />}
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={() => setShowSummary(false)} className="btn-ghost flex-1 flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Revise responses
            </button>
            <button onClick={handleSubmit} disabled={!allAnswered || isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? "Computing maturity vector…" : "Compute & finalize"}
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Inner left rail — pillar progress */}
      <aside className="w-[260px] flex-shrink-0 border-r hairline bg-[var(--color-bg)] flex flex-col">
        <div className="px-4 py-4 border-b hairline">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors text-[11px] font-mono tracking-[0.12em] uppercase mb-3"
          >
            <ArrowLeft size={11} /> Scope
          </button>
          <Eyebrow>Assessing</Eyebrow>
          <p className="display-heading text-[17px] text-[var(--color-ink)] mt-1.5">{bu.name}</p>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="eyebrow">Progress</span>
              <span className="font-mono text-[11px] text-[var(--color-ink)] tabular">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} accent="ink" />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--color-ink-muted)] tabular">
              <span>{Object.keys(responses).length}/100</span>
              <span>Q{currIdx + 1}/{questions.length}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
          <div className="px-2 mb-1.5"><Eyebrow>Pillars</Eyebrow></div>
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
                  className={`w-full px-2.5 py-2 text-left rounded-[5px] transition-colors cursor-pointer ${
                    isCurrent ? "bg-[var(--color-ink)] text-[var(--color-surface)]" : "hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] tabular ${isCurrent ? "text-[var(--color-highlight)]" : "text-[var(--color-ink-muted)]"}`}>
                      {String(pIdx + 1).padStart(2, "0")}
                    </span>
                    <span className={`flex-1 text-[12px] truncate ${isCurrent ? "" : "text-[var(--color-ink)]"}`}>{p.name}</span>
                    <span className={`font-mono text-[10px] tabular ${isCurrent ? "text-[var(--color-surface)]/70" : "text-[var(--color-ink-muted)]"}`}>
                      {p.answered}/{p.total}
                    </span>
                  </div>
                  <div className={`mt-1.5 h-[2px] rounded-full ${isCurrent ? "bg-[var(--color-surface)]/20" : "bg-[var(--color-border)]"}`}>
                    <div className={`h-full rounded-full ${complete ? "bg-[var(--color-mint)]" : isCurrent ? "bg-[var(--color-gold)]" : "bg-[var(--color-ink-muted)]"}`} style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-4 py-3 border-t hairline flex items-center justify-between font-mono text-[10px] text-[var(--color-ink-muted)]">
          <span className="inline-flex items-center gap-1"><Keycap>1</Keycap>–<Keycap>5</Keycap> score</span>
          <span className="inline-flex items-center gap-1"><Keycap>←</Keycap><Keycap>→</Keycap> nav</span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[780px] mx-auto px-12 py-14">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Pill tone="amber" size="sm">{currentPillar?.name}</Pill>
            <Pill tone="ink" size="sm">{currentQ.dimensionId}</Pill>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">
              Vector {currIdx + 1} / {questions.length}
            </span>
          </div>

          <motion.h2
            key={currentQ.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="display-heading text-[28px] text-[var(--color-ink)] leading-[1.2]"
          >
            {currentQ.text}
          </motion.h2>

          <div className="mt-8">
            <Eyebrow>Maturity level · 1 Ad-hoc → 5 Optimized</Eyebrow>
            <div className="grid grid-cols-5 gap-2 mt-3">
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
                        ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-highlight)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink)]"
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    <span className={`display-num text-[28px] ${selected ? "" : "text-[var(--color-ink)]"}`}>{score}</span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.12em] mt-0.5 ${
                      selected ? "text-[var(--color-highlight)]/75" : "text-[var(--color-ink-muted)]"
                    }`}>{labels[score - 1]}</span>
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
            {/* Inline rubric preview — shows the full text of whichever level is currently selected (or hovered, via tooltip above). */}
            {(currentQ as any).rubric && responses[currentQ.id] !== undefined && (
              <motion.div
                key={`rubric-${currentQ.id}-${responses[currentQ.id]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="mt-3 px-3 py-2 border-l-2 border-[var(--color-gold)] bg-[var(--color-surface-soft)]/50 rounded-r-[6px]"
              >
                <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-gold)] mb-1">
                  Level {responses[currentQ.id]} criteria
                </div>
                <p className="text-[12px] leading-[1.55] text-[var(--color-ink-soft)]">
                  {(currentQ as any).rubric[responses[currentQ.id]]}
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Eyebrow>Analyst note</Eyebrow>
              <textarea
                value={notes[currentQ.id] || ""}
                onChange={e => setNotes(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                placeholder="Context, assumptions, control observations…"
                className="w-full mt-2 min-h-28 bg-[var(--color-surface)] border hairline focus:border-[var(--color-ink)] p-3 text-[13px] text-[var(--color-ink)] outline-none resize-none placeholder:text-[var(--color-ink-subtle)] rounded-[6px] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <div>
                <Eyebrow>Evidence reference</Eyebrow>
                <label className="mt-2 flex items-center justify-between gap-3 border hairline hover:border-[var(--color-ink)] px-3 py-3 rounded-[6px] cursor-pointer transition-colors bg-[var(--color-surface)]">
                  <span className="text-[12px] text-[var(--color-ink-soft)] truncate">{evidenceNames[currentQ.id] || "Attach supporting file"}</span>
                  <Upload size={12} className="text-[var(--color-ink)] flex-shrink-0" />
                  <input type="file" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    setEvidenceNames(prev => ({ ...prev, [currentQ.id]: f?.name || "" }));
                  }} />
                </label>
              </div>
              <Card variant="subtle" className="p-3 space-y-1.5">
                <Eyebrow>Metadata</Eyebrow>
                {[
                  ["Score", isAnswered ? `${responses[currentQ.id]} / 5` : "—"],
                  ["Stamped", answeredAt[currentQ.id] ? new Date(answeredAt[currentQ.id]).toLocaleTimeString() : "pending"],
                  ["Evidence", evidenceNames[currentQ.id] ? "linked" : "none"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="font-mono text-[var(--color-ink-muted)]">{k}</span>
                    <span className="text-[var(--color-ink)]">{v}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <button onClick={() => setCurrIdx(Math.max(0, currIdx - 1))} disabled={currIdx === 0} className="btn-ghost p-2.5 disabled:opacity-0" aria-label="Previous">
              <ArrowLeft size={14} />
            </button>
            {allAnswered && (
              <button onClick={() => setShowSummary(true)} className="btn-primary flex items-center gap-2">
                Review vectors <ArrowRight size={13} />
              </button>
            )}
            <button onClick={() => setCurrIdx(Math.min(questions.length - 1, currIdx + 1))} disabled={!isAnswered || currIdx === questions.length - 1} className="btn-ghost p-2.5 disabled:opacity-30" aria-label="Next">
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── DASHBOARD (RNOS Command Center) ───────────────────────────────────────

const RNOSCommandCenter = ({
  analysis,
  bu,
  allBUs,
  benchmarkTypes,
  benchmarkType,
  onBenchmarkTypeChange,
  onEntityChange,
  onBack,
  operatorEmail,
  assessmentId,
}: any) => {
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

  type SortKey = "priority" | "uplift" | "phase";
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [focusPillarId, setFocusPillarId] = useState<string>(analytics[0]?.pillarId ?? "");

  const radarData = useMemo(
    () => analytics.map((a: any) => ({ pillar: a.pillarName, score: a.score, target: a.target, fullMark: 5 })),
    [analytics],
  );
  const alignedCount = analytics.filter((a: any) => a.score >= a.target).length;

  const statusMeta: Record<string, { dot: "amber" | "mint" | "coral" | "sky"; tone: "amber" | "mint" | "coral" | "sky"; label: string }> = {
    NOMINAL_SYNC: { dot: "mint", tone: "mint", label: "Aligned" },
    VECTOR_DRIFT: { dot: "amber", tone: "amber", label: "Drift detected" },
    CRITICAL_GAP: { dot: "coral", tone: "coral", label: "Critical gap" },
    STRUCTURAL_WEAKNESS: { dot: "coral", tone: "coral", label: "Structural weakness" },
  };
  const status = statusMeta[missionStatus] || statusMeta.NOMINAL_SYNC;

  // Synthesize a short sparkline from analytics for the hero metric
  const heroSpark = useMemo(() => analytics.map((a: any) => a.score), [analytics]);

  const focusAnalytic = analytics.find((a: any) => a.pillarId === focusPillarId) ?? analytics[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar — BU switcher + benchmark tabs + status */}
      <div className="px-8 py-4 border-b hairline flex items-center justify-between gap-6 bg-[var(--color-bg)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BuGlyph id={bu.id} size={18} />
            <select
              value={bu.id}
              onChange={e => onEntityChange(allBUs.find((b: any) => b.id === e.target.value))}
              className="bg-transparent font-medium text-[14px] text-[var(--color-ink)] outline-none cursor-pointer appearance-none pr-5 hover:text-[var(--color-gold)] transition-colors"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='none' stroke='%231A1915' stroke-width='1.5' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "10px" }}
            >
              {allBUs.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <Tabs value={benchmarkType} onValueChange={onBenchmarkTypeChange}>
            <TabsList>
              {benchmarkTypes.map((t: string) => <TabsTrigger key={t} value={t}>{BENCHMARK_LABEL[t] || t}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const url = `/api/assessments/${analysis.assessmentId ?? assessmentId}/pdf?benchmarkType=${benchmarkType}`;
              window.open(url, '_blank');
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border hairline text-[11px] font-mono tracking-[0.14em] uppercase text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] cursor-pointer transition-colors"
            aria-label="Download executive PDF report"
          >
            <FileDown size={12} />
            <span>Report</span>
          </button>
          <Pill tone={status.tone}>
            <StatusDot color={status.dot} /> {status.label}
          </Pill>
          <button onClick={onBack} className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] cursor-pointer transition-colors" aria-label="Back">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6 pb-20">
          {/* Hero band */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow>{entityName} · {BENCHMARK_LABEL[benchmarkType]}</Eyebrow>
              <div className="mt-2 flex items-end gap-5">
                <div className="display-num text-[72px] text-[var(--color-ink)] leading-[0.95]">
                  <AnimatedNumber value={overallScore} />
                </div>
                <div className="pb-2">
                  <div className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">of 5.00 overall</div>
                  <div className="mt-2">
                    <Sparkline values={heroSpark} width={120} height={28} color="var(--color-gold)" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[13px] text-[var(--color-ink-soft)] max-w-[520px]">
                Weighted across {analytics.length} pillars · {alignedCount} aligned · {activeRoadmapCount} roadmap action{activeRoadmapCount === 1 ? "" : "s"} queued
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-0 items-stretch border hairline rounded-[8px] bg-[var(--color-surface)] overflow-hidden">
              <UiTooltip>
                <TooltipTrigger asChild>
                  <div className="px-5 py-4 cursor-help">
                    <Eyebrow>Benchmark</Eyebrow>
                    <div className="mt-1 display-num text-[22px] text-[var(--color-ink)]">
                      <AnimatedNumber value={benchmarkAverage} />
                    </div>
                    <div className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">avg / 5</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">{BENCHMARK_LABEL[benchmarkType]} profile average across all 10 pillars.</TooltipContent>
              </UiTooltip>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <div className="px-5 py-4 border-l hairline cursor-help">
                    <Eyebrow>Aligned</Eyebrow>
                    <div className={`mt-1 display-num text-[22px] ${alignedCount >= 7 ? "text-[var(--color-mint)]" : alignedCount >= 4 ? "text-[var(--color-gold)]" : "text-[var(--color-coral)]"}`}>
                      {alignedCount}<span className="text-[var(--color-ink-muted)] text-[14px]">/10</span>
                    </div>
                    <div className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">pillars</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">Pillars scoring at or above the active benchmark.</TooltipContent>
              </UiTooltip>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <div className="px-5 py-4 border-l hairline cursor-help">
                    <Eyebrow>Integrity</Eyebrow>
                    <div className="mt-1 display-num text-[22px] text-[var(--color-ink)]">
                      <AnimatedNumber value={systemIntegrity} decimals={0} />
                      <span className="text-[var(--color-ink-muted)] text-[14px]">%</span>
                    </div>
                    <div className="font-mono text-[9px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">system</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">Weighted percentage of pillars meeting benchmark.</TooltipContent>
              </UiTooltip>
            </div>
          </div>

          {/* Chart + Pillar rows row */}
          <div className="grid grid-cols-12 gap-6">
            {/* Radar */}
            <Card className="col-span-12 lg:col-span-7 p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <Eyebrow>Pillar scope</Eyebrow>
                  <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">
                    Maturity vs {BENCHMARK_LABEL[benchmarkType]}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[var(--color-ink)]" /><span className="text-[var(--color-ink-soft)]">Current</span></span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-[var(--color-gold)]" /><span className="text-[var(--color-ink-soft)]">Benchmark</span></span>
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="76%" data={radarData}>
                    <PolarGrid stroke={CHART.grid} />
                    <PolarAngleAxis dataKey="pillar" stroke={CHART.axis} tick={{ fill: CHART.axisLabel, fontSize: 9, fontFamily: "Inter" }} />
                    <PolarRadiusAxis stroke={CHART.axis} tick={false} axisLine={false} domain={[0, 5]} />
                    <Radar name="Current" dataKey="score" stroke={CHART.ink} fill={CHART.ink} fillOpacity={0.10} strokeWidth={1.8} dot={{ fill: CHART.ink, r: 2.5 }} />
                    <Radar name="Benchmark" dataKey="target" stroke={CHART.gold} fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Pillar row list — Runway line-item style */}
            <Card className="col-span-12 lg:col-span-5 p-0 overflow-hidden">
              <div className="px-5 py-3.5 border-b hairline flex items-baseline justify-between">
                <div>
                  <Eyebrow>Pillar vectors</Eyebrow>
                  <h3 className="mt-0.5 display-heading text-[16px] text-[var(--color-ink)]">Current vs {BENCHMARK_LABEL[benchmarkType]}</h3>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tabular">10 pillars</span>
              </div>
              <div className="max-h-[324px] overflow-y-auto custom-scrollbar">
                {analytics.map((a: any) => {
                  const above = a.score >= a.target;
                  const pct = (a.score / 5) * 100;
                  const barColor = above ? "var(--color-mint)" : "var(--color-gold)";
                  const focused = a.pillarId === focusPillarId;
                  return (
                    <button
                      key={a.pillarId}
                      onClick={() => setFocusPillarId(a.pillarId)}
                      className={`w-full px-5 py-2.5 flex items-center gap-3 text-left border-b hairline last:border-b-0 hover:bg-[var(--color-surface-soft)] transition-colors cursor-pointer ${focused ? "bg-[var(--color-surface-soft)]" : ""}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[12.5px] text-[var(--color-ink)] truncate">{a.pillarName}</span>
                          <span className="display-num text-[14px] tabular text-[var(--color-ink)] flex-shrink-0">{a.score.toFixed(2)}</span>
                        </div>
                        <div className="mt-1.5 h-[3px] bg-[var(--color-surface-soft)] rounded-full relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                          <div className="absolute inset-y-0 w-px bg-[var(--color-border-strong)]" style={{ left: `${(a.target / 5) * 100}%` }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between font-mono text-[9.5px] text-[var(--color-ink-muted)]">
                          <span>{BENCHMARK_LABEL[benchmarkType]} {a.target.toFixed(2)}</span>
                          <span className={a.gap > 0 ? "delta-down" : "delta-up"}>
                            {a.gap > 0 ? `−${a.gap.toFixed(2)}` : "aligned"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Dimensions + Drift + Coverage row */}
          <div className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 lg:col-span-5 p-5">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <Eyebrow>Operating dimensions</Eyebrow>
                  <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">People · Process · Tech · Gov</h3>
                </div>
              </div>
              <div className="space-y-3.5">
                {dimensions.map((d: any) => {
                  const pct = (d.score / 5) * 100;
                  const above = d.score >= 4.0;
                  return (
                    <div key={d.id}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-[12.5px] text-[var(--color-ink)]">{d.name}</span>
                        <span className={`display-num text-[15px] tabular ${above ? "text-[var(--color-gold)]" : "text-[var(--color-ink)]"}`}>
                          {d.score.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={pct} accent={above ? "mint" : "ink"} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t hairline grid grid-cols-2 gap-4">
                <Metric label="Avg gap" value={averageGap.toFixed(2)} size="sm" tone="coral" />
                <Metric label="Integrity" value={`${systemIntegrity}%`} size="sm" tone="mint" />
              </div>
            </Card>

            <Card severity={regressions.length > 0 ? "coral" : "none"} className="col-span-12 lg:col-span-4 p-5">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <Eyebrow>Drift signal</Eyebrow>
                  <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">vs prior baseline</h3>
                </div>
                <StatusDot color={regressions.length > 0 ? "coral" : "mint"} />
              </div>
              <div className="h-[140px] mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={driftProfile} margin={{ top: 5, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.gold} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={CHART.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="2 3" vertical={false} />
                    <XAxis dataKey="pillar" hide />
                    <YAxis stroke={CHART.axis} tick={{ fontSize: 9, fontFamily: "Inter", fill: CHART.axisLabel }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                    <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="2 2" />
                    <Area type="monotone" dataKey="delta" stroke={CHART.gold} strokeWidth={1.8} fill="url(#driftGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-2 flex justify-between font-mono text-[10px]">
                <span className="text-[var(--color-ink-muted)]">
                  {regressions.length} regression signal{regressions.length === 1 ? "" : "s"}
                </span>
                <span className={regressions.length > 0 ? "delta-down" : "delta-up"}>
                  {regressions.length > 0 ? `worst ${regressions[0].delta.toFixed(2)}` : "all nominal"}
                </span>
              </div>
            </Card>

            <Card className="col-span-12 lg:col-span-3 p-5">
              <Eyebrow>Response coverage</Eyebrow>
              <div className="mt-3 space-y-2.5">
                {[
                  ["Vectors", `${responseSummary.totalResponses}/100`],
                  ["Evidence", String(responseSummary.evidenceCount)],
                  ["Notes", String(responseSummary.noteCount)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[12px] pb-2.5 border-b hairline last:border-0 last:pb-0">
                    <span className="font-mono text-[var(--color-ink-muted)] tracking-wide">{k}</span>
                    <span className="text-[var(--color-ink)] tabular">{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Pillar focus inspector — the Runway "selected row detail" pattern */}
          {focusAnalytic && (
            <Card className="p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <Eyebrow>Focus · {focusAnalytic.pillarName}</Eyebrow>
                  <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">
                    {focusAnalytic.score.toFixed(2)} vs {BENCHMARK_LABEL[benchmarkType]} {focusAnalytic.target.toFixed(2)}
                    <span className={`ml-3 text-[13px] ${focusAnalytic.gap > 0 ? "text-[var(--color-coral)]" : "text-[var(--color-mint)]"}`}>
                      {focusAnalytic.gap > 0 ? `−${focusAnalytic.gap.toFixed(2)}` : "aligned"}
                    </span>
                  </h3>
                </div>
                <Pill tone={focusAnalytic.score >= focusAnalytic.target ? "mint" : "coral"} size="sm">
                  {focusAnalytic.score >= focusAnalytic.target ? "Above benchmark" : "Below benchmark"}
                </Pill>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {dimensions.map((d: any) => (
                  <div key={d.id} className="border hairline rounded-[6px] p-3">
                    <Eyebrow>{d.name}</Eyebrow>
                    <div className="mt-1 display-num text-[18px] text-[var(--color-ink)]">{d.score.toFixed(2)}</div>
                    <div className="mt-2"><Progress value={(d.score / 5) * 100} accent={d.score >= 4 ? "mint" : "ink"} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pillar evolution — historical trend across past assessments */}
          <TrendChart entityId={bu.id} operatorEmail={operatorEmail} benchmarkType={benchmarkType} />

          {/* Roadmap */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b hairline flex items-baseline justify-between">
              <div>
                <Eyebrow>Sequencing</Eyebrow>
                <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">Uplift roadmap</h3>
              </div>
              <Pill tone="ink" size="sm">{activeRoadmapCount} actions</Pill>
            </div>
            <div className="overflow-auto max-h-[420px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-surface-soft)] border-b hairline sticky top-0 z-10">
                  <tr className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
                    <th className="px-5 py-2.5 font-normal">Action</th>
                    <th className="px-3 py-2.5 font-normal">
                      <button onClick={() => setSortKey("phase")} className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] ${sortKey === "phase" ? "text-[var(--color-ink)]" : ""}`}>
                        Phase <ArrowUpDown size={9} className={sortKey === "phase" ? "text-[var(--color-gold)]" : ""} />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 font-normal text-right">
                      <button onClick={() => setSortKey("priority")} className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] ${sortKey === "priority" ? "text-[var(--color-ink)]" : ""}`}>
                        Priority <ArrowUpDown size={9} className={sortKey === "priority" ? "text-[var(--color-gold)]" : ""} />
                      </button>
                    </th>
                    <th className="px-5 py-2.5 font-normal text-right">
                      <button onClick={() => setSortKey("uplift")} className={`inline-flex items-center gap-1.5 cursor-pointer hover:text-[var(--color-ink)] ${sortKey === "uplift" ? "text-[var(--color-ink)]" : ""}`}>
                        Uplift <ArrowUpDown size={9} className={sortKey === "uplift" ? "text-[var(--color-gold)]" : ""} />
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
                      const pName = analytics.find((e: any) => e.pillarId === item.pillarId)?.pillarName || item.pillarId;
                      const phaseTone = item.phase === "Phase 1" ? "amber" : item.phase === "Phase 2" ? "sky" : "ink";
                      return (
                        <tr key={idx} className="border-b hairline last:border-0 hover:bg-[var(--color-surface-soft)] transition-colors">
                          <td className="px-5 py-3">
                            <p className="text-[12.5px] text-[var(--color-ink)] leading-snug">{item.description}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-[var(--color-ink-muted)]">{pName} · {item.dimensionId}</p>
                          </td>
                          <td className="px-3 py-3"><Pill tone={phaseTone as any} size="sm">{item.phase}</Pill></td>
                          <td className="px-3 py-3 text-right font-mono text-[12px] tabular text-[var(--color-ink)]">{item.priorityScore.toFixed(2)}</td>
                          <td className="px-5 py-3 text-right font-mono text-[12px] tabular text-[var(--color-gold)] font-semibold">+{item.expectedUplift.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Regressions (compact) */}
          {regressions.length > 0 ? (
            <Card severity="coral" className="p-5">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <Eyebrow>Regression alerts</Eyebrow>
                  <h3 className="mt-1 display-heading text-[16px] text-[var(--color-ink)]">
                    {criticalRegressionsCount} critical · {regressions.length - criticalRegressionsCount} notice
                  </h3>
                </div>
                <StatusDot color="coral" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {regressions.slice(0, 6).map((r: any, i: number) => (
                  <div key={i} className="border hairline p-3 rounded-[6px] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-0.5 h-4 rounded-full ${r.severity === "CRITICAL" ? "bg-[var(--color-coral)]" : "bg-[var(--color-gold)]"}`} />
                      <div>
                        <p className="text-[12px] text-[var(--color-ink)]">{r.pillarName}</p>
                        <p className="font-mono text-[9.5px] text-[var(--color-ink-muted)] tracking-wide uppercase">{r.severity}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[12px] text-[var(--color-coral)] tabular">{r.delta.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="border hairline rounded-[8px] p-6 text-center bg-[var(--color-surface)]">
              <ShieldCheck size={22} className="mx-auto text-[var(--color-mint)] mb-2" />
              <p className="font-mono text-[11px] text-[var(--color-ink-muted)] tracking-[0.12em] uppercase">All pillars nominal · no drift signals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── APP SHELL ─────────────────────────────────────────────────────────────

type Screen = "login" | "scope" | "assessment" | "navigator";

export default function App() {
  const [screen, setScreenState] = useState<Screen>("login");

  // Browser-history sync
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
    } catch (e) { console.error(e); setHistory([]); }
    finally { setHistoryLoading(false); }
  };

  const fetchAnalysis = async (aid: string, bType = benchmarkType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessments/${aid}/analysis?benchmarkType=${bType}`);
      const data = await res.json();
      setAnalysis(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openHistoricalAssessment = async (item: any) => {
    const bu = entities.find(b => b.id === item.entityId) ?? entities[0];
    setSelectedBU(bu);
    setAssessmentId(item.id);
    await fetchAnalysis(item.id, benchmarkType);
    setScreen("navigator");
  };

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

  const generateAssessmentId = () => "TX" + Math.random().toString(36).substring(2, 11).toUpperCase();

  const handleEntitySelect = (bu: any) => {
    setAssessmentId(generateAssessmentId());
    setSelectedBU(bu);
    setScreen("assessment");
  };

  const handleAssessmentComplete = async ({ responses, notes, evidenceNames, answeredAt }: any) => {
    const qCount = metadata.questions.length;
    const ansCount = Object.keys(responses).filter(k => responses[k as any] !== undefined).length;
    if (ansCount !== qCount) { alert(`Pipeline block: ${qCount - ansCount} vectors missing.`); return; }
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
          assessmentId, entityId: selectedBU?.id,
          operatorEmail: loginEmail,
          responses: formatted,
        }),
      });
      if (!save.ok) { const err = await save.json(); throw new Error(err.message || "Storage failure"); }
      await fetchAnalysis(assessmentId!, benchmarkType);
      loadHistory(loginEmail);
      setScreen("navigator");
    } catch (e: any) {
      alert(`Pipeline failure: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const authed = screen !== "login";

  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen flex">
        <AnimatePresence mode="wait">
          {screen === "login" && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full">
              <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />
            </motion.div>
          )}
        </AnimatePresence>

        {authed && (
          <>
            <Sidebar
              entities={entities}
              activeBU={selectedBU}
              onSelectBU={handleEntitySelect}
              operatorEmail={loginEmail}
              onLogout={() => { setHistory([]); setScreen("login"); }}
              onOpenPalette={() => setPaletteOpen(true)}
              history={history}
              current={screen === "scope" ? "scope" : screen === "assessment" ? "assessment" : "navigator"}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {screen === "scope" && (
                  <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col overflow-hidden">
                    <ScopeScreen
                      entities={entities}
                      onSelect={handleEntitySelect}
                      history={history}
                      onOpenHistorical={openHistoricalAssessment}
                    />
                  </motion.div>
                )}
                {screen === "assessment" && (
                  <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col overflow-hidden">
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
                  <motion.div key="navigator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col overflow-hidden">
                    <RNOSCommandCenter
                      analysis={analysis}
                      bu={selectedBU}
                      allBUs={entities}
                      operatorEmail={loginEmail}
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
                      assessmentId={assessmentId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {authed && <NavigatorAssistant analysis={analysis} />}

        <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
          <CommandInput placeholder="Search units, benchmarks, archive…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Switch unit">
              {entities.map((b: any) => (
                <CommandItem
                  key={b.id}
                  value={`unit ${b.name} ${b.industry}`}
                  onSelect={() => { handleEntitySelect(b); setPaletteOpen(false); }}
                >
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-ink-muted)] w-10">{b.id}</span>
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
            {history.length > 0 && (
              <CommandGroup heading="Archive">
                {history.slice(0, 12).map(item => {
                  const d = new Date(item.createdAt);
                  const when = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                  const score = typeof item.overallScore === "number" ? item.overallScore.toFixed(2) : "—";
                  return (
                    <CommandItem
                      key={item.id}
                      value={`archive ${item.entityName} ${item.id}`}
                      onSelect={() => { openHistoricalAssessment(item); setPaletteOpen(false); }}
                    >
                      <span className="font-mono text-[11px] tabular text-[var(--color-ink)] w-14">{score}</span>
                      <span className="flex-1">{item.entityName}</span>
                      <CommandShortcut>{when}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            <CommandGroup heading="Navigation">
              <CommandItem value="scope" onSelect={() => { setScreen("scope"); setPaletteOpen(false); }}>
                Scope · operating units
              </CommandItem>
              <CommandItem value="logout" onSelect={() => { setHistory([]); setScreen("login"); setPaletteOpen(false); }}>
                Log out
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>

        {loading && (
          <div className="fixed inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm z-[200] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StatusDot color="amber" /><StatusDot color="amber" /><StatusDot color="amber" />
              </div>
              <span className="eyebrow-amber">Computing</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
