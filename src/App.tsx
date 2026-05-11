import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Minimize2,
  RotateCcw,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  Zap,
  Network,
  Building2,
  Users,
  Layers,
  Boxes,
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
  Card,
  Eyebrow,
  HeaderBar,
  Keycap,
  Metric,
  Pill,
  SectionRule,
  StatusDot,
} from "./components/primitives";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────

const BENCHMARK_LABEL: Record<string, string> = {
  target: "Target",
  industry: "Industry",
  peer: "Peers",
  external: "External",
};

const getEntityIcon = (entityId: string) => {
  if (entityId === "gen") return Zap;
  if (entityId === "tra") return Network;
  if (entityId === "dis") return Boxes;
  if (entityId === "corp") return Building2;
  if (entityId === "sub") return Layers;
  if (entityId === "jv") return Users;
  return Shield;
};

// Recharts theme — Runway-warmed palette
const CHART = {
  grid: "rgba(38, 27, 7, 0.08)",
  axis: "rgba(38, 27, 7, 0.35)",
  axisLabel: "rgba(38, 27, 7, 0.55)",
  primary: "#F9A600",
  benchmark: "#385F8C",
  critical: "#C2462F",
  mint: "#3E8E5A",
  ink: "#261B07",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(38, 27, 7, 0.12)",
  borderRadius: 8,
  padding: "10px 14px",
  fontFamily: "Inter, sans-serif",
  fontSize: "12px",
  color: "#261B07",
  boxShadow: "0 2px 4px rgba(38,27,7,.06), 0 12px 32px rgba(38,27,7,.08)",
} as const;

// ─── ASSISTANT ─────────────────────────────────────────────────────────────

const getAssistantReply = (prompt: string, analysis: any): string => {
  const n = prompt.toLowerCase();

  if (!analysis) {
    if (n.includes("weight") || n.includes("score"))
      return "Scoring uses a 10-pillar × 4-dimension weighted matrix. Each pillar rolls up as Σ(cell × weight) ÷ Σ(weight); overall score is the pillar-weighted average.";
    if (n.includes("benchmark") || n.includes("peer") || n.includes("industry"))
      return "Four benchmark profiles ship by default — Target (4.0), Industry average (~3.5), Peer operators (~3.3), External reference (~4.1). Switch profile from the command center header.";
    if (n.includes("roadmap") || n.includes("action"))
      return "Roadmap sequencing ranks actions by expected uplift ÷ (cost × duration). Top three land in Phase 1, next three in Phase 2, the rest in Phase 3.";
    return "ERM Navigator captures 100 standards-aligned responses, computes a weighted maturity vector, detects drift against prior baselines, and sequences improvement actions by uplift-per-effort.";
  }

  const weakest = [...analysis.analytics].sort((a: any, b: any) => b.gap - a.gap)[0];
  const top = analysis.roadmap?.[0];

  if (n.includes("weak") || n.includes("gap"))
    return weakest
      ? `${weakest.pillarName} is the primary gap — ${weakest.score.toFixed(2)} vs ${BENCHMARK_LABEL[analysis.benchmarkType]} ${weakest.target.toFixed(2)}. Deficit: ${weakest.gap.toFixed(2)}.`
      : "All pillars are at or above the selected benchmark.";
  if (n.includes("benchmark"))
    return `Active profile: ${BENCHMARK_LABEL[analysis.benchmarkType]} (avg ${analysis.benchmarkAverage.toFixed(2)}). ${analysis.systemIntegrity}% of pillars meeting or exceeding baseline.`;
  if (n.includes("drift") || n.includes("regression"))
    return analysis.regressions?.length
      ? `${analysis.regressions.length} regression signal(s) detected. Most severe: ${analysis.regressions[0].pillarName} at Δ${analysis.regressions[0].delta.toFixed(3)}.`
      : "No negative drift detected across the assessed pillars.";
  if (n.includes("roadmap") || n.includes("action"))
    return top
      ? `Priority: ${top.description}. ${top.phase}. Priority score ${top.priorityScore.toFixed(2)}, expected uplift +${top.expectedUplift.toFixed(1)}.`
      : "No roadmap actions required — selected unit is aligned with the benchmark.";
  return `Overall maturity ${analysis.overallScore.toFixed(2)}. Status: ${analysis.missionStatus.replaceAll("_", " ").toLowerCase()}. Ask about gaps, drift, benchmarks, or roadmap sequencing.`;
};

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
        className="fixed bottom-6 right-6 w-12 h-12 bg-[var(--color-ink)] text-[var(--color-accent)] flex items-center justify-center rounded-full shadow-[0_8px_24px_rgba(38,27,7,0.2)] hover:scale-105 ease-premium transition-transform z-[100] cursor-pointer"
        aria-label="Open assistant"
      >
        <Sparkles size={18} />
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
                        className="px-3 py-1.5 border hairline rounded-full text-[11px] font-mono text-[var(--color-ink-soft)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)] cursor-pointer ease-premium transition-colors"
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
                className="text-[var(--color-accent-ink)] hover:opacity-70 cursor-pointer"
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
    <div className="min-h-screen flex items-center justify-center paper-grain">
      <div className="w-full max-w-[420px] px-6">
        {/* Brand lockup */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <BrandMark size={32} />
          </div>
          <Eyebrow className="block mb-3">Welcome to</Eyebrow>
          <h1 className="display-heading text-[52px] text-[var(--color-ink)]">
            ERM Navigator
          </h1>
          <p className="mt-4 text-[14px] text-[var(--color-ink-soft)] leading-relaxed max-w-[360px]">
            The risk maturity platform for Saudi Electricity Company. Aligned to ISO&nbsp;31000, COSO&nbsp;ERM, and NIST&nbsp;RMF.
          </p>
        </motion.div>

        {/* Sign-in card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="card p-8"
        >
          <div className="space-y-6">
            <div>
              <Eyebrow className="block mb-2">Email</Eyebrow>
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
              <Eyebrow className="block mb-2">Password</Eyebrow>
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
              <div className="border hairline stripe-coral py-3 px-4 rounded-[8px] bg-[var(--color-coral-soft)]">
                <div className="flex items-center gap-3">
                  <AlertCircle size={14} className="text-[var(--color-coral)]" />
                  <span className="text-[12px] text-[var(--color-coral)]">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading}
              className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Continue"}
              {!loading && <ArrowRight size={14} />}
            </button>

            <div className="pt-3 border-t hairline flex items-center justify-between text-[11px] font-mono text-[var(--color-ink-muted)] tracking-wide">
              <span>DEMO · any @gmail</span>
              <div className="flex items-center gap-2">
                <StatusDot color="mint" />
                <span>SECURE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── BUSINESS UNIT SELECTION ───────────────────────────────────────────────

const ScopeScreen = ({
  entities,
  onSelect,
  operatorEmail,
  onLogout,
}: {
  entities: any[];
  onSelect: (bu: any) => void;
  operatorEmail: string;
  onLogout: () => void;
}) => (
  <div className="min-h-screen">
    <HeaderBar
      crumb={<Eyebrow tone="ink">Select business unit</Eyebrow>}
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

    <div className="max-w-[1280px] mx-auto px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 flex items-end justify-between gap-8"
      >
        <div className="max-w-[680px]">
          <Eyebrow>Assessment · Scope</Eyebrow>
          <h1 className="display-heading text-[56px] text-[var(--color-ink)] mt-5">
            Choose the operating unit to begin.
          </h1>
          <p className="mt-5 text-[15px] text-[var(--color-ink-soft)] leading-[1.6] max-w-[600px]">
            Every unit runs a 100-vector assessment and rolls up into a weighted pillar-dimension matrix. Results are benchmarked against Target, Industry, Peer, and External profiles.
          </p>
        </div>
        <div className="hidden lg:flex flex-col items-end gap-2 font-mono text-[11px] text-[var(--color-ink-muted)]">
          <div className="flex items-center gap-2">
            <StatusDot color="mint" /> <span>6 UNITS AVAILABLE</span>
          </div>
          <div className="text-[10px]">100 VECTORS · 10 PILLARS · 4 DIMENSIONS</div>
        </div>
      </motion.div>

      <SectionRule label="Operating Units" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {entities.map((bu, idx) => {
          const Icon = getEntityIcon(bu.id);
          return (
            <motion.button
              key={bu.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(bu)}
              className="card text-left p-7 group hover:border-[var(--color-ink)] ease-premium transition-all cursor-pointer hover:-translate-y-1"
              style={{ transitionDuration: "200ms" }}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-11 h-11 rounded-[10px] bg-[var(--color-surface-soft)] flex items-center justify-center text-[var(--color-ink)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-accent)] ease-premium transition-colors">
                  <Icon size={18} />
                </div>
                <Pill tone="mint">Ready</Pill>
              </div>

              <Eyebrow>{bu.id.toUpperCase()}</Eyebrow>
              <h3 className="display-heading text-[28px] text-[var(--color-ink)] mt-3">{bu.name}</h3>
              <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">{bu.industry}</p>

              <div className="h-px bg-[var(--color-border)] my-6" />

              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-[0.18em] uppercase">
                  Begin assessment
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] ease-premium transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.button>
          );
        })}
      </div>
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
      <div className="min-h-screen">
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
        <div className="max-w-[1100px] mx-auto px-8 py-12">
          <Eyebrow>Assessment summary</Eyebrow>
          <h1 className="display-heading text-[48px] text-[var(--color-ink)] mt-4">
            All vectors captured.
          </h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-soft)] max-w-[600px] leading-relaxed">
            Review your coverage below. Finalizing triggers the scoring engine, drift detection, and roadmap sequencer in turn.
          </p>

          <SectionRule label="Per-pillar coverage" />

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
            className="flex items-center gap-2 text-[var(--color-ink-muted)] hover:text-[var(--color-coral)] font-mono text-[10px] uppercase tracking-[0.18em] transition-colors mb-5 cursor-pointer"
          >
            <RotateCcw size={12} /> Cancel
          </button>
          <Eyebrow>Assessing</Eyebrow>
          <p className="display-heading text-[22px] text-[var(--color-ink)] mt-2">{bu.name}</p>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <Eyebrow>Progress</Eyebrow>
              <span className="font-mono text-[11px] text-[var(--color-accent-ink)] tabular">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="h-[3px] bg-[var(--color-border)] relative rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-[var(--color-accent)]"
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
            {pillarsProgress.map((p: any) => {
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
                        isCurrent ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                      }`}
                    >
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
                        complete ? "bg-[var(--color-mint)]" : isCurrent ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink-muted)]"
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
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Pill tone="amber">{currentPillar?.name}</Pill>
            <Pill tone="ink">{currentQ.dimensionId}</Pill>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-wide">
              Vector {currIdx + 1} / {questions.length}
            </span>
          </div>

          <motion.h2
            key={currentQ.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="display-heading text-[40px] text-[var(--color-ink)]"
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
                        ? "bg-[var(--color-ink)] border-[var(--color-ink)] text-[var(--color-accent)] shadow-[0_4px_12px_rgba(38,27,7,0.2)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink)] hover:-translate-y-0.5"
                    }`}
                    style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  >
                    <span className={`display-num text-[32px] ${selected ? "" : "text-[var(--color-ink)]"}`}>
                      {score}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-[0.18em] mt-1 ${
                      selected ? "text-[var(--color-accent)]/80" : "text-[var(--color-ink-muted)]"
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
                className="w-full mt-3 min-h-32 bg-[var(--color-surface)] border hairline focus:border-[var(--color-accent)] p-3.5 text-[14px] text-[var(--color-ink)] outline-none resize-none placeholder:text-[var(--color-ink-subtle)] rounded-[8px] transition-colors"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Eyebrow>Evidence reference</Eyebrow>
                <label className="mt-3 flex items-center justify-between gap-3 border hairline hover:border-[var(--color-accent)] px-4 py-3.5 rounded-[8px] cursor-pointer transition-colors group bg-[var(--color-surface)]">
                  <span className="text-[13px] text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)] truncate">
                    {evidenceNames[currentQ.id] || "Attach supporting file"}
                  </span>
                  <Upload size={14} className="text-[var(--color-accent-ink)] flex-shrink-0" />
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
    <div className="min-h-screen">
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
        {/* Top HUD */}
        <Card severity={status.tone === "mint" ? "none" : status.tone} className="p-10">
          <div className="flex items-start justify-between gap-10 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <Eyebrow>Active unit</Eyebrow>
              <div className="flex items-baseline gap-3 mt-3">
                <h1 className="display-heading text-[40px] text-[var(--color-ink)]">
                  {entityName}
                </h1>
                <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular">
                  {bu.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <Eyebrow>Benchmark</Eyebrow>
                <div className="flex gap-1.5 flex-wrap">
                  {benchmarkTypes.map((t: string) => (
                    <button
                      key={t}
                      onClick={() => onBenchmarkTypeChange(t)}
                      className={`px-3 py-1.5 rounded-full font-mono text-[11px] tracking-wide transition-colors cursor-pointer ${
                        benchmarkType === t
                          ? "bg-[var(--color-ink)] text-[var(--color-accent)]"
                          : "border hairline text-[var(--color-ink-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {BENCHMARK_LABEL[t] || t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-10 flex-wrap">
              <div className="flex flex-col justify-between">
                <Eyebrow>Maturity score</Eyebrow>
                <div className="display-num text-[88px] text-[var(--color-ink)] leading-none mt-3">
                  {overallScore.toFixed(2)}
                </div>
                <span className="font-mono text-[11px] text-[var(--color-ink-muted)] mt-2">
                  of 5.00 · overall
                </span>
              </div>
              <div className="w-px bg-[var(--color-border)]" />
              <div className="flex flex-col gap-5 justify-between min-w-[140px]">
                <Metric label="Benchmark avg" value={benchmarkAverage.toFixed(2)} unit="/ 5" size="sm" />
                <Metric
                  label="Aligned pillars"
                  value={`${alignedCount}`}
                  unit="/ 10"
                  size="sm"
                  tone={alignedCount >= 7 ? "mint" : alignedCount >= 4 ? "amber" : "coral"}
                />
                <Metric label="Active roadmap" value={activeRoadmapCount} unit="actions" size="sm" />
              </div>
            </div>
          </div>
        </Card>

        {/* Pillar grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Pillar vectors</Eyebrow>
            <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tabular">
              CURRENT vs {(BENCHMARK_LABEL[benchmarkType] || benchmarkType).toUpperCase()}
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
          {/* Radar */}
          <Card className="lg:col-span-5 p-7">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Eyebrow tone="amber">Pillar scope</Eyebrow>
                <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
                  Maturity vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tabular">10 × 5</span>
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
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ fill: CHART.primary, r: 3 }}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="target"
                    stroke={CHART.benchmark}
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
                <span className="w-3 h-0.5 bg-[var(--color-accent)]" />
                <span className="text-[11px] text-[var(--color-ink-soft)]">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 border-t border-dashed border-[var(--color-sky)]" />
                <span className="text-[11px] text-[var(--color-ink-soft)]">
                  {BENCHMARK_LABEL[benchmarkType] || benchmarkType}
                </span>
              </div>
            </div>
          </Card>

          {/* Dimensions */}
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
                      <span className={`display-num text-[20px] ${above ? "text-[var(--color-accent-ink)]" : "text-[var(--color-ink)]"}`}>
                        {d.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-[5px] bg-[var(--color-surface-soft)] rounded-full relative overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full ${above ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink-subtle)]"}`}
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-y-0 w-px bg-[var(--color-coral)]/40" style={{ left: "80%" }} />
                    </div>
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

          {/* Drift + coverage */}
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
                      stroke={CHART.primary}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART.primary }}
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

        {/* Bar comparison */}
        <Card className="p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Eyebrow tone="amber">Pillar delta</Eyebrow>
              <h3 className="display-heading text-[22px] text-[var(--color-ink)] mt-2">
                Current vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType} by pillar
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-ink-muted)]">
              AVG {benchmarkAverage.toFixed(2)}
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
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(249,166,0,0.08)" }} />
                <Bar dataKey="score" fill={CHART.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" fill={CHART.benchmark} opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Roadmap + Regressions */}
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
            <div className="overflow-auto max-h-[360px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-surface-soft)] border-b hairline sticky top-0">
                  <tr className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
                    <th className="px-7 py-3 font-normal">Action</th>
                    <th className="px-3 py-3 font-normal">Phase</th>
                    <th className="px-3 py-3 font-normal text-right">Priority</th>
                    <th className="px-7 py-3 font-normal text-right">Uplift</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmap.slice(0, 12).map((item: any, idx: number) => {
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
                        <td className="px-7 py-4 text-right font-mono text-[12px] tabular text-[var(--color-accent-ink)]">
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
                        className={`w-0.5 h-5 rounded-full ${r.severity === "CRITICAL" ? "bg-[var(--color-coral)]" : "bg-[var(--color-accent)]"}`}
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
                <p className="text-[11px] text-[var(--color-ink-muted)] font-mono tracking-wide uppercase">
                  All pillars nominal
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── APP SHELL ─────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<"login" | "scope" | "assessment" | "navigator">("login");
  const [selectedBU, setSelectedBU] = useState<any>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({ pillars: [], questions: [], weights: [] });
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [benchmarkType, setBenchmarkType] = useState("target");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/entities").then(r => r.json()).then(setEntities).catch(console.error);
    fetch("/api/metadata").then(r => r.json()).then(setMetadata).catch(console.error);
    fetch("/api/benchmarks").then(r => r.json()).then(setBenchmarks).catch(console.error);
  }, []);

  const benchmarkTypes = useMemo(() => {
    const types = Array.from(new Set(benchmarks.map((b: any) => b.type)));
    return types.length ? (types as string[]) : ["target"];
  }, [benchmarks]);

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
      setScreen("scope");
    } catch (e: any) {
      setLoginError(e.message || "Unable to authorize.");
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySelect = async (bu: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId: bu.id }),
      });
      const data = await res.json();
      setAssessmentId(data.id);
      setSelectedBU(bu);
      setScreen("assessment");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (aid: string, bType = benchmarkType, skipRecompute = false) => {
    setLoading(true);
    try {
      if (!skipRecompute) {
        await fetch("/api/compute-maturity-vector", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId: aid }),
        });
        await fetch("/api/compute-drift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId: aid }),
        });
        await fetch("/api/generate-roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId: aid }),
        });
      }
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
        body: JSON.stringify({ assessmentId, responses: formatted }),
      });
      if (!save.ok) {
        const err = await save.json();
        throw new Error(err.message || "Storage failure");
      }
      await fetchAnalysis(assessmentId!, benchmarkType);
      setScreen("navigator");
    } catch (e: any) {
      alert(`Pipeline failure: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {screen === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <LoginScreen onLogin={handleLogin} loading={loading} error={loginError} />
          </motion.div>
        )}
        {screen === "scope" && (
          <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ScopeScreen
              entities={entities}
              onSelect={handleEntitySelect}
              operatorEmail={loginEmail}
              onLogout={() => setScreen("login")}
            />
          </motion.div>
        )}
        {screen === "assessment" && (
          <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {metadata.questions.length > 0 ? (
              <VectorCapturePipeline
                bu={selectedBU}
                questions={metadata.questions}
                pillars={metadata.pillars}
                onBack={() => setScreen("scope")}
                onComplete={handleAssessmentComplete}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center p-8">
                <div className="card max-w-md w-full p-8 text-center">
                  <AlertCircle size={32} className="mx-auto text-[var(--color-coral)] mb-4" />
                  <h2 className="display-heading text-[24px] text-[var(--color-ink)]">
                    Questions failed to load
                  </h2>
                  <p className="mt-3 text-[14px] text-[var(--color-ink-soft)]">
                    The question catalog couldn't be fetched from the server. This usually means a cold-start delay on the serverless function.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        fetch("/api/metadata").then(r => r.json()).then(setMetadata).catch(console.error);
                      }}
                      className="btn-accent flex-1"
                    >
                      Retry
                    </button>
                    <button onClick={() => setScreen("scope")} className="btn-ghost flex-1">
                      Back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {screen === "navigator" && analysis && (
          <motion.div key="navigator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <RNOSCommandCenter
              analysis={analysis}
              bu={selectedBU}
              allBUs={entities}
              benchmarkTypes={benchmarkTypes}
              benchmarkType={benchmarkType}
              onBenchmarkTypeChange={async (t: string) => {
                setBenchmarkType(t);
                if (assessmentId) await fetchAnalysis(assessmentId, t, true);
              }}
              onEntityChange={async (bu: any) => {
                setLoading(true);
                try {
                  const res = await fetch("/api/assessments/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ entityId: bu.id }),
                  });
                  const data = await res.json();
                  setAssessmentId(data.id);
                  setSelectedBU(bu);
                  setScreen("assessment");
                } finally {
                  setLoading(false);
                }
              }}
              onBack={() => setScreen("scope")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <NavigatorAssistant analysis={analysis} />

      {loading && (
        <div className="fixed inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm z-[200] flex items-center justify-center">
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
  );
}
