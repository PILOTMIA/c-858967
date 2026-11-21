import { expect, test } from "bun:test";
import report from "./fixtures/cot-2026-11-17.json";
import { relativeReturn, invertReturn, pairPositioning, validPairPositions, selectedPairKey } from "../src/lib/pairCalculations";
import { pairSpotBias } from "../src/lib/tradeTiming";
import { computePairCall } from "../src/lib/pairBias";
import { calculatePipValue } from "../src/lib/pipCalculations";
import { computePairScores } from "../src/lib/pairScorecard";

test("cross returns divide price ratios instead of subtracting percentages", () => {
  expect(relativeReturn(10, 5)).toBeCloseTo(4.7619047619, 8);
  expect(pairSpotBias("EUR", "GBP", { EUR: 10, GBP: 5 })).toBeCloseTo(4.7619047619, 8);
});
test("inverse percentage return is reciprocal, not negation", () => {
  expect(invertReturn(10)).toBeCloseTo(-9.0909090909, 8);
  expect(invertReturn(-100)).toBeUndefined();
  expect(relativeReturn(NaN, 0)).toBeUndefined();
});
const currencies = report.filter(r => ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "MXN", "USD"].includes(r.currency));
const position = (r: typeof report[number]) => ({ long: r.long_positions, short: r.short_positions, net: r.long_positions-r.short_positions, weekly: r.change_long-r.change_short, reportDate: r.report_date });
test("all 72 selectable currency orientations use consistent scores and measured contract shares", () => {
  let checked = 0;
  for (const b of currencies) for (const q of currencies) {
    if (b.currency === q.currency) continue;
    const bp = position(b), qp = position(q);
    expect(selectedPairKey(b.currency, q.currency)).toBe(`${b.currency}${q.currency}`);
    const result = pairPositioning(bp, qp), inverse = pairPositioning(qp, bp);
    expect(result).not.toBeNull(); expect(inverse).not.toBeNull();
    if (!result || !inverse) throw Error("Missing comparison");
    expect(result.bullContracts).toBe(b.long_positions + q.short_positions);
    expect(result.bearContracts).toBe(b.short_positions + q.long_positions);
    expect(result.bullPercent).toBeCloseTo(result.bullContracts / (result.bullContracts+result.bearContracts) * 100);
    expect(result.bullPercent+result.bearPercent).toBeCloseTo(100);
    expect(result.positionScore).toBeCloseTo(-inverse.positionScore);
    expect(result.positionScore).toBeCloseTo(computePairCall(b.currency,q.currency,bp,qp,0).positionScore);
    const scores = computePairScores(b.currency, q.currency, { [b.currency]: bp, [q.currency]: qp }, {}, 0);
    expect(scores.cotScore).toBe(Number((result.positionScore / 100 * 3).toFixed(2)));
    expect(scores.totalScore).toBe(Number(((scores.cotScore ?? 0)+(scores.trendScore ?? 0)).toFixed(2)));
    checked++;
  }
  expect(checked).toBe(72);
});

test("missing scorecard observations return unavailable, never zero evidence", () => {
  const scores = computePairScores("EUR", "USD", {}, {}, 1, NaN);
  expect(scores.cotScore).toBeNull();
  expect(scores.trendScore).toBeNull();
  expect(scores.totalScore).toBeNull();
  expect(scores.seasScore).toBeNull();
  expect(scores.call.direction).toBe("WAIT");
});
test("missing or unmatched COT reports cannot become neutral or scored comparisons", () => {
  const p = position(currencies[0]);
  expect(pairPositioning(p, undefined)).toBeNull();
  expect(validPairPositions(p, { ...p, reportDate: "2026-11-10" })).toBe(false);
  expect(pairPositioning(p, { ...p, net: 1 })).toBeNull();
  expect(computePairCall("EUR", "USD", { net: -76587, weekly: -4911 }, {}, 2).direction).toBe("WAIT");
  expect(computePairCall("EUR", "USD", { net: NaN, weekly: 1 }, { net: 0, weekly: 0 }, 2).squeeze).toBe(false);
});
test("pip conversion handles JPY, crosses, inverse account conversion and equal currencies", () => {
  const rates = { USDJPY: { rate: 150 }, GBPUSD: { rate: 1.25 }, EURUSD: { rate: 1.1 } };
  const s = { lots: 1, stopPips: 20, contract: 100000, pipSize: 0.01, quote: "JPY", account: "USD" };
  expect(calculatePipValue(s, rates)?.perPip).toBeCloseTo(1000/150);
  expect(calculatePipValue({ ...s, pipSize: 0.0001, quote: "GBP" }, rates)?.perPip).toBe(12.5);
  expect(calculatePipValue({ ...s, account: "EUR" }, rates)?.perPip).toBeCloseTo(1000/150/1.1);
  expect(calculatePipValue({ ...s, account: "JPY" }, {})?.perPip).toBe(1000);
});
test("pip calculator rejects negative, blank-equivalent and nonfinite values", () => {
  const s = { lots: 1, stopPips: 20, contract: 100000, pipSize: 0.0001, quote: "USD", account: "USD" };
  expect(calculatePipValue({ ...s, lots: NaN }, {})).toBeNull();
  expect(calculatePipValue({ ...s, stopPips: -10 }, {})).toBeNull();
  expect(calculatePipValue({ ...s, lots: Infinity }, {})).toBeNull();
  expect(calculatePipValue(s, {})?.risk).toBe(200);
});