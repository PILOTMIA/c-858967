import { expect, test } from "bun:test";
import { bitcoinEditorialSetup, bitcoinPullbackSetup, usdchfEditorialSetup, describeUsdchfQuote } from "../src/lib/editorialSetup";

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
test("nearer-term pullback preserves the 68000 to 71000 zone", () => {
  expect(bitcoinPullbackSetup.retracementZone).toEqual([68000, 71000]);
});
test("pullback preserves 50 to 61.8 percent Fibonacci range", () => {
  expect(bitcoinPullbackSetup.fibonacciRange).toEqual([50, 61.8]);
});
test("pullback wave C objective is 130000", () => {
  expect(bitcoinPullbackSetup.objective).toBe(130000);
});
test("pullback broader count invalidation is 57750", () => {
  expect(bitcoinPullbackSetup.invalidationLevel).toBe(57750);
});
test("pullback requires rejection before descending trendline break", () => {
  expect(bitcoinPullbackSetup.requiredConfirmations).toEqual(["BULLISH_REJECTION", "DESCENDING_TRENDLINE_BREAK"]);
});
test("pullback confirmations are not verified by the uploaded reference", () => {
  expect(bitcoinPullbackSetup.confirmation).toBe("UNVERIFIED");
});
test("USDCHF Oct 21 update keeps break near 0.8300 and channel support near 0.8040", () => {
  expect(usdchfEditorialSetup.trendlineBreakLevel).toBe(0.8300);
  expect(usdchfEditorialSetup.channelSupport).toBe(0.8040);
});

test("USDCHF quote status: above 0.8400 invalidates, 0.8239 is 199 pips above support", () => {
  expect(describeUsdchfQuote(0.8410)).toContain("invalidated");
  expect(describeUsdchfQuote(0.8239)).toContain("199 pips");
  expect(describeUsdchfQuote(0.8030)).toContain("first objective reached");
});
