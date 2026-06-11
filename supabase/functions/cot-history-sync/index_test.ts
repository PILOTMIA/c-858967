import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateRow } from "./index.ts";

Deno.test("validateRow accepts a well-formed CFTC row", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "2026-06-02",
    noncomm_positions_long_all: "217091",
    noncomm_positions_short_all: "181379",
    change_in_noncomm_long_all: "-1000",
    change_in_noncomm_short_all: "500",
  });
  if (!r.ok) throw new Error("expected ok");
  assertEquals(r.value.currency, "EUR");
  assertEquals(r.value.long_positions, 217091);
  assertEquals(r.value.short_positions, 181379);
  assertEquals(r.value.net_position, 217091 - 181379);
  assertEquals(r.value.change_long, -1000);
  assertEquals(r.value.change_short, 500);
});

Deno.test("validateRow rejects negative positions", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "2026-06-02",
    noncomm_positions_long_all: "-5",
    noncomm_positions_short_all: "100",
  });
  assertEquals(r.ok, false);
});

Deno.test("validateRow rejects non-numeric positions", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "2026-06-02",
    noncomm_positions_long_all: "abc",
    noncomm_positions_short_all: "100",
  });
  assertEquals(r.ok, false);
});

Deno.test("validateRow rejects malformed dates", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "06/02/2026",
    noncomm_positions_long_all: "10",
    noncomm_positions_short_all: "5",
  });
  assertEquals(r.ok, false);
});

Deno.test("validateRow rejects future dates", () => {
  const future = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: future,
    noncomm_positions_long_all: "10",
    noncomm_positions_short_all: "5",
  });
  assertEquals(r.ok, false);
});

Deno.test("validateRow rejects sanity-cap breaches", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "2026-06-02",
    noncomm_positions_long_all: "999999999",
    noncomm_positions_short_all: "5",
  });
  assertEquals(r.ok, false);
});

Deno.test("validateRow enforces net = long - short invariant", () => {
  const r = validateRow("EUR", {
    report_date_as_yyyy_mm_dd: "2026-06-02",
    noncomm_positions_long_all: "200",
    noncomm_positions_short_all: "75",
  });
  if (!r.ok) throw new Error("expected ok");
  assertEquals(r.value.net_position, 125);
});
