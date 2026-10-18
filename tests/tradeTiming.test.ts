import { describe, expect, test } from "bun:test";
import { alignedWeekday, forexIsOpen, pairSpotBias, timingAssessment } from "../src/lib/tradeTiming";
import { computePairCall } from "../src/lib/pairBias";

describe("COT direction is not entry timing", () => {
  test("USDJPY uses USD as the reference, not a synthetic basket subtraction", () => {
    expect(pairSpotBias("USD", "JPY", { USD: -2, JPY: 1.5 })).toBe(-1.5);
  });
  test("missing daily evidence cannot confirm a directional recommendation", () => {
    expect(computePairCall("USD", "JPY", { net: 2076, weekly: 1212 }, { net: -33673, weekly: -8630 }).direction).toBe("WAIT");
  });
  test("October 13 yen positioning and flow use the same scales everywhere", () => {
    const call = computePairCall("USD", "JPY", { net: 2076, weekly: 1212 }, { net: -33673, weekly: -8630 }, 0.1);
    expect(call.netSpread).toBe(35749);
    expect(call.flowSpread).toBe(9842);
    expect(call.direction).toBe("LONG");
  });
  test("squeeze does not invent a 70-percent confidence floor", () => {
    const call = computePairCall("EUR", "USD", { net: -68001, weekly: -23740 }, { net: 2076, weekly: 1212 }, 1);
    expect(call.squeeze).toBe(true);
    expect(call.displayConviction).toBeCloseTo(Math.abs(call.conviction));
  });
  test("Sunday October 18 before the New York open is a wait", () => {
    const result = timingAssessment({ direction: "LONG", reportDates: ["2026-10-13", "2026-10-13"], priceDate: "2026-10-16", now: new Date("2026-10-18T19:52:00Z") });
    expect(result.status).toBe("WAIT");
    expect(forexIsOpen(new Date("2026-10-18T21:00:00Z"))).toBe(true);
  });
  test("different COT weeks cannot produce a timing watchlist", () => {
    expect(timingAssessment({ direction: "LONG", reportDates: ["2026-10-06", "2026-10-13"], priceDate: "2026-10-16", now: new Date("2026-10-19T12:00:00Z") }).status).toBe("WAIT");
  });
  test("stale daily prices block timing", () => {
    expect(timingAssessment({ direction: "LONG", reportDates: ["2026-10-13"], priceDate: "2026-10-10", now: new Date("2026-10-19T12:00:00Z") }).status).toBe("WAIT");
  });
  test("open markets still provide a watchlist, never a buy-now permission", () => {
    expect(timingAssessment({ direction: "LONG", reportDates: ["2026-10-13"], priceDate: "2026-10-16", now: new Date("2026-10-19T12:00:00Z") }).status).toBe("WATCHLIST");
  });
  test("a wrong-direction weekday is not used as a best-day fallback", () => {
    expect(alignedWeekday([{ day: "Monday", avgPct: -1, upRate: 30, samples: 80 }], "LONG")).toBeUndefined();
  });
  test("insufficient weekday samples do not create confidence", () => {
    expect(alignedWeekday([{ day: "Monday", avgPct: 1, upRate: 80, samples: 2 }], "LONG")).toBeUndefined();
  });
});