import { expect, test } from "bun:test";
import { usdchfEditorialSetup } from "../src/lib/editorialSetup";

test("USDCHF scenario preserves the author's Fibonacci rejection level", () => {
  expect(usdchfEditorialSetup.rejectionLevel).toBe(0.8400);
});
test("USDCHF scenario preserves the three staged targets", () => {
  expect(usdchfEditorialSetup.targets).toEqual([0.7900, 0.7600, 0.7400]);
});
test("an uploaded chart is not a confirmed entry", () => {
  expect(usdchfEditorialSetup.confirmation).toBe("UNVERIFIED");
});