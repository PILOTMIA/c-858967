import { expect, test } from "bun:test";
import { sizePosition, referenceIsFresh, type SizingSettings } from "../src/lib/positionSizing";
const settings: SizingSettings = { stopPips: 20, bufferPips: 0, feePerLot: 0, contract: 100000, pip: 0.0001, lotStep: 0.01, minLot: 0.01, maxLot: 100, quoteToUsd: 1 };
test("1000 balance at user-example 5% risk sizes to 0.25 EURUSD lots with 20-pip stop", () => {
  const r = sizePosition(1000 * 0.05, settings);
  expect(r.lots).toBe(0.25);
  expect(r.riskAtStop).toBe(50);
});
test("8% risk sizes to 0.40 lots instead of assuming profit", () => expect(sizePosition(80, settings).lots).toBe(0.4));
test("USDJPY uses 0.01 pip and inverse JPY conversion", () => {
  const r = sizePosition(100, { ...settings, pip: 0.01, quoteToUsd: 1 / 150 });
  expect(r.pipValue).toBeCloseTo(6.666666, 5);
  expect(r.lots).toBe(0.75);
});
test("EURGBP converts quote GBP to USD", () => expect(sizePosition(100, { ...settings, quoteToUsd: 1.25 }).lots).toBe(0.4));
test("costs and rounding never exceed risk budget", () => {
  const r = sizePosition(50, { ...settings, bufferPips: 2, feePerLot: 7 });
  expect(r.lots).toBe(0.22);
  expect(r.riskAtStop).toBeCloseTo(49.94, 2);
});
test("below minimum gives no trade; broker maximum caps lots", () => {
  expect(sizePosition(1, settings).lots).toBe(0);
  expect(sizePosition(1000, { ...settings, maxLot: 1 }).lots).toBe(1);
});
test("gold uses selected ounces contract and pip convention", () => expect(sizePosition(50, { ...settings, contract: 100, pip: 0.01, stopPips: 500 }).lots).toBe(0.1));
test("reject zero stop, missing conversion and stale references", () => {
  expect(() => sizePosition(50, { ...settings, stopPips: 0 })).toThrow();
  expect(() => sizePosition(50, { ...settings, quoteToUsd: NaN })).toThrow();
  const now = Date.parse("2026-10-30T04:17:00Z");
  expect(referenceIsFresh("2026-10-29", now)).toBe(true);
  expect(referenceIsFresh("2026-10-20", now)).toBe(false);
});