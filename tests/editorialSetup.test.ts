import { expect, test } from "bun:test";
import { bitcoinEditorialSetup, usdchfEditorialSetup } from "../src/lib/editorialSetup";

test("USDCHF scenario preserves the author's Fibonacci rejection level", () => {
  expect(usdchfEditorialSetup.rejectionLevel).toBe(0.8400);
});
test("USDCHF scenario preserves the three staged targets", () => {
  expect(usdchfEditorialSetup.targets).toEqual([0.7900, 0.7600, 0.7400]);
});
test("an uploaded chart is not a confirmed entry", () => {
  expect(usdchfEditorialSetup.confirmation).toBe("UNVERIFIED");
});
test("Bitcoin initial advance preserves the supplied 130000 objective", () => {
  expect(bitcoinEditorialSetup.firstObjective).toBe(130000);
});
test("Bitcoin final push preserves the supplied 150000 to 200000 range", () => {
  expect(bitcoinEditorialSetup.finalTargetRange).toEqual([150000, 200000]);
});
test("Bitcoin count is invalidated at the supplied 57750 level", () => {
  expect(bitcoinEditorialSetup.invalidationLevel).toBe(57750);
});
test("Bitcoin pullback has no invented price", () => {
  expect(bitcoinEditorialSetup.pullbackLevel).toBeNull();
});
test("Bitcoin wave thesis is not confirmed", () => {
  expect(bitcoinEditorialSetup.confirmation).toBe("UNVERIFIED");
});