import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { applyCors } from "../../_lib/cors.js";
import { sql } from "../../_lib/db.js";
import {
  computeAnalytics,
  computeDrift,
  computeVectors,
  generateRoadmap,
  missionStatus,
  type RawResponse,
} from "../../_lib/engines.js";
import {
  BUSINESS_UNIT_NAMES, BENCHMARKS, PILLAR_IDS,
  PILLAR_PROVENANCE, MATURITY_LEVELS, SCORE_LEGEND,
} from "../../_lib/static.js";

// A4 dimensions in points.
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const INK = rgb(0.10, 0.098, 0.082);              // #1A1915
const INK_SOFT = rgb(0.36, 0.34, 0.30);
const INK_MUTED = rgb(0.55, 0.53, 0.48);
const INK_SUBTLE = rgb(0.72, 0.70, 0.66);
const HAIRLINE = rgb(0.85, 0.83, 0.78);
const SURFACE_SOFT = rgb(0.97, 0.96, 0.93);
const CORAL = rgb(0.65, 0.26, 0.15);              // #A64226
const MINT = rgb(0.18, 0.42, 0.28);               // #2E6B48
const AMBER = rgb(0.78, 0.55, 0.20);
const GOLD = rgb(0.72, 0.55, 0.15);

const BENCHMARK_LABEL: Record<string, string> = {
  target: "Target",
  industry: "Industry",
  peers: "Peers",
  external: "External",
};

const STATUS_LABEL: Record<string, string> = {
  NOMINAL_SYNC: "Nominal Sync",
  VECTOR_DRIFT: "Vector Drift",
  CRITICAL_GAP: "Critical Gap",
  STRUCTURAL_WEAKNESS: "Structural Weakness",
};

const STATUS_TONE: Record<string, ReturnType<typeof rgb>> = {
  NOMINAL_SYNC: MINT,
  VECTOR_DRIFT: AMBER,
  CRITICAL_GAP: CORAL,
  STRUCTURAL_WEAKNESS: CORAL,
};

interface Fonts { regular: PDFFont; bold: PDFFont; }

// pdf-lib's standard Helvetica only supports WinAnsi codepoints. Strip /
// transliterate non-WinAnsi characters so we never throw on smart quotes,
// Greek deltas, em-dashes, etc.
const WIN_ANSI_TRANSLIT: Record<string, string> = {
  '–': '-',  // en dash
  '—': '-',  // em dash
  '‘': "'",  // left single quote
  '’': "'",  // right single quote / apostrophe
  '“': '"',  // left double quote
  '”': '"',  // right double quote
  '…': '...',// ellipsis
  '·': '-',  // middle dot
  '•': '-',  // bullet
  ' ': ' ',  // non-breaking space
  '→': '->', // right arrow
  '←': '<-', // left arrow
  'Δ': 'd ', // capital delta (regression marker)
  '×': 'x',  // multiplication sign
  '÷': '/',  // division sign
  '≥': '>=', // ge
  '≤': '<=', // le
  '±': '+/-',// plus-minus
};

function sanitizeForPdf(s: string): string {
  return (s ?? '').replace(/[^\x20-\x7E]/g, ch => WIN_ANSI_TRANSLIT[ch] ?? '');
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: {
  font: PDFFont; size: number; color?: ReturnType<typeof rgb>;
}) {
  page.drawText(sanitizeForPdf(text), { x, y, font: opts.font, size: opts.size, color: opts.color ?? INK });
}

function drawEyebrow(page: PDFPage, text: string, x: number, y: number, fonts: Fonts) {
  drawText(page, text.toUpperCase(), x, y, { font: fonts.bold, size: 8, color: INK_MUTED });
}

function drawHairline(page: PDFPage, x: number, y: number, w: number) {
  page.drawRectangle({ x, y, width: w, height: 0.5, color: HAIRLINE });
}

function drawPill(page: PDFPage, label: string, x: number, y: number, fonts: Fonts, tone: ReturnType<typeof rgb>) {
  const w = fonts.bold.widthOfTextAtSize(label, 9) + 18;
  const h = 16;
  page.drawRectangle({ x, y, width: w, height: h, color: tone, opacity: 0.12 });
  page.drawRectangle({ x, y, width: w, height: h, borderColor: tone, borderWidth: 0.5, color: undefined as any, opacity: 0 });
  drawText(page, label, x + 9, y + 4.5, { font: fonts.bold, size: 9, color: tone });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  // Sanitize first so wrapping measurements use only WinAnsi-encodable text.
  const safe = sanitizeForPdf(text);
  const words = safe.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = trial;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawCoverPage(
  page: PDFPage,
  fonts: Fonts,
  args: { entityName: string; overallScore: number; assessmentId: string; missionStatusKey: string; date: string },
) {
  const margin = 56;
  let y = A4_HEIGHT - margin;

  // Logo placeholder 6x6 ink rect
  page.drawRectangle({ x: margin, y: y - 6, width: 6, height: 6, color: INK });
  drawText(page, "ERM Navigator  ·  Executive Maturity Report", margin + 14, y - 5, {
    font: fonts.bold, size: 10, color: INK,
  });

  y -= 80;
  // Big BU name 36pt — wrap if needed
  const buLines = wrapText(args.entityName, fonts.bold, 32, A4_WIDTH - margin * 2);
  for (const line of buLines) {
    drawText(page, line, margin, y, { font: fonts.bold, size: 32, color: INK });
    y -= 38;
  }

  y -= 30;
  drawEyebrow(page, "Maturity score", margin, y, fonts);
  y -= 60;
  const scoreText = args.overallScore.toFixed(2);
  drawText(page, scoreText, margin, y, { font: fonts.bold, size: 56, color: INK });
  const scoreWidth = fonts.bold.widthOfTextAtSize(scoreText, 56);
  drawText(page, "/ 5.00", margin + scoreWidth + 8, y + 8, {
    font: fonts.regular, size: 14, color: INK_MUTED,
  });

  y -= 50;
  drawEyebrow(page, "Mission status", margin, y, fonts);
  y -= 22;
  const statusLabel = STATUS_LABEL[args.missionStatusKey] ?? args.missionStatusKey;
  const statusTone = STATUS_TONE[args.missionStatusKey] ?? MINT;
  drawPill(page, statusLabel, margin, y - 4, fonts, statusTone);

  // Meta block at bottom
  let by = margin + 60;
  drawHairline(page, margin, by + 40, A4_WIDTH - margin * 2);
  drawEyebrow(page, "Date generated", margin, by + 22, fonts);
  drawText(page, args.date, margin, by + 8, { font: fonts.regular, size: 10, color: INK });

  drawEyebrow(page, "Audit ID", margin + 220, by + 22, fonts);
  drawText(page, args.assessmentId, margin + 220, by + 8, { font: fonts.regular, size: 10, color: INK });

  drawText(
    page,
    "Aligned to ISO 31000  ·  COSO ERM  ·  NIST RMF",
    margin, margin - 20,
    { font: fonts.regular, size: 8, color: INK_MUTED },
  );
}

function drawPillarTable(
  page: PDFPage,
  fonts: Fonts,
  analytics: any[],
  benchmarkLabel: string,
) {
  const margin = 56;
  let y = A4_HEIGHT - margin;
  drawEyebrow(page, "Pillar vectors", margin, y, fonts);
  y -= 24;
  drawText(page, `Maturity vs ${benchmarkLabel}`, margin, y, {
    font: fonts.bold, size: 18, color: INK,
  });

  y -= 28;

  const cols = [
    { label: "Pillar", x: margin, w: 230 },
    { label: "Score", x: margin + 230, w: 60 },
    { label: "Benchmark", x: margin + 290, w: 70 },
    { label: "Gap", x: margin + 360, w: 50 },
    { label: "Status", x: margin + 410, w: 80 },
  ];

  // Header row
  page.drawRectangle({ x: margin, y: y - 4, width: A4_WIDTH - margin * 2, height: 18, color: SURFACE_SOFT });
  for (const c of cols) {
    drawText(page, c.label.toUpperCase(), c.x + 4, y + 2, {
      font: fonts.bold, size: 8, color: INK_MUTED,
    });
  }
  y -= 18;
  drawHairline(page, margin, y, A4_WIDTH - margin * 2);
  y -= 4;

  for (const a of analytics) {
    y -= 18;
    drawText(page, a.pillarName, cols[0].x + 4, y, { font: fonts.regular, size: 10, color: INK });
    drawText(page, a.score.toFixed(2), cols[1].x + 4, y, { font: fonts.bold, size: 10, color: INK });
    drawText(page, a.target.toFixed(2), cols[2].x + 4, y, { font: fonts.regular, size: 10, color: INK_SOFT });
    const realGap = a.score - a.target; // negative = under target
    const gapColor = realGap < 0 ? CORAL : MINT;
    const gapStr = (realGap >= 0 ? "+" : "") + realGap.toFixed(2);
    drawText(page, gapStr, cols[3].x + 4, y, { font: fonts.bold, size: 10, color: gapColor });
    drawText(page, a.status, cols[4].x + 4, y, { font: fonts.bold, size: 8, color: INK_SOFT });
    drawHairline(page, margin, y - 4, A4_WIDTH - margin * 2);
  }
}

function drawDimensionsAndRoadmap(
  page: PDFPage,
  fonts: Fonts,
  dimensions: any[],
  roadmap: any[],
  regressions: any[],
) {
  const margin = 56;
  let y = A4_HEIGHT - margin;

  drawEyebrow(page, "Operating dimensions", margin, y, fonts);
  y -= 18;

  const dimMap = new Map<string, number>();
  for (const d of dimensions) dimMap.set(String(d.id).toLowerCase(), Number(d.score));

  const dimRows = [
    { label: "People", key: "people" },
    { label: "Process", key: "process" },
    { label: "Technology", key: "technology" },
    { label: "Governance", key: "governance" },
  ];
  for (const r of dimRows) {
    y -= 16;
    const score = dimMap.get(r.key);
    drawText(page, r.label, margin, y, { font: fonts.regular, size: 10, color: INK });
    drawText(
      page,
      score === undefined ? "—" : score.toFixed(2),
      margin + 200, y,
      { font: fonts.bold, size: 10, color: INK },
    );
    drawHairline(page, margin, y - 4, A4_WIDTH - margin * 2);
  }

  y -= 28;
  drawEyebrow(page, "Uplift roadmap", margin, y, fonts);
  y -= 14;

  const top = roadmap.slice(0, 10);
  for (let i = 0; i < top.length; i++) {
    const item = top[i];
    if (y < 140) break;
    y -= 14;
    const num = `${String(i + 1).padStart(2, "0")}`;
    drawText(page, num, margin, y, { font: fonts.bold, size: 9, color: INK_MUTED });

    const desc = wrapText(item.description, fonts.regular, 9.5, A4_WIDTH - margin * 2 - 130);
    drawText(page, desc[0] ?? "", margin + 22, y, { font: fonts.regular, size: 9.5, color: INK });
    if (desc[1]) {
      y -= 11;
      drawText(page, desc[1], margin + 22, y, { font: fonts.regular, size: 9.5, color: INK });
    }
    const meta = `${item.phase}  ·  uplift ${Number(item.expectedUplift).toFixed(2)}  ·  pri ${Number(item.priorityScore).toFixed(2)}`;
    drawText(page, meta, A4_WIDTH - margin - fonts.regular.widthOfTextAtSize(meta, 8), y, {
      font: fonts.regular, size: 8, color: INK_MUTED,
    });
    y -= 4;
    drawHairline(page, margin, y, A4_WIDTH - margin * 2);
  }

  if (regressions.length > 0 && y > 100) {
    y -= 22;
    drawEyebrow(page, "Regression alerts", margin, y, fonts);
    y -= 14;
    for (const r of regressions) {
      if (y < 70) break;
      y -= 14;
      const tone = r.severity === "CRITICAL" ? CORAL : AMBER;
      drawText(page, r.pillarName, margin, y, { font: fonts.bold, size: 9.5, color: INK });
      drawText(page, r.severity, margin + 200, y, { font: fonts.bold, size: 9, color: tone });
      drawText(page, `Δ ${Number(r.delta).toFixed(2)}`, margin + 280, y, {
        font: fonts.regular, size: 9, color: INK_SOFT,
      });
      drawHairline(page, margin, y - 4, A4_WIDTH - margin * 2);
    }
  }
}

function drawMethodology(page: PDFPage, fonts: Fonts, timestamp: string) {
  const margin = 56;
  const maxW = A4_WIDTH - margin * 2;
  let y = A4_HEIGHT - margin;
  drawEyebrow(page, "Methodology", margin, y, fonts);
  y -= 24;
  drawText(page, "How this report is computed", margin, y, {
    font: fonts.bold, size: 18, color: INK,
  });
  y -= 28;

  const paragraphs: { title: string; body: string }[] = [
    {
      title: "Scoring",
      body: "Each pillar is computed as a weighted average across the four operating dimensions (People, Process, Technology, Governance). The overall maturity score is the pillar-weighted aggregate of those rollups.",
    },
    {
      title: "Benchmarks",
      body: "Four reference profiles ship with the platform — Target (4.0 internal), Industry (sector-average), Peers (utility-operator cluster), External (regulator-grade aspirational). The active profile drives all gap and drift calculations.",
    },
    {
      title: "Reproducibility",
      body: "All scoring, drift, and roadmap sequencing are deterministic functions of the captured 100-vector responses. Identical responses always produce identical reports — auditable, replayable, citation-ready.",
    },
  ];

  for (const p of paragraphs) {
    drawText(page, p.title.toUpperCase(), margin, y, { font: fonts.bold, size: 9, color: GOLD });
    y -= 14;
    const lines = wrapText(p.body, fonts.regular, 10.5, maxW);
    for (const line of lines) {
      drawText(page, line, margin, y, { font: fonts.regular, size: 10.5, color: INK });
      y -= 14;
    }
    y -= 8;
  }

  // Score legend — sourced from xlsx Scoring Guidelines sheet.
  drawText(page, "5-LEVEL MATURITY SCALE", margin, y, { font: fonts.bold, size: 9, color: GOLD });
  y -= 14;
  for (const lvl of [1, 2, 3, 4, 5]) {
    drawText(page, `${lvl}`, margin, y, { font: fonts.bold, size: 10.5, color: INK });
    drawText(page, SCORE_LEGEND[lvl] || "", margin + 16, y, { font: fonts.regular, size: 10, color: INK });
    y -= 13;
  }

  drawHairline(page, margin, margin - 4, maxW);
  drawText(
    page,
    `Generated ${timestamp}  ·  ERM Navigator  ·  Patent claims 1–24`,
    margin, margin - 18,
    { font: fonts.regular, size: 8, color: INK_MUTED },
  );
}

// New 5th page: standards alignment per pillar (sourced from xlsx Scoring Guidelines).
function drawStandardsAlignment(page: PDFPage, fonts: Fonts) {
  const margin = 56;
  const maxW = A4_WIDTH - margin * 2;
  let y = A4_HEIGHT - margin;
  drawEyebrow(page, "Standards alignment", margin, y, fonts);
  y -= 24;
  drawText(page, "Per-pillar provenance", margin, y, { font: fonts.bold, size: 18, color: INK });
  y -= 28;

  for (const pid of PILLAR_IDS) {
    const meta = (PILLAR_PROVENANCE as any)[pid];
    if (!meta) continue;
    if (y < margin + 60) break;
    const pillarLabel = (pid + " · " + (meta.weight * 100).toFixed(0) + "%").toUpperCase();
    drawText(page, pillarLabel, margin, y, { font: fonts.bold, size: 9, color: GOLD });
    y -= 12;
    const stdLines = wrapText(meta.standards, fonts.regular, 9.5, maxW);
    for (const line of stdLines.slice(0, 2)) {
      drawText(page, line, margin, y, { font: fonts.regular, size: 9.5, color: INK_SOFT });
      y -= 11;
    }
    y -= 6;
  }

  drawHairline(page, margin, margin - 4, maxW);
  drawText(
    page,
    "Sourced from ERM Navigator framework (ISO 31000 · COSO ERM · NIST RMF · RIMS RMM)",
    margin, margin - 18,
    { font: fonts.regular, size: 8, color: INK_MUTED },
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const id = req.query.id as string;
  const benchmarkType = (typeof req.query.benchmarkType === "string" ? req.query.benchmarkType : "target");

  try {
    const [assessment] = await sql<
      { id: string; entityId: string; createdAt: string; status: string }[]
    >`SELECT id, "entityId", "createdAt", status FROM assessments WHERE id = ${id}`;
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const rawResponses = await sql<
      { questionId: number; score: number; note: string; evidenceName: string; answeredAt: string }[]
    >`
      SELECT "questionId", score, note, "evidenceName", "answeredAt"
      FROM responses WHERE "assessmentId" = ${id}
    `;

    const responses: RawResponse[] = rawResponses.map(r => ({
      questionId: r.questionId,
      score: r.score,
      note: r.note,
      evidenceName: r.evidenceName,
      answeredAt: r.answeredAt,
    }));
    const { pillarScores, dimensionScores, overallScore } = computeVectors(responses);
    const { analytics, benchmarkAverage } = computeAnalytics(pillarScores, benchmarkType);

    // Drift vs prior assessment for same entity.
    const [prior] = await sql<{ id: string }[]>`
      SELECT id FROM assessments
      WHERE "entityId" = ${assessment.entityId}
        AND id != ${id}
        AND "createdAt" < ${assessment.createdAt}
      ORDER BY "createdAt" DESC LIMIT 1
    `;
    let regressions: any[] = [];
    if (prior) {
      const priorResponses = await sql<{ questionId: number; score: number }[]>`
        SELECT "questionId", score FROM responses WHERE "assessmentId" = ${prior.id}
      `;
      const { pillarScores: priorScores } = computeVectors(
        priorResponses.map(r => ({ questionId: r.questionId, score: r.score })),
      );
      const drift = computeDrift(pillarScores, priorScores);
      regressions = drift.regressions;
    }

    const roadmap = generateRoadmap(pillarScores, benchmarkType);
    const criticalRegressionsCount = regressions.filter(r => r.severity === "CRITICAL").length;
    const status = missionStatus({
      criticalRegressionsCount,
      overallScore,
      benchmarkAverage,
      regressionsCount: regressions.length,
    });

    const entityName = BUSINESS_UNIT_NAMES[assessment.entityId] ?? assessment.entityId;
    const benchmarkLabel = BENCHMARK_LABEL[benchmarkType] ?? benchmarkType;
    // Touch BENCHMARKS + PILLAR_IDS so unused-import linters stay quiet.
    void BENCHMARKS;
    void PILLAR_IDS;

    const dimensions = [...dimensionScores.entries()].map(([dimId, score]) => ({
      id: dimId,
      score: Number(score.toFixed(2)),
    }));

    const now = new Date();
    const date = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timestamp = now.toISOString();

    // ── Build PDF ──────────────────────────────────────────────────────
    const pdf = await PDFDocument.create();
    pdf.setTitle(`ERM Navigator · ${entityName}`);
    pdf.setAuthor("ERM Navigator");
    pdf.setSubject(`Executive Maturity Report · ${benchmarkLabel}`);
    pdf.setProducer("ERM Navigator");
    pdf.setCreationDate(now);

    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fonts: Fonts = { regular, bold };

    const cover = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    drawCoverPage(cover, fonts, {
      entityName,
      overallScore: Number(overallScore.toFixed(2)),
      assessmentId: id,
      missionStatusKey: status,
      date,
    });

    const pillars = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    drawPillarTable(pillars, fonts, analytics, benchmarkLabel);

    const dims = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    drawDimensionsAndRoadmap(dims, fonts, dimensions, roadmap, regressions);

    const meth = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    drawMethodology(meth, fonts, timestamp);

    const standards = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    drawStandardsAlignment(standards, fonts);

    const bytes = await pdf.save();

    const dateSlug = now.toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="erm-report-${assessment.entityId}-${dateSlug}.pdf"`,
    );
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(Buffer.from(bytes));
  } catch (error) {
    console.error("pdf endpoint failed:", error);
    return res.status(500).json({ error: "pdf generation failure", details: String(error) });
  }
}
