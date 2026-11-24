import { chartDraftSchema, plannedR, type ChartDraft, type SavedTrade } from "./chart";

export type TradeRow = { id: string; created_at: string; archived: boolean | number | null; record: unknown; image_key: string | null };
export type JournalTrade = SavedTrade & { imageKey: string | null };

const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.slice(0, max) : fallback);
const num = (v: unknown) => {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
};
const oneOf = <T extends string>(v: unknown, opts: readonly T[], fallback: T): T => (opts.includes(v as T) ? (v as T) : fallback);

/** Lenient analysis reader: older drafts (no analysisVersion / setupReviews) stay readable. */
function readAnalysis(v: unknown): ChartDraft | null {
  if (!v || typeof v !== "object") return null;
  const strict = chartDraftSchema.safeParse(v);
  if (strict.success) return strict.data;
  const a = v as Record<string, unknown>;
  const observations = Array.isArray(a.observations)
    ? a.observations.filter((o): o is { kind: string; text: string } => !!o && typeof o === "object" && typeof (o as { text?: unknown }).text === "string")
        .map(o => ({ kind: oneOf(o.kind, ["visible", "interpretation", "missing"] as const, "interpretation"), text: o.text.slice(0, 700) }))
    : [];
  return {
    isTradingChart: a.isTradingChart !== false, symbol: str(a.symbol, 30) || null, timeframe: str(a.timeframe, 30) || null,
    direction: a.direction === "long" || a.direction === "short" ? a.direction : null,
    entry: num(a.entry), stopLoss: num(a.stopLoss), takeProfit: num(a.takeProfit),
    setup: str(a.setup, 100) || null, summary: str(a.summary, 1200), observations: observations.slice(0, 10),
    missing: Array.isArray(a.missing) ? a.missing.filter((m): m is string => typeof m === "string").slice(0, 10) : [],
  };
}

/** Reads every stored record shape (JSON text from the original app, or JSONB) into the current shape. */
export function normaliseTrade(row: TradeRow): JournalTrade {
  let r: Record<string, unknown> = {};
  try { r = typeof row.record === "string" ? JSON.parse(row.record) : (row.record as Record<string, unknown>) ?? {}; } catch { r = {}; }
  const base = {
    symbol: str(r.symbol, 30, "Unknown"), timeframe: str(r.timeframe, 30),
    direction: oneOf(r.direction, ["long", "short", "unknown"] as const, "unknown"),
    entry: num(r.entry), stopLoss: num(r.stopLoss), takeProfit: num(r.takeProfit),
    setup: str(r.setup, 100), session: oneOf(r.session, ["Unknown", "Asia", "London", "New York", "Other"] as const, "Unknown"),
    stage: oneOf(r.stage, ["planned", "open", "closed"] as const, "planned"),
    tradeDate: typeof r.tradeDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.tradeDate) ? r.tradeDate : "",
    notes: str(r.notes, 5000), outcome: oneOf(r.outcome, ["not_recorded", "win", "loss", "breakeven"] as const, "not_recorded"), verified: true as const, isSample: r.isSample === true, analysis: readAnalysis(r.analysis),
  };
  const stored = typeof r.plannedR === "number" && Number.isFinite(r.plannedR) ? r.plannedR : null;
  return { ...base, id: row.id, createdAt: row.created_at, archived: row.archived === true || row.archived === 1, plannedR: stored ?? plannedR(base), imageKey: row.image_key };
}

export type JournalFilter = "all" | "planned" | "open" | "closed" | "sample";
export function filterTrades(trades: JournalTrade[], opts: { archived: boolean; filter: JournalFilter; search: string }) {
  const q = opts.search.trim().toLowerCase();
  return trades.filter(t => t.archived === opts.archived
    && (opts.filter === "all" || (opts.filter === "sample" ? t.isSample : !t.isSample && t.stage === opts.filter))
    && `${t.symbol} ${t.setup} ${t.notes} ${t.timeframe}`.toLowerCase().includes(q));
}

/** Summary-only CSV (no images, no AI draft); formula-like cells are neutralised. */
export function journalCsv(trades: JournalTrade[]): string {
  const cell = (v: unknown) => { let text = v == null ? "" : String(v); if (/^[=+@\-\t\r]/.test(text)) text = "'" + text; return `"${text.replace(/"/g, '""')}"`; };
  const columns = ["Market", "Timeframe", "Direction", "Stage", "Trade date", "Entry", "Stop", "Target", "Planned reward/risk", "Setup", "Session", "Notes", "Outcome", "Sample", "Archived", "Recorded at"];
  const rows = trades.map(t => [t.symbol, t.timeframe, t.direction, t.stage, t.tradeDate, t.entry, t.stopLoss, t.takeProfit, t.plannedR, t.setup, t.session, t.notes, t.outcome, t.isSample, t.archived, t.createdAt]);
  return "\uFEFF" + [columns, ...rows].map(r => r.map(cell).join(",")).join("\r\n");
}
