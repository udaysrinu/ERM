import React from "react";
import { BrandMark, BuGlyph, Eyebrow } from "./primitives";
import { BU_TINTS } from "../lib/bu-tints";
import type { Screen } from "../types";

/*
 * Persistent left rail for every authed screen. Two stacked groups:
 *
 * 1. Operating units — the BU rail. Click is navigational, not
 *    generative — opens a unit's most recent completed assessment if
 *    any, else routes to scope. Never silently overwrites a draft.
 *
 * 2. Workspace nav — Today / Operating units / Assessment / Action plan
 *    / Evidence / History / Report / Provenance. The Assessment item is
 *    intentionally not directly navigable: it requires a BU pick first.
 *
 * Plus operator email + standards footer + log out button at bottom.
 */
export function DPSidebar({
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
}) {
  const workspaceItems: { key: string; label: string; target: Screen | null; active: boolean }[] = [
    { key: "today",    label: "Today",          target: "navigator",  active: screen === "navigator" },
    { key: "scope",    label: "Operating units", target: "scope",     active: screen === "scope" },
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
      <div className="flex items-center gap-2.5 mb-6">
        <BrandMark size={22} />
        <span className="wordmark text-[15px] text-[var(--color-ink)]">
          ERM Navigator
        </span>
      </div>

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
}
