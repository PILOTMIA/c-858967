import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateRow } from "./index.ts";

const current = { report_date_as_yyyy_mm_dd: "2026-09-22T00:00:00.000", lev_money_positions_long: "114151", lev_money_positions_short: "140845" };
const previous = { report_date_as_yyyy_mm_dd: "2026-09-15T00:00:00.000", lev_money_positions_long: "103260", lev_money_positions_short: "131416" };

Deno.test("TFF leveraged-fund fields and changes agree with prior report", () => {
  const result = validateRow("EUR", current, previous);
  if (!result.ok) throw new Error(result.error);
  assertEquals(result.value.net_position, -26694);
  assertEquals(result.value.change_long, 10891);
  assertEquals(result.value.change_short, 9429);
  assertEquals(result.value.source, "cftc_tff_leveraged");
});

Deno.test("disaggregated managed-money positions do not use legacy fields", () => {
  const result = validateRow("XAU", {
    report_date_as_yyyy_mm_dd: "2026-09-22", m_money_positions_long_all: "135699", m_money_positions_short_all: "8310",
    noncomm_positions_long_all: "253982", noncomm_positions_short_all: "28129",
  }, { report_date_as_yyyy_mm_dd: "2026-09-15", m_money_positions_long_all: "142394", m_money_positions_short_all: "9278" });
  if (!result.ok) throw new Error(result.error);
  assertEquals(result.value.net_position, 127389);
  assertEquals(result.value.change_long, -6695);
});

Deno.test("missing prior report never creates fictitious zero weekly change", () => {
  assertEquals(validateRow("EUR", current).ok, false);
});

Deno.test("rejects invalid dates, negative values, and position caps", () => {
  assertEquals(validateRow("EUR", { ...current, report_date_as_yyyy_mm_dd: "bad" }, previous).ok, false);
  assertEquals(validateRow("EUR", { ...current, lev_money_positions_long: "-5" }, previous).ok, false);
  assertEquals(validateRow("EUR", { ...current, lev_money_positions_long: "abc" }, previous).ok, false);
  assertEquals(validateRow("EUR", { ...current, lev_money_positions_long: "999999999" }, previous).ok, false);
});