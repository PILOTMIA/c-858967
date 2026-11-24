import { describe, expect, test } from "bun:test";
import { normaliseTrade, filterTrades, journalCsv } from "../src/lib/journal/records";
import { plannedR, riskError, tradeInputSchema, SAMPLE_DRAFT } from "../src/lib/journal/chart";
import { normaliseSetupReviews } from "../src/lib/journal/setups";

const base = { symbol: "GBPUSD", timeframe: "15m", direction: "long" as const, entry: 1.2642, stopLoss: 1.2628, takeProfit: 1.267, setup: "", session: "London" as const, stage: "planned" as const, tradeDate: "", notes: "", isSample: false, analysis: null };

describe("journal rules", () => {
  test("saving requires confirmation", () => {
    expect(tradeInputSchema.safeParse({ ...base, verified: false }).success).toBe(false);
    expect(tradeInputSchema.safeParse({ ...base, verified: true }).success).toBe(true);
  });
  test("long stop must sit below entry", () => expect(riskError({ ...base, stopLoss: 1.27 })).toBe("For a long plan, the stop must be below the entry."));
  test("negative prices are rejected", () => expect(tradeInputSchema.safeParse({ ...base, verified: true, entry: -1 }).success).toBe(false));
  test("planned R is reward over risk", () => expect(plannedR(base)).toBe(2));
  test("pending required condition downgrades supported to developing", () => {
    const r = SAMPLE_DRAFT.setupReviews![0];
    const out = normaliseSetupReviews([{ ...r, checks: r.checks.map((c, i) => i === 0 ? { ...c, status: "pending" } : c) }]);
    expect(out[0].status).toBe("developing");
  });
  test("legacy JSON-text record without analysisVersion is readable", () => {
    const t = normaliseTrade({ id: "a", created_at: "2026-01-01T00:00:00Z", archived: 1, image_key: null, record: JSON.stringify({ ...base, entry: "1.2642", analysis: { summary: "old", observations: [{ kind: "visible", text: "x" }] } }) });
    expect(t.archived).toBe(true); expect(t.entry).toBe(1.2642); expect(t.plannedR).toBe(2); expect(t.analysis?.summary).toBe("old");
  });
  test("filters by archive, stage and search", () => {
    const a = normaliseTrade({ id: "1", created_at: "x", archived: false, image_key: null, record: { ...base, notes: "sweep" } });
    const b = normaliseTrade({ id: "2", created_at: "x", archived: true, image_key: null, record: base });
    expect(filterTrades([a, b], { archived: false, filter: "planned", search: "SWEEP" }).map(t => t.id)).toEqual(["1"]);
    expect(filterTrades([a, b], { archived: true, filter: "all", search: "" }).map(t => t.id)).toEqual(["2"]);
  });
  test("CSV neutralises formulas and excludes images", () => {
    const csv = journalCsv([normaliseTrade({ id: "1", created_at: "x", archived: false, image_key: "u/k.png", record: { ...base, notes: "=HYPERLINK()" } })]);
    expect(csv).toContain(`"'=HYPERLINK()"`); expect(csv).not.toContain("u/k.png");
  });
});
