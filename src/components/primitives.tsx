import React, { ReactNode } from "react";

/*
 * ERM Navigator primitives — Runway-inspired aesthetic.
 * Warm cream base, rich brown ink, amber accent. Reusable atoms that
 * keep the premium FP&A-dashboard feel consistent across screens.
 */

type Severity = "none" | "amber" | "mint" | "coral" | "ink";
type Dot = "amber" | "mint" | "coral" | "sky" | "ink";

const stripeClass: Record<Severity, string> = {
  none: "",
  amber: "stripe-amber",
  mint: "stripe-mint",
  coral: "stripe-coral",
  ink: "stripe-ink",
};

/* ── Card — the primary container atom ──────────────────── */
export function Card({
  children,
  severity = "none",
  className = "",
  variant = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  severity?: Severity;
  variant?: "default" | "subtle" | "flat";
}) {
  const base =
    variant === "subtle" ? "card-subtle" : variant === "flat" ? "card-flat" : "card";
  return (
    <div className={`${base} ${stripeClass[severity]} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/* ── Eyebrow — small mono uppercase label ───────────────── */
export function Eyebrow({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "amber" | "ink";
  className?: string;
}) {
  const cls =
    tone === "amber" ? "eyebrow-amber" : tone === "ink" ? "eyebrow-ink" : "eyebrow";
  return <span className={`${cls} ${className}`}>{children}</span>;
}

/* ── Status dot (severity indicator) ────────────────────── */
export function StatusDot({ color = "mint" }: { color?: Dot }) {
  return <span className={`dot dot-${color}`} />;
}

/* ── Metric — label + display number + optional delta ───── */
export function Metric({
  label,
  value,
  unit,
  delta,
  tone,
  size = "md",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; suffix?: string };
  tone?: "amber" | "mint" | "coral" | "ink";
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl",
  };
  const toneMap: Record<string, string> = {
    amber: "text-[var(--color-accent-ink)]",
    mint: "text-[var(--color-mint)]",
    coral: "text-[var(--color-coral)]",
    ink: "text-[var(--color-ink)]",
  };
  const toneClass = tone ? toneMap[tone] : "text-[var(--color-ink)]";

  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-baseline gap-2">
        <span className={`display-num ${sizeMap[size]} ${toneClass}`}>{value}</span>
        {unit && (
          <span className="font-mono text-[11px] text-[var(--color-ink-muted)] tracking-wide">
            {unit}
          </span>
        )}
        {delta !== undefined && (
          <span className={`font-mono text-[11px] ${delta.value >= 0 ? "delta-up" : "delta-down"}`}>
            {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value).toFixed(2)}
            {delta.suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Header bar — top of screens ─────────────────────────── */
export function HeaderBar({ crumb, right }: { crumb?: ReactNode; right?: ReactNode }) {
  return (
    <header className="border-b hairline bg-[var(--color-bg)]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Brand />
          {crumb && (
            <div className="flex items-center gap-3 border-l hairline pl-6">{crumb}</div>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}

/* ── Brand lockup ───────────────────────────────────────── */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[17px] tracking-tight text-[var(--color-ink)] font-medium">
            ERM Navigator
          </span>
          <span className="font-mono text-[9px] tracking-[0.22em] text-[var(--color-ink-muted)] mt-1 uppercase">
            SEC Risk Maturity Platform
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Brand mark — maturity compass glyph ─────────────────
   Eight-point geometric star (Islamic-art heritage) with a
   central ascending arrow-stem. Reads as: "measurement across
   all directions, trending upward toward maturity."
   Colors use the primary-on-ink pairing from the active theme. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="5" fill="var(--color-ink)" />
      {/* 8-point star outline — governance compass */}
      <g stroke="var(--color-accent)" strokeWidth="1" opacity="0.35">
        <path d="M12 4 L14 8 L18 6 L16 10 L20 12 L16 14 L18 18 L14 16 L12 20 L10 16 L6 18 L8 14 L4 12 L8 10 L6 6 L10 8 Z" />
      </g>
      {/* Ascending stem — maturity trajectory */}
      <path
        d="M12 17 L12 9 M9 12 L12 9 L15 12"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Section rule ───────────────────────────────────────── */
export function SectionRule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      {label && <Eyebrow>{label}</Eyebrow>}
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

/* ── Keycap — inline keyboard hint ──────────────────────── */
export function Keycap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 border hairline rounded-[5px] bg-[var(--color-surface)] font-mono text-[10px] text-[var(--color-ink-soft)]">
      {children}
    </span>
  );
}

/* ── Pill — small rounded tag ───────────────────────────── */
export function Pill({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "amber" | "mint" | "coral" | "sky" | "gold";
}) {
  const toneMap: Record<string, string> = {
    ink: "bg-[var(--color-surface-soft)] text-[var(--color-ink)]",
    amber: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    mint: "bg-[var(--color-mint-soft)] text-[var(--color-mint)]",
    coral: "bg-[var(--color-coral-soft)] text-[var(--color-coral)]",
    sky: "bg-[var(--color-sky-soft)] text-[var(--color-sky)]",
    gold: "bg-[var(--color-gold-soft)] text-[var(--color-gold)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-[0.16em] ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
}
