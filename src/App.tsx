import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Database,
  Minimize2,
  RotateCcw,
  Send,
  ShieldCheck,
  Upload,
  X,
  Zap,
  Network,
  Building2,
  Users,
  Layers,
  Boxes,
  Shield,
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
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Brand,
  BrandMark,
  Eyebrow,
  HeaderBar,
  Keycap,
  Metric,
  Panel,
  SectionRule,
  StatusLED,
} from "./components/primitives";

// ─── CONSTANTS ─────────────────────────────────────────────────────────────

const BENCHMARK_LABEL: Record<string, string> = {
  target: "TARGET",
  industry: "INDUSTRY",
  peer: "PEER",
  external: "EXTERNAL",
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

// Chart theme — applied per-chart, avoids touching Recharts global config
const CHART_COLORS = {
  grid: "rgba(255, 255, 255, 0.06)",
  axis: "#555F75",
  axisLabel: "#8A94A8",
  primary: "#00E5FF",
  benchmark: "#FFAA00",
  critical: "#FF4D4D",
  nominal: "#4ADE80",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#0A0E1A",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 2,
  padding: "8px 12px",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "11px",
  color: "#E8ECF4",
} as const;

// ─── ASSISTANT ─────────────────────────────────────────────────────────────

const getAssistantReply = (prompt: string, analysis: any): string => {
  const n = prompt.toLowerCase();

  if (!analysis) {
    if (n.includes("weight") || n.includes("score"))
      return "Weighted scoring operates on a 10×4 pillar-by-dimension matrix. Each pillar rolls up via Σ(cell × weight) ÷ Σ(weight); overall score is Σ(pillar × pillar-weight).";
    if (n.includes("benchmark") || n.includes("peer") || n.includes("industry"))
      return "Four benchmark profiles are seeded: TARGET (4.0 floor), INDUSTRY utility average (~3.5), PEER operator average (~3.3), EXTERNAL reference (~4.1). Switch profile in the top-right of the command center.";
    if (n.includes("roadmap") || n.includes("action"))
      return "Roadmap sequencing ranks by expectedUplift ÷ (costScore × durationScore). Top 3 land in Phase 1, next 3 in Phase 2, residual in Phase 3.";
    return "ERM Navigator captures 100 standards-aligned responses, computes a weighted maturity vector, detects drift against prior baselines, and sequences improvement actions by uplift-per-effort.";
  }

  const weakest = [...analysis.analytics].sort((a: any, b: any) => b.gap - a.gap)[0];
  const top = analysis.roadmap?.[0];

  if (n.includes("weak") || n.includes("gap"))
    return weakest
      ? `${weakest.pillarName} is the primary gap. Current ${weakest.score.toFixed(2)} vs ${BENCHMARK_LABEL[analysis.benchmarkType]} ${weakest.target.toFixed(2)} — deficit ${weakest.gap.toFixed(2)}.`
      : "All pillars are at or above the selected benchmark.";
  if (n.includes("benchmark"))
    return `Active profile: ${BENCHMARK_LABEL[analysis.benchmarkType]} (avg ${analysis.benchmarkAverage.toFixed(2)}). ${analysis.systemIntegrity}% of pillars meeting or exceeding baseline.`;
  if (n.includes("drift") || n.includes("regression"))
    return analysis.regressions?.length
      ? `${analysis.regressions.length} regression signal(s) detected. Most severe: ${analysis.regressions[0].pillarName} at Δ${analysis.regressions[0].delta.toFixed(3)}.`
      : "No negative drift detected across the assessed pillars.";
  if (n.includes("roadmap") || n.includes("action"))
    return top
      ? `Priority action: ${top.description}. ${top.phase}. Priority score ${top.priorityScore.toFixed(2)}, expected uplift +${top.expectedUplift.toFixed(1)}.`
      : "No roadmap actions required — selected BU aligned with benchmark.";
  return `Overall maturity ${analysis.overallScore.toFixed(2)}. Mission status: ${analysis.missionStatus.replaceAll("_", " ")}. Ask about gaps, drift, benchmarks, or roadmap sequencing.`;
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
    }, 220);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-11 h-11 bg-[var(--color-plasma-700)] border hairline-strong flex items-center justify-center text-[var(--color-signal-cyan)] hover:border-[var(--color-signal-cyan)] transition-colors z-[100] cursor-pointer"
        aria-label="Open assistant"
      >
        <Bot size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="fixed bottom-20 right-6 w-[380px] h-[520px] panel z-[101] flex flex-col"
          >
            <div className="px-5 py-4 border-b hairline flex items-center justify-between bg-[var(--color-plasma-800)]">
              <div className="flex items-center gap-3">
                <StatusLED color="cyan" />
                <span className="eyebrow-cyan">RNOS Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                aria-label="Close assistant"
              >
                <Minimize2 size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <Eyebrow>Query Interface</Eyebrow>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Ask about scoring matrix, benchmark profile, drift signals, roadmap sequencing, or response coverage.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["weakest gap", "drift status", "top action"].map(p => (
                      <button
                        key={p}
                        onClick={() => {
                          setInput(p);
                          setTimeout(handleSend, 0);
                        }}
                        className="px-3 py-1.5 border hairline text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-secondary)] hover:border-[var(--color-signal-cyan)] hover:text-[var(--color-signal-cyan)] cursor-pointer transition-colors"
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
                    className={`px-3 py-2 max-w-[85%] text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-[var(--color-signal-cyan)] text-[var(--color-plasma-900)] font-medium"
                        : "border hairline text-[var(--color-text-primary)]"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <StatusLED color="cyan" />
                  <span className="eyebrow-cyan">computing</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t hairline flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent outline-none text-[var(--color-text-primary)] border-b hairline focus:border-[var(--color-signal-cyan)] text-xs font-mono py-2 transition-colors"
                placeholder="Query…"
              />
              <button
                onClick={handleSend}
                className="text-[var(--color-signal-cyan)] hover:opacity-80 cursor-pointer"
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

// ─── LOGIN (Terminal boot) ─────────────────────────────────────────────────

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient background scan */}
      <div className="scan-sweep" />

      <div className="relative w-full max-w-md px-6">
        {/* Boot sequence header */}
        <div className="mb-14 space-y-2 font-mono text-[10px] text-[var(--color-text-muted)] tracking-wider leading-loose">
          <div className="boot-line" style={{ animationDelay: "0ms" }}>
            <span className="text-[var(--color-signal-cyan)]">▸</span> RNOS boot sequence initiated
          </div>
          <div className="boot-line" style={{ animationDelay: "180ms" }}>
            <span className="text-[var(--color-signal-mint)]">▸</span> scoring engine :: online
          </div>
          <div className="boot-line" style={{ animationDelay: "300ms" }}>
            <span className="text-[var(--color-signal-mint)]">▸</span> benchmark profiles :: 4 loaded
          </div>
          <div className="boot-line" style={{ animationDelay: "420ms" }}>
            <span className="text-[var(--color-signal-mint)]">▸</span> drift detector :: armed
          </div>
          <div className="boot-line" style={{ animationDelay: "540ms" }}>
            <span className="text-[var(--color-signal-amber)]">▸</span> awaiting operator credentials
            <span className="caret" />
          </div>
        </div>

        {/* Brand lockup */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <BrandMark size={40} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-3xl text-[var(--color-text-primary)] font-medium tracking-tight">
                ERM Navigator
              </span>
              <span className="font-mono text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] mt-2">
                RISK NAVIGATION OPERATING SYSTEM
              </span>
            </div>
          </div>
          <div className="h-px bg-[var(--color-hairline-strong)]" />
        </motion.div>

        {/* Credential prompt */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <label className="eyebrow block mb-3">Operator Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
              placeholder="analyst@gmail.com"
              className="w-full bg-transparent border-b hairline-strong focus:border-[var(--color-signal-cyan)] py-3 font-mono text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-disabled)]"
              autoFocus
            />
          </div>
          <div>
            <label className="eyebrow block mb-3">Credential</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
              placeholder="••••••••"
              className="w-full bg-transparent border-b hairline-strong focus:border-[var(--color-signal-cyan)] py-3 font-mono text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-disabled)]"
            />
          </div>

          {error && (
            <div className="border hairline stripe-coral py-3 px-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={14} className="text-[var(--color-signal-coral)]" />
                <span className="font-mono text-[11px] text-[var(--color-signal-coral)]">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => onLogin(email, password)}
            disabled={loading}
            className="w-full py-4 border hairline-strong hover:border-[var(--color-signal-cyan)] hover:bg-[var(--color-plasma-700)] text-[var(--color-text-primary)] font-mono text-xs tracking-[0.3em] uppercase transition-colors flex items-center justify-between group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{loading ? "authorizing" : "authorize session"}</span>
            <ArrowRight
              size={14}
              className="text-[var(--color-signal-cyan)] group-hover:translate-x-1 transition-transform"
            />
          </button>

          <div className="pt-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] tracking-widest">
            <span>DEMO MODE · any @gmail address</span>
            <div className="flex items-center gap-2">
              <StatusLED color="mint" />
              <span>SECURE</span>
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
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar
        crumb={<Eyebrow tone="cyan">Select Business Unit</Eyebrow>}
        right={
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-tight">
              <span className="font-mono text-xs text-[var(--color-text-primary)]">{operatorEmail}</span>
              <span className="eyebrow mt-0.5">Operator</span>
            </div>
            <button
              onClick={onLogout}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-signal-coral)] cursor-pointer transition-colors"
              aria-label="Log out"
            >
              <X size={16} />
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-8 py-16">
        <div className="mb-12 flex items-end justify-between gap-8">
          <div>
            <Eyebrow>Acquisition · Scope</Eyebrow>
            <h1 className="font-display text-5xl text-[var(--color-text-primary)] tracking-tight mt-4 max-w-2xl leading-[1.05]">
              Select the operating unit to begin maturity acquisition.
            </h1>
            <p className="mt-6 text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
              Each unit captures an independent 100-vector assessment. Vectors roll up into a weighted
              pillar-dimension matrix and are benchmarked against TARGET, INDUSTRY, PEER, and EXTERNAL profiles.
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2 font-mono text-[10px] text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <StatusLED color="mint" /> <span>6 UNITS ONLINE</span>
            </div>
            <div>100 VECTORS · 10 PILLARS · 4 DIMENSIONS</div>
          </div>
        </div>

        <SectionRule label="Operating Units" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {entities.map((bu, idx) => {
            const Icon = getEntityIcon(bu.id);
            return (
              <motion.button
                key={bu.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25, ease: "easeOut" }}
                onClick={() => onSelect(bu)}
                className="group text-left panel hover-rise p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-10 h-10 border hairline-strong flex items-center justify-center text-[var(--color-signal-cyan)] group-hover:border-[var(--color-signal-cyan)] transition-colors">
                    <Icon size={18} />
                  </div>
                  <StatusLED color="mint" />
                </div>

                <Eyebrow>Unit Code · {bu.id.toUpperCase()}</Eyebrow>
                <h3 className="font-display text-2xl text-[var(--color-text-primary)] mt-2 tracking-tight">
                  {bu.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)] font-mono tracking-wide">
                  {bu.industry}
                </p>

                <div className="h-px bg-[var(--color-hairline)] my-6" />

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase">
                    Begin acquisition
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-[var(--color-text-muted)] group-hover:text-[var(--color-signal-cyan)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <footer className="border-t hairline px-8 py-5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] font-mono text-[var(--color-text-muted)] tracking-widest">
          <span>RNOS · CORE · VERIFIED</span>
          <div className="flex items-center gap-3">
            <Keycap>↵</Keycap>
            <span>SELECT</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ─── QUESTIONNAIRE (Vector Capture Pipeline) ───────────────────────────────

const VectorCapturePipeline = ({
  questions,
  pillars,
  bu,
  onComplete,
  onBack,
}: any) => {
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
      setTimeout(() => setCurrIdx(currIdx + 1), 180);
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

  // ─── Summary screen ───────────────────────────────────────────────────
  if (showSummary) {
    return (
      <div className="min-h-screen">
        <HeaderBar
          crumb={
            <div className="flex items-center gap-3">
              <Eyebrow>Unit</Eyebrow>
              <span className="font-mono text-xs text-[var(--color-text-primary)]">{bu.name}</span>
              <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
              <Eyebrow tone="cyan">Finalization</Eyebrow>
            </div>
          }
        />
        <div className="max-w-5xl mx-auto px-8 py-16">
          <Eyebrow>Acquisition Summary</Eyebrow>
          <h1 className="font-display text-5xl text-[var(--color-text-primary)] mt-4 tracking-tight">
            Vectors captured. Ready to compute.
          </h1>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)] max-w-xl">
            Review per-pillar coverage below. Submission triggers the weighted scoring engine,
            drift detector, and roadmap generator in sequence.
          </p>

          <SectionRule label="Per-Pillar Coverage" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
            {pillarsProgress.map((p: any) => {
              const complete = p.answered === p.total;
              return (
                <Panel
                  key={p.id}
                  severity={complete ? "cyan" : "coral"}
                  className="p-5 flex items-center justify-between"
                >
                  <div>
                    <Eyebrow>{p.name}</Eyebrow>
                    <p className="mt-2 font-mono text-sm text-[var(--color-text-primary)]">
                      {p.answered} / {p.total}
                      <span className="text-[var(--color-text-muted)]"> vectors</span>
                    </p>
                  </div>
                  {complete ? (
                    <CheckCircle2 size={18} className="text-[var(--color-signal-cyan)]" />
                  ) : (
                    <AlertTriangle size={18} className="text-[var(--color-signal-coral)]" />
                  )}
                </Panel>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-12">
            <Panel className="p-5">
              <Metric label="Analyst Notes" value={noteCount} unit="entries" size="md" />
            </Panel>
            <Panel className="p-5">
              <Metric label="Evidence Linked" value={evidenceCount} unit="files" size="md" />
            </Panel>
            <Panel className="p-5">
              <Metric label="Vector Count" value={Object.keys(responses).length} unit="/ 100" size="md" />
            </Panel>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSummary(false)}
              className="flex-1 py-4 border hairline-strong hover:border-[var(--color-signal-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-mono text-xs tracking-[0.3em] uppercase transition-colors cursor-pointer"
            >
              ← Revise responses
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="flex-1 py-4 bg-[var(--color-signal-cyan)] text-[var(--color-plasma-900)] font-mono text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
            >
              {isSubmitting ? "computing maturity vector…" : "compute & finalize"}
              {!isSubmitting && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Capture screen ───────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — Acquisition panel */}
      <aside className="w-80 border-r hairline bg-[var(--color-plasma-900)] flex flex-col">
        <div className="p-6 border-b hairline">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-signal-coral)] font-mono text-[10px] uppercase tracking-widest transition-colors mb-6 cursor-pointer"
          >
            <RotateCcw size={12} /> Abort
          </button>
          <Eyebrow>Acquiring</Eyebrow>
          <p className="font-display text-lg text-[var(--color-text-primary)] mt-2 tracking-tight">{bu.name}</p>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="eyebrow">Progress</span>
              <span className="font-mono text-[11px] text-[var(--color-signal-cyan)]">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-[2px] bg-[var(--color-hairline-strong)] relative">
              <motion.div
                className="absolute left-0 top-0 h-full bg-[var(--color-signal-cyan)]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
                style={{ boxShadow: "0 0 8px var(--color-signal-cyan)" }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--color-text-muted)]">
              <span>{Object.keys(responses).length}/100</span>
              <span>
                Q{currIdx + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <Eyebrow className="px-3 block mb-3">Pillars</Eyebrow>
          <div className="space-y-0.5">
            {pillarsProgress.map((p: any) => {
              const isCurrent = currentPillar?.id === p.id;
              const pct = (p.answered / p.total) * 100;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    const i = questions.findIndex((q: any) => q.pillarId === p.id);
                    if (i !== -1) setCurrIdx(i);
                  }}
                  className={`w-full px-3 py-3 text-left transition-colors group cursor-pointer ${
                    isCurrent
                      ? "bg-[var(--color-plasma-700)] border-l-2 border-[var(--color-signal-cyan)]"
                      : "border-l-2 border-transparent hover:bg-[var(--color-plasma-800)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[11px] ${
                        isCurrent ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"
                      } tracking-wide truncate`}
                    >
                      {p.name}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] tabular flex-shrink-0">
                      {p.answered}/{p.total}
                    </span>
                  </div>
                  <div className="mt-2 h-[1px] bg-[var(--color-hairline)] relative">
                    <div
                      className={`absolute inset-y-0 left-0 ${
                        pct === 100
                          ? "bg-[var(--color-signal-mint)]"
                          : isCurrent
                            ? "bg-[var(--color-signal-cyan)]"
                            : "bg-[var(--color-text-muted)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t hairline flex items-center justify-between font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
          <span>
            <Keycap>1</Keycap>–<Keycap>5</Keycap> score
          </span>
          <span>
            <Keycap>←</Keycap>
            <Keycap>→</Keycap> nav
          </span>
        </div>
      </aside>

      {/* Main — measurement stage */}
      <main className="flex-1 overflow-y-auto relative">
        {/* subtle ambient scan overlay */}
        <div className="scan-sweep opacity-30 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-12 py-16 relative">
          <div className="flex items-center gap-3 mb-6">
            <Eyebrow tone="cyan">{currentPillar?.name}</Eyebrow>
            <span className="text-[var(--color-text-muted)]">·</span>
            <Eyebrow>{currentQ.dimensionId}</Eyebrow>
            <span className="text-[var(--color-text-muted)]">·</span>
            <Eyebrow>
              Vector {currIdx + 1}/{questions.length}
            </Eyebrow>
          </div>

          <motion.h2
            key={currentQ.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="font-display text-4xl text-[var(--color-text-primary)] leading-[1.15] tracking-tight"
          >
            {currentQ.text}
          </motion.h2>

          <div className="mt-12">
            <Eyebrow>Maturity Level · 1 — Ad-hoc / 5 — Optimized</Eyebrow>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[1, 2, 3, 4, 5].map(score => {
                const selected = responses[currentQ.id] === score;
                const labels = ["Ad-hoc", "Partial", "Defined", "Managed", "Optimized"];
                return (
                  <button
                    key={score}
                    onClick={() => handleAnswer(score)}
                    className={`aspect-[4/3] flex flex-col items-center justify-center border transition-all cursor-pointer group ${
                      selected
                        ? "bg-[var(--color-signal-cyan)] border-[var(--color-signal-cyan)] text-[var(--color-plasma-900)]"
                        : "hairline hover:border-[var(--color-signal-cyan)] hover:bg-[var(--color-plasma-700)]"
                    }`}
                  >
                    <span className={`display-num text-3xl ${selected ? "" : "text-[var(--color-text-primary)]"}`}>
                      {score}
                    </span>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-widest mt-1 ${
                        selected ? "text-[var(--color-plasma-900)]" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {labels[score - 1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Eyebrow>Analyst Note</Eyebrow>
              <textarea
                value={notes[currentQ.id] || ""}
                onChange={e => setNotes(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                placeholder="Context, assumptions, control observations…"
                className="w-full mt-3 min-h-32 bg-transparent border hairline focus:border-[var(--color-signal-cyan)] p-3 text-sm text-[var(--color-text-primary)] font-sans outline-none resize-none placeholder:text-[var(--color-text-disabled)] transition-colors"
              />
            </div>
            <div className="space-y-4">
              <div>
                <Eyebrow>Evidence Reference</Eyebrow>
                <label className="mt-3 flex items-center justify-between gap-3 border hairline hover:border-[var(--color-signal-cyan)] px-4 py-3 cursor-pointer transition-colors group">
                  <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate">
                    {evidenceNames[currentQ.id] || "Attach supporting file"}
                  </span>
                  <Upload size={14} className="text-[var(--color-signal-cyan)] flex-shrink-0" />
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
              <div className="border hairline p-4 space-y-2">
                <Eyebrow>Vector Metadata</Eyebrow>
                {[
                  ["Score", isAnswered ? `${responses[currentQ.id]} / 5` : "—"],
                  ["Stamped", answeredAt[currentQ.id] ? new Date(answeredAt[currentQ.id]).toLocaleTimeString() : "pending"],
                  ["Evidence", evidenceNames[currentQ.id] ? "linked" : "none"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono text-[11px]">
                    <span className="text-[var(--color-text-muted)]">{k}</span>
                    <span className="text-[var(--color-text-primary)]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={() => setCurrIdx(Math.max(0, currIdx - 1))}
              disabled={currIdx === 0}
              className="p-3 border hairline text-[var(--color-text-secondary)] hover:border-[var(--color-signal-cyan)] hover:text-[var(--color-signal-cyan)] disabled:opacity-0 transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <ArrowLeft size={16} />
            </button>

            {allAnswered && (
              <button
                onClick={() => setShowSummary(true)}
                className="px-8 py-3 bg-[var(--color-signal-cyan)] text-[var(--color-plasma-900)] font-mono text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-3"
              >
                Review vectors <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={() => setCurrIdx(Math.min(questions.length - 1, currIdx + 1))}
              disabled={!isAnswered || currIdx === questions.length - 1}
              className="p-3 border hairline text-[var(--color-text-secondary)] hover:border-[var(--color-signal-cyan)] hover:text-[var(--color-signal-cyan)] disabled:opacity-20 transition-colors cursor-pointer"
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
        pillar: a.pillarName.split(/[\s&]+/)[0],
        score: a.score,
        benchmark: a.target,
      })),
    [analytics],
  );
  const alignedCount = analytics.filter((a: any) => a.score >= a.target).length;

  const statusMeta: Record<string, { color: "mint" | "amber" | "coral" | "cyan"; severity: "nominal" | "cyan" | "amber" | "coral"; label: string }> = {
    NOMINAL_SYNC: { color: "mint", severity: "cyan", label: "Nominal sync" },
    VECTOR_DRIFT: { color: "amber", severity: "amber", label: "Vector drift" },
    CRITICAL_GAP: { color: "coral", severity: "coral", label: "Critical gap" },
    STRUCTURAL_WEAKNESS: { color: "coral", severity: "coral", label: "Structural weakness" },
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
              className="bg-transparent font-mono text-xs text-[var(--color-text-primary)] outline-none border-b hairline hover:border-[var(--color-signal-cyan)] cursor-pointer py-1 pr-4 appearance-none transition-colors"
              style={{ backgroundImage: "none" }}
            >
              {allBUs.map((b: any) => (
                <option key={b.id} value={b.id} className="bg-[var(--color-plasma-800)]">
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
            <Eyebrow tone="cyan">RNOS Command Center</Eyebrow>
          </div>
        }
        right={
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 border hairline">
              <StatusLED color={status.color} />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-text-primary)]">
                {status.label}
              </span>
            </div>
            <button
              onClick={onBack}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-signal-coral)] cursor-pointer transition-colors"
              aria-label="Back"
            >
              <X size={16} />
            </button>
          </div>
        }
      />

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6 pb-24">
        {/* ─── TOP HUD: mission metrics ─── */}
        <Panel severity={status.severity} elevated className="p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <Eyebrow>Active Unit</Eyebrow>
              <div className="flex items-baseline gap-3 mt-3">
                <h1 className="font-display text-4xl text-[var(--color-text-primary)] tracking-tight">
                  {entityName}
                </h1>
                <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wide">
                  ID · {bu.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <Eyebrow>Profile</Eyebrow>
                <div className="flex gap-1.5">
                  {benchmarkTypes.map((t: string) => (
                    <button
                      key={t}
                      onClick={() => onBenchmarkTypeChange(t)}
                      className={`px-3 py-1.5 border font-mono text-[10px] tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                        benchmarkType === t
                          ? "border-[var(--color-signal-cyan)] bg-[var(--color-signal-cyan)]/10 text-[var(--color-signal-cyan)]"
                          : "hairline text-[var(--color-text-secondary)] hover:border-[var(--color-signal-cyan)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {BENCHMARK_LABEL[t] || t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-12">
              <div className="flex flex-col justify-between">
                <Eyebrow>Maturity Score</Eyebrow>
                <div className="display-num text-[84px] text-[var(--color-signal-cyan)] leading-none mt-2">
                  {overallScore.toFixed(2)}
                </div>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
                  / 5.00 · overall
                </span>
              </div>
              <div className="w-px bg-[var(--color-hairline-strong)]" />
              <div className="flex flex-col gap-5 justify-between">
                <Metric label="Benchmark Avg" value={benchmarkAverage.toFixed(2)} unit="/ 5" size="sm" />
                <Metric
                  label="Aligned Pillars"
                  value={`${alignedCount}`}
                  unit="/ 10"
                  size="sm"
                  severity={alignedCount >= 7 ? "cyan" : alignedCount >= 4 ? "amber" : "coral"}
                />
                <Metric
                  label="Active Roadmap"
                  value={activeRoadmapCount}
                  unit="actions"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </Panel>

        {/* ─── PILLAR GRID ─── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Pillar Vectors · 10</Eyebrow>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
              CURRENT vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analytics.map((a: any) => {
              const above = a.score >= a.target;
              const nearMiss = a.score >= a.target * 0.8;
              const severity = above ? "cyan" : nearMiss ? "amber" : "coral";
              const ledColor = above ? "mint" : nearMiss ? "amber" : "coral";
              return (
                <Panel key={a.pillarId} severity={severity} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <Eyebrow>{a.pillarName.split(/[\s&]+/)[0].slice(0, 6).toUpperCase()}</Eyebrow>
                    <StatusLED color={ledColor} />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono tracking-wide leading-tight mb-3 h-8">
                    {a.pillarName}
                  </p>
                  <div className="display-num text-2xl text-[var(--color-text-primary)]">
                    {a.score.toFixed(2)}
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px]">
                    <span className="text-[var(--color-text-muted)]">Δ</span>
                    <span className={a.gap > 0 ? "delta-down" : "delta-up"}>
                      {a.gap > 0 ? `-${a.gap.toFixed(2)}` : "ALIGNED"}
                    </span>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>

        {/* ─── CHARTS ROW ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar — pillar vector scope */}
          <Panel className="lg:col-span-5 p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <div>
                <Eyebrow tone="cyan">Pillar Vector Scope</Eyebrow>
                <h3 className="mt-2 font-display text-xl text-[var(--color-text-primary)] tracking-tight">
                  Maturity vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType.toUpperCase()}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
                10 × 5
              </span>
            </div>
            <div className="h-[340px] mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                  <PolarGrid stroke={CHART_COLORS.grid} strokeDasharray="2 4" />
                  <PolarAngleAxis
                    dataKey="pillar"
                    stroke={CHART_COLORS.axis}
                    tick={{ fill: CHART_COLORS.axisLabel, fontSize: 9, fontFamily: "JetBrains Mono" }}
                  />
                  <PolarRadiusAxis stroke={CHART_COLORS.axis} tick={false} axisLine={false} angle={90} domain={[0, 5]} />
                  <Radar
                    name="Current"
                    dataKey="score"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    dot={{ fill: CHART_COLORS.primary, r: 2 }}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="target"
                    stroke={CHART_COLORS.benchmark}
                    fill="transparent"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 pt-4 border-t hairline">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[var(--color-signal-cyan)]" />
                <span className="font-mono text-[10px] text-[var(--color-text-secondary)] tracking-widest uppercase">
                  Current
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t border-dashed border-[var(--color-signal-amber)]" />
                <span className="font-mono text-[10px] text-[var(--color-text-secondary)] tracking-widest uppercase">
                  {BENCHMARK_LABEL[benchmarkType] || benchmarkType}
                </span>
              </div>
            </div>
          </Panel>

          {/* Dimension bars — operating dimension scores */}
          <Panel className="lg:col-span-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Eyebrow tone="cyan">Operating Dimensions</Eyebrow>
                <h3 className="mt-2 font-display text-xl text-[var(--color-text-primary)] tracking-tight">
                  People · Process · Technology · Governance
                </h3>
              </div>
            </div>
            <div className="space-y-5 mt-6">
              {dimensions.map((d: any) => {
                const pct = (d.score / 5) * 100;
                const targetPct = 80; // 4.0 benchmark / 5.0 max
                const above = d.score >= 4.0;
                return (
                  <div key={d.id} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-mono text-[11px] text-[var(--color-text-primary)] tracking-wide uppercase">
                        {d.name}
                      </span>
                      <span className={`display-num text-xl ${above ? "text-[var(--color-signal-cyan)]" : "text-[var(--color-text-primary)]"}`}>
                        {d.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1 bg-[var(--color-plasma-500)] relative">
                      <div
                        className={`absolute inset-y-0 left-0 ${above ? "bg-[var(--color-signal-cyan)]" : "bg-[var(--color-signal-amber)]"}`}
                        style={{
                          width: `${pct}%`,
                          boxShadow: above ? "0 0 8px var(--color-signal-cyan)" : undefined,
                        }}
                      />
                      <div
                        className="absolute inset-y-0 w-px bg-[var(--color-signal-coral)]/60"
                        style={{ left: `${targetPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t hairline grid grid-cols-2 gap-3">
              <div>
                <Eyebrow>Avg Gap</Eyebrow>
                <p className="mt-1 font-mono text-base text-[var(--color-signal-coral)]">
                  {averageGap.toFixed(2)}
                </p>
              </div>
              <div>
                <Eyebrow>Integrity</Eyebrow>
                <p className="mt-1 font-mono text-base text-[var(--color-signal-cyan)]">
                  {systemIntegrity}%
                </p>
              </div>
            </div>
          </Panel>

          {/* Drift + Regression Alerts */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Panel severity={regressions.length > 0 ? "coral" : "cyan"} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Eyebrow tone={regressions.length > 0 ? "cyan" : "muted"}>Drift Signal</Eyebrow>
                <StatusLED color={regressions.length > 0 ? "coral" : "mint"} />
              </div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={driftProfile}>
                    <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="pillar" hide />
                    <YAxis stroke={CHART_COLORS.axis} tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: CHART_COLORS.axisLabel }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={false} />
                    <ReferenceLine y={0} stroke={CHART_COLORS.axis} strokeDasharray="2 2" />
                    <Line
                      type="step"
                      dataKey="delta"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: CHART_COLORS.primary }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-3 border-t hairline flex justify-between font-mono text-[10px]">
                <span className="text-[var(--color-text-muted)]">vs prior baseline</span>
                <span className={regressions.length > 0 ? "text-[var(--color-signal-coral)]" : "text-[var(--color-signal-mint)]"}>
                  {regressions.length} signals
                </span>
              </div>
            </Panel>

            <Panel className="p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <Eyebrow>Response Coverage</Eyebrow>
                <Database size={12} className="text-[var(--color-text-muted)]" />
              </div>
              <div className="space-y-3">
                {[
                  ["Vectors", `${responseSummary.totalResponses}/100`],
                  ["Evidence", String(responseSummary.evidenceCount)],
                  ["Notes", String(responseSummary.noteCount)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-mono text-[11px] pb-2 border-b hairline last:border-0 last:pb-0">
                    <span className="text-[var(--color-text-muted)] uppercase tracking-widest text-[9px]">{k}</span>
                    <span className="text-[var(--color-text-primary)]">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* ─── BENCHMARK COMPARISON ─── */}
        <Panel className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Eyebrow tone="cyan">Pillar Delta Analysis</Eyebrow>
              <h3 className="mt-2 font-display text-xl text-[var(--color-text-primary)] tracking-tight">
                Current vs {BENCHMARK_LABEL[benchmarkType] || benchmarkType} by pillar
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
              AVG {benchmarkAverage.toFixed(2)}
            </span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="pillar"
                  stroke={CHART_COLORS.axis}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: CHART_COLORS.axisLabel }}
                  tickLine={false}
                  axisLine={{ stroke: CHART_COLORS.grid }}
                />
                <YAxis
                  domain={[0, 5]}
                  stroke={CHART_COLORS.axis}
                  tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: CHART_COLORS.axisLabel }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,229,255,0.05)" }} />
                <Bar dataKey="score" fill={CHART_COLORS.primary} radius={0} />
                <Bar dataKey="benchmark" fill={CHART_COLORS.benchmark} opacity={0.4} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* ─── ROADMAP + REGRESSIONS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel className="lg:col-span-2 p-0 overflow-hidden">
            <div className="px-6 py-4 border-b hairline flex items-center justify-between">
              <div>
                <Eyebrow tone="cyan">Improvement Sequencing · Phase 1-3</Eyebrow>
                <h3 className="mt-2 font-display text-xl text-[var(--color-text-primary)] tracking-tight">
                  Uplift Roadmap
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[var(--color-signal-cyan)]">
                {activeRoadmapCount} actions
              </span>
            </div>
            <div className="overflow-auto max-h-[360px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-[var(--color-plasma-800)] border-b hairline sticky top-0">
                  <tr className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    <th className="px-6 py-3 font-normal">Action</th>
                    <th className="px-3 py-3 font-normal">Phase</th>
                    <th className="px-3 py-3 font-normal text-right">Priority</th>
                    <th className="px-6 py-3 font-normal text-right">Uplift</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmap.slice(0, 12).map((item: any, idx: number) => {
                    const pName =
                      analytics.find((e: any) => e.pillarId === item.pillarId)?.pillarName || item.pillarId;
                    const phaseColor =
                      item.phase === "Phase 1"
                        ? "text-[var(--color-signal-cyan)]"
                        : item.phase === "Phase 2"
                          ? "text-[var(--color-signal-amber)]"
                          : "text-[var(--color-text-muted)]";
                    return (
                      <tr
                        key={idx}
                        className="border-b hairline hover:bg-[var(--color-plasma-700)]/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-xs text-[var(--color-text-primary)] font-medium">
                            {item.description}
                          </p>
                          <p className="mt-1 font-mono text-[10px] text-[var(--color-text-muted)] tracking-wide">
                            {pName} · {item.dimensionId}
                          </p>
                        </td>
                        <td className={`px-3 py-4 font-mono text-[10px] tracking-widest uppercase ${phaseColor}`}>
                          {item.phase}
                        </td>
                        <td className="px-3 py-4 text-right font-mono text-xs text-[var(--color-text-primary)]">
                          {item.priorityScore.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-[var(--color-signal-cyan)]">
                          +{item.expectedUplift.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel severity={criticalRegressionsCount > 0 ? "coral" : "nominal"} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <Eyebrow tone={criticalRegressionsCount > 0 ? "cyan" : "muted"}>Regression Alerts</Eyebrow>
              {criticalRegressionsCount > 0 && <StatusLED color="coral" />}
            </div>
            {regressions.length > 0 ? (
              <div className="space-y-2">
                {regressions.slice(0, 6).map((r: any, i: number) => (
                  <div
                    key={i}
                    className="border hairline p-3 flex items-center justify-between hover:border-[var(--color-signal-coral)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-0.5 h-4 ${r.severity === "CRITICAL" ? "bg-[var(--color-signal-coral)]" : "bg-[var(--color-signal-amber)]"}`}
                      />
                      <div>
                        <p className="text-[11px] text-[var(--color-text-primary)] font-medium tracking-wide">
                          {r.pillarName}
                        </p>
                        <p className="font-mono text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest">
                          {r.severity} threshold
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[var(--color-signal-coral)]">
                      {r.delta.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border hairline">
                <ShieldCheck size={24} className="mx-auto text-[var(--color-signal-mint)] mb-3" />
                <p className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase">
                  All Pillars Nominal
                </p>
              </div>
            )}
          </Panel>
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
    <div className="min-h-screen text-[var(--color-text-primary)] font-sans">
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

        {screen === "assessment" && metadata.questions.length > 0 && (
          <motion.div key="assessment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
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
        <div className="fixed inset-0 bg-[var(--color-plasma-900)]/80 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <StatusLED color="cyan" />
              <StatusLED color="cyan" />
              <StatusLED color="cyan" />
            </div>
            <span className="eyebrow-cyan">Synchronizing RNOS core</span>
          </div>
        </div>
      )}
    </div>
  );
}
