import { expect, test } from "bun:test";
import { arizonaRefreshCheckpoint } from "../src/lib/feedSchedule";
test("refresh at 2 PM Arizona time", () => {
  expect(arizonaRefreshCheckpoint(new Date("2026-11-02T21:00:00Z"))).toBe("2026-11-02-14");
  expect(arizonaRefreshCheckpoint(new Date("2026-11-02T20:59:00Z"))).toBeNull();
});
test("refresh at 3 PM Arizona time", () => {
  expect(arizonaRefreshCheckpoint(new Date("2026-11-02T22:00:00Z"))).toBe("2026-11-02-15");
  expect(arizonaRefreshCheckpoint(new Date("2026-11-02T22:01:00Z"))).toBeNull();
});