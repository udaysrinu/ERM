import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TooltipProvider } from "./components/ui/tooltip";
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
  BENCHMARK_TYPES,
  BUSINESS_UNITS,
  PILLARS,
  QUESTIONS,
  WEIGHTS,
} from "./data/static";
import { NavigatorAssistant } from "./components/NavigatorAssistant";
import { DPSidebar } from "./components/DPSidebar";
import { LoginScreen } from "./screens/LoginScreen";
import { ScopeScreen } from "./screens/ScopeScreen";
import { VectorCapturePipeline } from "./screens/VectorCapturePipeline";
import { TodayScreen } from "./screens/TodayScreen";
import { StatusDot } from "./components/primitives";
import { BENCHMARK_LABEL } from "./lib/labels";
import type { Screen } from "./types";
import {
  ActionPlanScreen,
  EvidenceScreen,
  ReportScreen,
  HistoryScreen,
  ProvenanceScreen,
  EmptyHub,
} from "./screens/AuxiliaryScreens";



// ─── D+ SHELL — persistent sidebar + top bar wrapped around authed screens ──

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
  // Separate flag for analysis fetches — those fire on every BU click and
  // benchmark switch, so a full-screen blocking overlay is too aggressive.
  // Surfaced as a 2px progress strip at the top of the screen instead.
  const [analysisLoading, setAnalysisLoading] = useState(false);
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
    evidencePaths: Record<number, string>;
    answeredAt: Record<number, string>;
  }>({ id: null, responses: {}, notes: {}, evidenceNames: {}, evidencePaths: {}, answeredAt: {} });

  const entities = BUSINESS_UNITS;
  const metadata = { pillars: PILLARS, questions: QUESTIONS, weights: WEIGHTS };
  const benchmarkTypes = BENCHMARK_TYPES;

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
    setAssessmentDraft({ id: aid, responses: {}, notes: {}, evidenceNames: {}, evidencePaths: {}, answeredAt: {} });
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
    setAnalysisLoading(true);
    try {
      const res = await fetch(
        `/api/assessments/${aid}/analysis?benchmarkType=${bType}&operatorEmail=${encodeURIComponent(loginEmail)}`,
        { signal: ctrl.signal },
      );
      const data = await res.json();
      if (!ctrl.signal.aborted) setAnalysis(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") console.error(e);
    } finally {
      if (!ctrl.signal.aborted) setAnalysisLoading(false);
    }
  };

  const handleAssessmentComplete = async ({ responses, notes, evidenceNames, evidencePaths, answeredAt }: any) => {
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
        evidencePath: evidencePaths?.[q.id] || "",
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
    setAssessmentDraft({ id: null, responses: {}, notes: {}, evidenceNames: {}, evidencePaths: {}, answeredAt: {} });
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
                    assessmentId={assessmentId}
                    operatorEmail={loginEmail}
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
                    <EvidenceScreen
                      analysis={analysis}
                      bu={selectedBU}
                      assessmentId={assessmentId}
                      operatorEmail={loginEmail}
                      onOpenToday={() => setScreen("navigator")}
                    />
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
                  <TodayScreen
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

      {/* Subtle top-progress strip — fires on analysis fetches without
          blocking the screen. The big "Computing" overlay was overkill
          for routine sidebar clicks and benchmark switches. */}
      {analysisLoading && (
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[150] overflow-hidden bg-[var(--color-accent)]/15">
          <div
            className="absolute inset-y-0 w-1/3 bg-[var(--color-accent)]"
            style={{ animation: "loadingSlide 1.1s ease-in-out infinite" }}
          />
        </div>
      )}

      {/* Full-screen blocker for genuinely user-blocking ops:
          login authentication and assessment finalize. */}
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
