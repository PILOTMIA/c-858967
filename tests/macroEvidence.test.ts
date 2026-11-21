import { expect, test } from "bun:test";
import { observedMacroValue, observedRateScore, UNAVAILABLE_MACRO } from "../src/lib/macroEvidence";

test("missing macro observations cannot contribute a directional score", () => {
  expect(observedMacroValue(UNAVAILABLE_MACRO, "gdp")).toBeNull();
  expect(observedRateScore(UNAVAILABLE_MACRO, { ...UNAVAILABLE_MACRO, interestRate: 4.5, source: "fred" })).toBeNull();
});

test("fallback rates cannot masquerade as observed evidence", () => {
  expect(observedRateScore({ ...UNAVAILABLE_MACRO, interestRate: 9.5, source: "fallback" }, { ...UNAVAILABLE_MACRO, interestRate: 4.5, source: "fred" })).toBeNull();
});

test("observed zero and negative rates remain valid and GDP levels do not affect the score", () => {
  const base = { ...UNAVAILABLE_MACRO, interestRate: 0, gdp: 100000, source: "fred" };
  const quote = { ...UNAVAILABLE_MACRO, interestRate: -0.5, gdp: 1, source: "fred" };
  expect(observedMacroValue(base, "interestRate")).toBe(0);
  expect(observedRateScore(base, quote)).toBe(0.07);
});