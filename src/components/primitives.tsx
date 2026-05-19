import React, { ReactNode } from "react";

/*
 * ERM Navigator primitives — Runway working-surface aesthetic.
 * White + ink + one gold accent. Inter everywhere. No editorial decoration.
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

/* ── Card ─────────────────────────────────────────────── */
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

/* ── Eyebrow ──────────────────────────────────────────── */
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

/* ── Status dot ───────────────────────────────────────── */
export function StatusDot({ color = "mint" }: { color?: Dot }) {
  return <span className={`dot dot-${color}`} />;
}

/* ── AnimatedNumber — count-up for hero metrics ───────── */
export function AnimatedNumber({
  value,
  decimals = 2,
  duration = 380,
  className = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  React.useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out quart
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className={className}>{display.toFixed(decimals)}</span>;
}

/* ── Metric — label + number + optional delta ────────── */
export function Metric({
  label,
  value,
  unit,
  delta,
  tone,
  size = "md",
  animated = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: number; suffix?: string };
  tone?: "amber" | "mint" | "coral" | "ink";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}) {
  const sizeMap = { sm: "text-xl", md: "text-2xl", lg: "text-4xl", xl: "text-6xl" };
  const toneMap: Record<string, string> = {
    amber: "text-[var(--color-gold)]",
    mint: "text-[var(--color-mint)]",
    coral: "text-[var(--color-coral)]",
    ink: "text-[var(--color-ink)]",
  };
  const toneClass = tone ? toneMap[tone] : "text-[var(--color-ink)]";
  const isNum = typeof value === "number";
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-baseline gap-2">
        <span className={`display-num ${sizeMap[size]} ${toneClass}`}>
          {isNum && animated ? <AnimatedNumber value={value as number} /> : value}
        </span>
        {unit && (
          <span className="font-mono text-[10px] text-[var(--color-ink-muted)] tracking-wide">
            {unit}
          </span>
        )}
        {delta !== undefined && (
          <span className={`font-mono text-[10px] ${delta.value >= 0 ? "delta-up" : "delta-down"}`}>
            {delta.value >= 0 ? "↑" : "↓"} {Math.abs(delta.value).toFixed(2)}
            {delta.suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Brand mark — 8-point compass star on ink ─────────── */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="1" y="1" width="22" height="22" rx="5" fill="var(--color-ink)" />
      <path
        d="M12 4 L13.5 8.2 L17.8 6.2 L16 10.5 L20.4 12 L16 13.5 L17.8 17.8 L13.5 15.8 L12 20 L10.5 15.8 L6.2 17.8 L8 13.5 L3.6 12 L8 10.5 L6.2 6.2 L10.5 8.2 Z"
        stroke="var(--color-highlight)"
        strokeWidth="0.5"
        strokeLinejoin="round"
        fill="var(--color-highlight)"
        fillOpacity="0.08"
      />
      <path
        d="M12 16.5 L12 8.8 M9.3 11.5 L12 8.8 L14.7 11.5"
        stroke="var(--color-highlight)"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Brand — wordmark lockup (only place Fraunces appears) ─ */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={20} />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="wordmark text-[15px] text-[var(--color-ink)]">
            ERM Navigator
          </span>
        </div>
      )}
    </div>
  );
}

/* ── BU glyph — per-unit editorial mark ────────────────── */
export function BuGlyph({ id, size = 18 }: { id: string; size?: number }) {
  const stroke = "currentColor";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 28 28",
    fill: "none",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (id) {
    case "gen":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="2" stroke={stroke} />
          <path d="M14 12 L14 5 M13 5 Q14 2 15 5" stroke={stroke} />
          <path d="M15.7 15 L21.8 18.5 M21.8 17.5 Q24.3 18.5 22.8 20.2" stroke={stroke} />
          <path d="M12.3 15 L6.2 18.5 M6.2 17.5 Q3.7 18.5 5.2 20.2" stroke={stroke} />
        </svg>
      );
    case "tra":
      return (
        <svg {...common}>
          <circle cx="5" cy="7" r="1.2" fill={stroke} />
          <circle cx="23" cy="7" r="1.2" fill={stroke} />
          <circle cx="14" cy="14" r="1.4" fill={stroke} />
          <circle cx="5" cy="21" r="1.2" fill={stroke} />
          <circle cx="23" cy="21" r="1.2" fill={stroke} />
          <path d="M5 7 L14 14 L23 7 M5 21 L14 14 L23 21" stroke={stroke} />
        </svg>
      );
    case "dis":
      return (
        <svg {...common}>
          <rect x="11" y="4" width="6" height="8" stroke={stroke} />
          <path d="M14 12 L14 17" stroke={stroke} />
          <path d="M14 17 L6 17 L6 22 M14 17 L14 22 M14 17 L22 17 L22 22" stroke={stroke} />
        </svg>
      );
    case "corp":
      return (
        <svg {...common}>
          <path d="M6 24 L6 10 L14 5 L22 10 L22 24" stroke={stroke} />
          <path d="M10 24 L10 14 L14 14 L14 24 M18 24 L18 14" stroke={stroke} />
          <path d="M3 24 L25 24" stroke={stroke} />
        </svg>
      );
    case "sub":
      return (
        <svg {...common}>
          <path d="M4 9 L14 4 L24 9 L14 14 Z" stroke={stroke} />
          <path d="M4 14 L14 19 L24 14" stroke={stroke} />
          <path d="M4 19 L14 24 L24 19" stroke={stroke} />
        </svg>
      );
    case "jv":
      return (
        <svg {...common}>
          <circle cx="10" cy="14" r="6" stroke={stroke} />
          <circle cx="18" cy="14" r="6" stroke={stroke} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="20" height="20" rx="2" stroke={stroke} />
        </svg>
      );
  }
}

/* ── Keycap — inline keyboard hint ────────────────────── */
export function Keycap({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 border hairline rounded-[4px] bg-[var(--color-surface)] font-mono text-[10px] text-[var(--color-ink-soft)]">
      {children}
    </span>
  );
}

/* ── Pill ─────────────────────────────────────────────── */
export function Pill({
  children,
  tone = "ink",
  size = "default",
}: {
  children: ReactNode;
  tone?: "ink" | "amber" | "mint" | "coral" | "sky" | "gold";
  size?: "default" | "sm";
}) {
  const toneMap: Record<string, string> = {
    ink: "bg-[var(--color-surface-soft)] text-[var(--color-ink)]",
    amber: "bg-[var(--color-gold-soft)] text-[var(--color-gold)]",
    mint: "bg-[var(--color-mint-soft)] text-[var(--color-mint)]",
    coral: "bg-[var(--color-coral-soft)] text-[var(--color-coral)]",
    sky: "bg-[var(--color-sky-soft)] text-[var(--color-sky)]",
    gold: "bg-[var(--color-gold-soft)] text-[var(--color-gold)]",
  };
  const sizeCls = size === "sm"
    ? "px-2 py-0.5 text-[9px] tracking-[0.12em]"
    : "px-2.5 py-1 text-[10px] tracking-[0.12em]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium uppercase ${sizeCls} ${toneMap[tone]}`}
    >
      {children}
    </span>
  );
}

/* ── SectionRule — horizontal divider ─────────────────── */
export function SectionRule({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-[var(--color-border)]" />
      {label && <Eyebrow>{label}</Eyebrow>}
      <div className="flex-1 h-px bg-[var(--color-border)]" />
    </div>
  );
}

/* ── Sparkline — tiny inline trend indicator ──────────── */
export function Sparkline({
  values,
  width = 80,
  height = 20,
  color,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const strokeColor = color || "var(--color-gold)";
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
