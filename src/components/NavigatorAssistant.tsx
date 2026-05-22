import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Send, Sparkles } from "lucide-react";
import { Eyebrow } from "./primitives";
import { getAssistantReply } from "../lib/assistant";

/*
 * Conversational assistant — context-aware popup version.
 * Reads the live analysis payload so prompt chips and the live-context
 * strip reflect what the engine actually knows about this assessment.
 * The bot itself is deterministic (15-pattern matcher in lib/assistant.ts);
 * see CONTEXT.md §9 for the LLM-upgrade decision.
 */
export function NavigatorAssistant({ analysis }: { analysis?: any }) {
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
}
