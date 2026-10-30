import { expect, test } from "bun:test";
import { calculateCompounding, compoundExample, compoundCsv, lossStressPercent } from "../src/lib/compounding";

const plan = { startingBalance: 1000, ...compoundExample };
test("user example compounds 24% once per session for 60 sessions", () => {
  const rows = calculateCompounding(plan);
  expect(rows).toHaveLength(61);
  expect(rows[1].balance).toBe(1240);
  expect(rows[60].balance / 1000).toBeCloseTo(1.24 ** 60, 5);
});
test("user example uses three trades per session, not three compounding periods", () => {
  expect(compoundExample.tradesPerSession).toBe(3);
  expect(calculateCompounding({ ...plan, sessions: 1 })[1].balance).toBe(1240);
});
test("5% risk sizes from each session's opening balance", () => {
  const rows = calculateCompounding(plan);
  expect(rows[1].riskAmount).toBe(50);
  expect(rows[2].riskAmount).toBe(62);
});
test("8% risk changes dollars at risk but never manufactures a return", () => {
  const rows = calculateCompounding({ ...plan, riskPercent: 8 });
  expect(rows[1].riskAmount).toBe(80);
  expect(rows[60].balance).toBe(calculateCompounding(plan)[60].balance);
});
test("three sequential 5% and 8% stop-outs compound losses", () => {
  expect(lossStressPercent(5, 3)).toBeCloseTo(14.2625, 4);
  expect(lossStressPercent(8, 3)).toBeCloseTo(22.1312, 4);
});
test("negative returns compound and a 100% loss leaves zero", () => {
  expect(calculateCompounding({ ...plan, returnPercent: -10, sessions: 2 })[2].balance).toBe(810);
  expect(calculateCompounding({ ...plan, returnPercent: -100 })[60].balance).toBe(0);
});
test("invalid and impractically large projections are rejected", () => {
  expect(() => calculateCompounding({ ...plan, sessions: 1.5 })).toThrow();
  expect(() => calculateCompounding({ ...plan, startingBalance: NaN })).toThrow();
  expect(() => calculateCompounding({ ...plan, returnPercent: 1000, sessions: 1000 })).toThrow();
});
test("export includes all 60 sessions and risk assumptions", () => {
  const csv = compoundCsv(calculateCompounding(plan), plan);
  expect(csv).toContain("Risk per trade (%),5");
  expect(csv.split("\n").at(-1)?.split(",")[0]).toBe("60");
});