import React, { ReactNode } from "react";

/*
 * ERM Navigator primitives — "Editorial Risk Atlas" aesthetic.
 * Warm cream base, rich ink, gold highlight. Reads like an institutional
 * quarterly report: folio numerals, ornamental rules, editorial marginalia.
 * Every atom is sized for print-grade typography in a browser.
 */

type Severity = "none" | "amber" | "mint" | "coral" | "ink" | "sky";
type Dot = "amber" | "mint" | "coral" | "sky" | "ink";

const stripeClass: Record<Severity, string> = {
  none: "",
  amber: "stripe-amber",
  mint: "stripe-mint",
  coral: "stripe-coral",
  ink: "stripe-ink",
  sky: "stripe-amber", // visual fallback — sky severity reuses amber stripe
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
    amber: "text-[var(--color-gold)]",
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

/* ── Brand mark — eight-point maturity compass ─────────────
   Gold 8-point star on ink (Islamic-art heritage) with an
   ascending stem (maturity trajectory). Fixed: uses highlight
   token so the star reads as gold, not ink-on-ink. */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="5" fill="var(--color-ink)" />
      {/* 8-point star — governance compass */}
      <path
        d="M12 4 L13.5 8.2 L17.8 6.2 L16 10.5 L20.4 12 L16 13.5 L17.8 17.8 L13.5 15.8 L12 20 L10.5 15.8 L6.2 17.8 L8 13.5 L3.6 12 L8 10.5 L6.2 6.2 L10.5 8.2 Z"
        stroke="var(--color-highlight)"
        strokeWidth="0.6"
        strokeLinejoin="round"
        fill="var(--color-highlight)"
        fillOpacity="0.10"
      />
      {/* Ascending stem — maturity trajectory */}
      <path
        d="M12 16.5 L12 8.8 M9.3 11.5 L12 8.8 L14.7 11.5"
        stroke="var(--color-highlight)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Section rule — horizontal divider with optional label ─ */
export function SectionRule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      {label && <Eyebrow>{label}</Eyebrow>}
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

/* ── Ornamental rule — art-deco divider for editorial moments ─
   Double hairline with a small diamond in the center. Used to
   anchor the top of a screen or separate chapters. */
export function OrnamentalRule({ color = "ink" }: { color?: "ink" | "gold" }) {
  const strokeVar = color === "gold" ? "var(--color-gold)" : "var(--color-border-strong)";
  return (
    <div className="flex items-center justify-center py-3" aria-hidden>
      <div className="flex-1 flex flex-col gap-[3px]">
        <div className="h-px" style={{ background: strokeVar }} />
        <div className="h-px opacity-50" style={{ background: strokeVar }} />
      </div>
      <svg width="10" height="10" viewBox="0 0 10 10" className="mx-4">
        <path d="M5 0 L10 5 L5 10 L0 5 Z" fill={strokeVar} opacity="0.7" />
      </svg>
      <div className="flex-1 flex flex-col gap-[3px]">
        <div className="h-px opacity-50" style={{ background: strokeVar }} />
        <div className="h-px" style={{ background: strokeVar }} />
      </div>
    </div>
  );
}

/* ── Folio numeral — Roman chapter mark in display serif ─── */
export function FolioNumeral({
  numeral,
  size = 64,
}: {
  numeral: string;
  size?: number;
}) {
  return (
    <span
      className="folio-num text-[var(--color-ink)]"
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {numeral}
    </span>
  );
}

/* ── BU glyph — commissioned illustration per business unit ─
   Each operating unit gets its own editorial mark. Uses ink + gold
   from the active theme. Renders at a fixed 28px viewBox. */
export function BuGlyph({ id, size = 28 }: { id: string; size?: number }) {
  const stroke = "var(--color-ink)";
  const accent = "var(--color-gold)";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 28 28",
    fill: "none",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (id) {
    case "gen": // Turbine blades + hub — power generation
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="2" stroke={stroke} />
          <path d="M14 12 L14 5 M13 5 Q14 2 15 5" stroke={stroke} />
          <path d="M15.7 15 L21.8 18.5 M21.8 17.5 Q24.3 18.5 22.8 20.2" stroke={stroke} />
          <path d="M12.3 15 L6.2 18.5 M6.2 17.5 Q3.7 18.5 5.2 20.2" stroke={stroke} />
          <circle cx="14" cy="14" r="10" stroke={accent} opacity="0.35" />
        </svg>
      );
    case "tra": // Grid nodes with arteries — transmission
      return (
        <svg {...common}>
          <circle cx="5" cy="7" r="1.5" fill={stroke} />
          <circle cx="23" cy="7" r="1.5" fill={stroke} />
          <circle cx="14" cy="14" r="1.8" fill={accent} />
          <circle cx="5" cy="21" r="1.5" fill={stroke} />
          <circle cx="23" cy="21" r="1.5" fill={stroke} />
          <path d="M5 7 L14 14 L23 7 M5 21 L14 14 L23 21" stroke={stroke} />
        </svg>
      );
    case "dis": // Distribution — substation + branch
      return (
        <svg {...common}>
          <rect x="11" y="4" width="6" height="8" stroke={stroke} />
          <path d="M14 12 L14 17" stroke={stroke} />
          <path d="M14 17 L6 17 L6 22 M14 17 L14 22 M14 17 L22 17 L22 22" stroke={stroke} />
          <path d="M12.5 7.5 L15.5 7.5 M12.5 9 L15.5 9" stroke={accent} />
        </svg>
      );
    case "corp": // Corporate — tiered column with gold capital
      return (
        <svg {...common}>
          <path d="M6 24 L6 10 L14 5 L22 10 L22 24" stroke={stroke} />
          <path d="M6 10 L22 10" stroke={accent} />
          <path d="M10 24 L10 14 L14 14 L14 24 M18 24 L18 14" stroke={stroke} />
          <path d="M3 24 L25 24" stroke={stroke} />
        </svg>
      );
    case "sub": // Subsidiaries — three stacked platforms
      return (
        <svg {...common}>
          <path d="M4 9 L14 4 L24 9 L14 14 Z" stroke={stroke} fill="none" />
          <path d="M4 14 L14 19 L24 14" stroke={stroke} />
          <path d="M4 19 L14 24 L24 19" stroke={accent} />
        </svg>
      );
    case "jv": // Joint Ventures — interlocking partners
      return (
        <svg {...common}>
          <circle cx="10" cy="14" r="6" stroke={stroke} />
          <circle cx="18" cy="14" r="6" stroke={accent} />
          <path d="M10 11 L10 17 M7 14 L13 14 M18 11 L18 17 M15 14 L21 14" stroke={stroke} opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="20" height="20" rx="2" stroke={stroke} />
          <path d="M10 14 L13 17 L18 11" stroke={accent} strokeWidth="1.8" />
        </svg>
      );
  }
}

/* ── Running footer — editorial page chrome ─────────────── */
export function RunningFooter({
  folio,
  left,
  right,
}: {
  folio?: string;
  left?: string;
  right?: string;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 pointer-events-none z-30">
      <div className="max-w-[1600px] mx-auto px-8 pb-4">
        <div className="flex items-end justify-between font-mono text-[9px] tracking-[0.22em] uppercase text-[var(--color-ink-muted)]">
          <span>{left || "ERM Navigator · SEC Risk Maturity"}</span>
          {folio && (
            <span className="font-display text-[13px] tracking-normal italic text-[var(--color-ink-soft)]">
              {folio}
            </span>
          )}
          <span>{right || "Folio · MMXXVI"}</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Pull quote — editorial reference block ─────────────── */
export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <figure className="pull-quote">
      <span className="pull-quote-mark" aria-hidden>“</span>
      <blockquote>{children}</blockquote>
      {attribution && (
        <figcaption className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-ink-muted)] mt-3">
          — {attribution}
        </figcaption>
      )}
    </figure>
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
    amber: "bg-[var(--color-gold-soft)] text-[var(--color-gold)]",
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
