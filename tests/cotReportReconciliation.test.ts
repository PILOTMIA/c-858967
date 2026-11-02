import { expect, test } from "bun:test";
import report from "./fixtures/cot-2026-10-27.json";

test("October 27 uploaded positions and changes match all 28 stored markets", async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Public backend connection is required for report reconciliation");
  const response = await fetch(`${url}/rest/v1/cot_history?select=*&report_date=in.(2026-10-20,2026-10-27)`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  expect(response.ok).toBe(true);
  const rows = await response.json();
  expect(report.length).toBe(28);
  for (const expected of report) {
    const current = rows.find((r: typeof expected) => r.currency === expected.currency && r.report_date === "2026-10-27");
    const prior = rows.find((r: typeof expected) => r.currency === expected.currency && r.report_date === "2026-10-20");
    expect(current).toBeDefined();
    expect(prior).toBeDefined();
    expect(current.long_positions).toBe(expected.long_positions);
    expect(current.short_positions).toBe(expected.short_positions);
    expect(current.change_long).toBe(expected.change_long);
    expect(current.change_short).toBe(expected.change_short);
    expect(current.net_position).toBe(expected.long_positions - expected.short_positions);
    expect(current.long_positions - prior.long_positions).toBe(expected.change_long);
    expect(current.short_positions - prior.short_positions).toBe(expected.change_short);
    expect(current.source).toBe("verified_upload");
  }
}, 30000);