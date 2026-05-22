import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { BrandMark, Eyebrow } from "../components/primitives";

/*
 * Login screen — masthead split layout. Left rail: brand lockup + sign-in
 * form + trust strip. Right rail: ISO 31000 clause 5.4 quote + 100 / 10×4 /
 * 24 stat cards. The right rail is hidden below `lg` breakpoint (mobile
 * collapses to single-column).
 */
export function LoginScreen({
  onLogin,
  loading,
  error,
}: {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--color-bg)] overflow-hidden">
      <div className="flex flex-col px-8 lg:px-20 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <BrandMark size={28} />
          <div className="flex flex-col leading-none">
            <span className="wordmark text-[17px] text-[var(--color-ink)]">ERM Navigator</span>
            <span className="font-mono text-[9px] tracking-[0.10em] text-[var(--color-ink-muted)] mt-1.5 uppercase">
              Risk Maturity Platform
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-auto max-w-[440px] w-full"
        >
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.10em] text-[var(--color-accent)] font-medium">
            <span>●</span><span>Sign in</span>
          </div>

          <h1 className="mt-4 text-[44px] font-medium leading-[1.05] tracking-[-0.028em] text-[var(--color-ink)] font-sans">
            The risk navigator.
          </h1>

          <p className="mt-4 text-[14.5px] leading-[1.55] text-[var(--color-ink-soft)] max-w-[400px]">
            An auditable maturity platform for enterprise risk programs. Aligned to ISO&nbsp;31000, COSO&nbsp;ERM, and NIST&nbsp;RMF.
          </p>

          <div className="mt-9 flex flex-col gap-4">
            <div>
              <Eyebrow className="block mb-2">Operator email</Eyebrow>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="analyst@gmail.com"
                autoFocus
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border hairline rounded-[7px] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div>
              <Eyebrow className="block mb-2">Passphrase</Eyebrow>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[var(--color-surface)] border hairline rounded-[7px] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="border hairline py-2.5 px-3 rounded-[7px] bg-[var(--color-coral-soft)]"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className="text-[var(--color-coral)]" />
                  <span className="text-[12px] text-[var(--color-coral)]">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading}
              className="btn-cta w-full mt-2"
            >
              {loading ? "Signing in…" : "Enter the Navigator"}
              {!loading && <ArrowRight size={13} />}
            </button>
          </div>

          <div className="mt-7 inline-flex items-center gap-3.5 px-3.5 py-2 rounded-full border hairline bg-[var(--color-bg-deep)] font-mono text-[11px] text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[var(--color-mint)]">●</span> Replayable
            </span>
            <span className="w-px h-3 bg-[var(--color-border-strong)]" />
            <span>Audit-traceable</span>
            <span className="w-px h-3 bg-[var(--color-border-strong)]" />
            <span>Standards-aligned</span>
          </div>
        </motion.div>

        <div className="mt-auto pt-8 font-mono text-[10.5px] tracking-[0.04em] text-[var(--color-ink-muted)]">
          ISO 31000 · COSO ERM · NIST RMF · RIMS RMM
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center px-16 py-20 bg-[var(--color-bg-deep)] border-l hairline">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[560px]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--color-accent)] font-medium">
            The framework, in its own words
          </div>

          <blockquote
            className="mt-6 pl-5 border-l-2 text-[24px] leading-[1.4] tracking-[-0.018em] text-[var(--color-ink)]"
            style={{ borderColor: 'var(--color-accent-line)', fontWeight: 400 }}
          >
            Risk management should be an integral part of all organizational activities — <span className="text-[var(--color-accent)]">dynamic, iterative, and responsive to change</span>, informed by the best available information.
          </blockquote>
          <div className="mt-3 pl-5 font-mono text-[10.5px] uppercase tracking-[0.10em] text-[var(--color-ink-muted)]">
            ISO 31000 : 2018 · clause 5.4
          </div>

          <p className="mt-10 text-[14.5px] leading-[1.6] text-[var(--color-ink-soft)] italic max-w-[480px]" style={{ fontFamily: 'var(--font-wordmark)' }}>
            Every assessment is auditable: every score, every note, every evidence link is stamped, addressable, and reproducible on demand.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { n: '100',  l: 'standards-aligned\nvectors per unit' },
              { n: '10×4', l: 'pillars × operating\ndimensions' },
              { n: '24',   l: 'patent claims\ncovered' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-[18px] bg-[var(--color-surface)] rounded-[10px] border hairline"
              >
                <div className="text-[32px] font-medium leading-none tracking-[-0.025em] text-[var(--color-accent)]">
                  {s.n}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)] whitespace-pre-line leading-[1.4]">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
