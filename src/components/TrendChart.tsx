import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, Eyebrow } from "./primitives";

const CHART = {
  ink: "#1A1915",
  gold: "#C89A3E",
  grid: "rgba(26,25,21,0.06)",
  axis: "rgba(26,25,21,0.28)",
  axisLabel: "rgba(26,25,21,0.52)",
  mutedInk: "rgba(26,25,21,0.32)",
};

interface PillarPoint {
  pillarId: string;
  pillarName: string;
  score: number;
}
interface Session {
  id: string;
  createdAt: string;
  overallScore: number;
  pillars: PillarPoint[];
}

interface Props {
  entityId: string;
  operatorEmail: string;
  benchmarkType: string;
}

// 10 muted-ink shades for individual pillar lines.
const PILLAR_LINE_SHADES = [
  "rgba(26,25,21,0.55)",
  "rgba(26,25,21,0.42)",
  "rgba(26,25,21,0.62)",
  "rgba(26,25,21,0.36)",
  "rgba(26,25,21,0.50)",
  "rgba(26,25,21,0.30)",
  "rgba(26,25,21,0.58)",
  "rgba(26,25,21,0.44)",
  "rgba(26,25,21,0.34)",
  "rgba(26,25,21,0.48)",
];

export function TrendChart({ entityId, operatorEmail, benchmarkType }: Props) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      entityId,
      operatorEmail,
      benchmarkType,
    });
    fetch(`/api/assessments/trend?${params.toString()}`)
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (cancelled) return;
        setSessions(json.sessions || []);
      })
      .catch(err => {
        if (cancelled) return;
        setError(String(err));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entityId, operatorEmail, benchmarkType]);

  // Header shared across all card states for visual consistency.
  const header = (
    <div className="mb-3">
      <Eyebrow>Evolution</Eyebrow>
      <h3 className="display-heading text-[16px] mt-1 text-[var(--color-ink)]">
        Pillar evolution
      </h3>
    </div>
  );

  if (loading) {
    return (
      <Card className="p-5">
        {header}
        <Eyebrow>Loading evolution…</Eyebrow>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-5">
        {header}
        <Eyebrow>Unable to load trend</Eyebrow>
      </Card>
    );
  }

  if (!sessions || sessions.length < 2) {
    return (
      <Card className="p-5">
        {header}
        <p className="text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
          Need at least 2 historical sessions to plot evolution. Run another
          assessment to begin.
        </p>
      </Card>
    );
  }

  // Build chart rows: one row per session with all pillar columns + overall.
  const pillarMeta = sessions[0].pillars.map(p => ({
    pillarId: p.pillarId,
    pillarName: p.pillarName,
  }));

  const data = sessions.map(s => {
    const date = new Date(s.createdAt);
    const row: Record<string, any> = {
      date: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Overall: s.overallScore,
    };
    s.pillars.forEach(p => {
      row[p.pillarName] = p.score;
    });
    return row;
  });

  return (
    <Card className="p-5">
      {header}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={CHART.axis}
              tick={{ fill: CHART.axisLabel, fontSize: 9, fontFamily: "Inter" }}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              stroke={CHART.axis}
              tick={{ fill: CHART.axisLabel, fontSize: 9, fontFamily: "Inter" }}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid rgba(26,25,21,0.12)",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "Inter",
              }}
              labelStyle={{ color: CHART.ink, fontWeight: 600 }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 9,
                fontFamily: "Inter",
                color: CHART.axisLabel,
                paddingTop: 6,
              }}
            />
            <ReferenceLine
              y={4.0}
              stroke={CHART.gold}
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            {pillarMeta.map((p, i) => (
              <Line
                key={p.pillarId}
                type="monotone"
                dataKey={p.pillarName}
                stroke={PILLAR_LINE_SHADES[i % PILLAR_LINE_SHADES.length]}
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="Overall"
              stroke={CHART.ink}
              strokeWidth={2.4}
              dot={{ r: 2.5, fill: CHART.ink }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default TrendChart;
