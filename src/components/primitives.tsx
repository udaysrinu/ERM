import React, { ReactNode } from "react";

/*
 * Instrumentation primitives.
 * These compose into every screen — keeping them tiny and predictable
 * preserves the "engineered measuring equipment" gestalt across the app.
 */

type Severity = "nominal" | "cyan" | "amber" | "coral";

const stripeClass: Record<Severity, string> = {
  nominal: "",
  cyan: "stripe-cyan",
  amber: "stripe-amber",
  coral: "stripe-coral",
};

export function Panel({
  children,
  severity = "nominal",
  className = "",
  elevated = false,
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  severity?: Severity;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={`${elevated ? "panel-elevated" : "panel"} ${stripeClass[severity]} ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "cyan";
  className?: string;
}) {
  return (
    <span className={`${tone === "cyan" ? "eyebrow-cyan" : "eyebrow"} ${className}`}>
      {children}
    </span>
  );
}

type LED = "mint" | "amber" | "coral" | "cyan";
export function StatusLED({ color = "mint", label }: { color?: LED; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`led led-${color}`} />
      {label && <span className="eyebrow">{label}</span>}
    </span>
  );
}

/* Metric — the atomic data display. Display-number + eyebrow label + optional delta. */
export function Metric({
  label,
  value,
  unit,
  delta,
  severity,
  size = "md",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; suffix?: string };
  severity?: Severity;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl",
  };

  const severityColor: Record<Severity, string> = {
    nominal: "text-[var(--color-text-primary)]",
    cyan: "text-[var(--color-signal-cyan)]",
    amber: "text-[var(--color-signal-amber)]",
    coral: "text-[var(--color-signal-coral)]",
  };

  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-baseline gap-2">
        <span className={`display-num ${sizeMap[size]} ${severity ? severityColor[severity] : ""}`}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider">
            {unit}
          </span>
        )}
        {delta !== undefined && (
          <span className={`font-mono text-xs ${delta.value >= 0 ? "delta-up" : "delta-down"}`}>
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value).toFixed(2)}
            {delta.suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* Header bar — top of every screen. App lockup + session crumb. */
export function HeaderBar({ crumb, right }: { crumb?: ReactNode; right?: ReactNode }) {
  return (
    <header className="border-b hairline bg-[var(--color-plasma-900)]/40 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Brand />
          {crumb && (
            <div className="flex items-center gap-3 border-l hairline pl-6">
              <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-widest">
                /
              </span>
              {crumb}
            </div>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[17px] tracking-tight text-[var(--color-text-primary)] font-medium">
            ERM Navigator
          </span>
          <span className="font-mono text-[9px] tracking-[0.25em] text-[var(--color-text-muted)] mt-1">
            RNOS · CORE · v0.1
          </span>
        </div>
      )}
    </div>
  );
}

/* Brand mark — minimal inline SVG. Concentric instrumentation rings. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeOpacity="0.15" />
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="16" cy="16" r="3" fill="var(--color-signal-cyan)" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
      <line x1="26" y1="16" x2="30" y2="16" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
      <g style={{ transformOrigin: "16px 16px", animation: "brand-sweep 8s linear infinite" }}>
        <line
          x1="16"
          y1="16"
          x2="16"
          y2="3"
          stroke="var(--color-signal-cyan)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
      <style>{`@keyframes brand-sweep { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

/* Section divider with label */
export function SectionRule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 h-px bg-[var(--color-hairline)]" />
      {label && <span className="eyebrow">{label}</span>}
      <div className="flex-1 h-px bg-[var(--color-hairline)]" />
    </div>
  );
}

/* Hairline grid tick marks — for chart axes */
export function TickAxis({
  count = 5,
  vertical = false,
  className = "",
}: {
  count?: number;
  vertical?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${vertical ? "flex flex-col justify-between h-full" : "flex justify-between w-full"} ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="block bg-[var(--color-hairline-strong)]"
          style={{ width: vertical ? 4 : 1, height: vertical ? 1 : 4 }}
        />
      ))}
    </div>
  );
}

/* Keycap — inline key-like element for keyboard hints */
export function Keycap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 border hairline rounded-[3px] bg-[var(--color-plasma-600)] font-mono text-[10px] text-[var(--color-text-secondary)]">
      {children}
    </span>
  );
}
