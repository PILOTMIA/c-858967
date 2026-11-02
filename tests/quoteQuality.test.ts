import { expect, test } from "bun:test";
import { usableQuote, quoteStatus, quoteChange } from "../src/lib/quoteQuality";

test("hardcoded fallback and invalid prices never qualify as usable quotes", () => {
  expect(usableQuote({ rate: 1, source: "fallback" })).toBe(false);
  expect(usableQuote({ rate: 0, source: "Yahoo Finance" })).toBe(false);
});
test("a fresh retrieval does not make a daily reference a live quote", () => {
  expect(quoteStatus({ rate: 0.82, source: "frankfurter-ecb", asOf: "2026-10-30", kind: "daily-reference" }, Date.parse("2026-11-02T05:25:00Z"))).toBe("Daily reference");
});
test("market freshness uses the provider time, not fetch time", () => {
  const now = Date.parse("2026-11-02T05:25:00Z");
  expect(quoteStatus({ rate: 1.12, source: "Yahoo Finance", asOf: "2026-10-30T21:00:00Z" }, now)).toBe("Delayed / last close");
  expect(quoteStatus({ rate: 1.12, source: "Yahoo Finance", asOf: "2026-11-02T05:24:00Z" }, now)).toBe("Market quote");
});
test("missing provider timestamps and prior closes cannot imply freshness or change", () => {
  expect(quoteStatus({ rate: 1.12, source: "gold-api" })).toBe("Time unverified");
  expect(quoteChange({ rate: 1.12, source: "Yahoo Finance" })).toBeUndefined();
  expect(quoteChange({ rate: 1.12, previousClose: 1.10, source: "Yahoo Finance" })).toBeCloseTo(1.81818);
});