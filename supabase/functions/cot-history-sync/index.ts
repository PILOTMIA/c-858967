import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CFTC codes for Non-Commercial (legacy) COT report
const CFTC_CODES: Record<string, string> = {
  EUR: "099741",
  GBP: "096742",
  JPY: "097741",
  CHF: "092741",
  AUD: "232741",
  CAD: "090741",
  NZD: "112741",
  MXN: "095741",
  USD: "098662",
  XAU: "088691",
  BTC: "133741",
};

// Per-field validation — exported for tests
export interface RawCotRow {
  report_date_as_yyyy_mm_dd?: string;
  noncomm_positions_long_all?: string | number;
  noncomm_positions_short_all?: string | number;
  change_in_noncomm_long_all?: string | number;
  change_in_noncomm_short_all?: string | number;
}

export interface ValidatedRow {
  currency: string;
  report_date: string;
  long_positions: number;
  short_positions: number;
  net_position: number;
  change_long: number;
  change_short: number;
  source: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateRow(currency: string, row: RawCotRow): { ok: true; value: ValidatedRow } | { ok: false; error: string } {
  if (!row || typeof row !== "object") return { ok: false, error: "row missing" };

  const reportDate = String(row.report_date_as_yyyy_mm_dd ?? "");
  if (!DATE_RE.test(reportDate)) return { ok: false, error: `invalid report_date: ${reportDate}` };
  const d = new Date(reportDate + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return { ok: false, error: `unparseable date: ${reportDate}` };
  // Reject future dates beyond 1 day skew
  if (d.getTime() > Date.now() + 24 * 3600_000) return { ok: false, error: `future date: ${reportDate}` };
  // Reject ancient data older than 5 years (safety)
  if (d.getTime() < Date.now() - 5 * 365 * 24 * 3600_000) return { ok: false, error: `too old: ${reportDate}` };

  const long = Number(row.noncomm_positions_long_all);
  const short = Number(row.noncomm_positions_short_all);
  if (!Number.isFinite(long) || !Number.isFinite(short)) return { ok: false, error: "non-numeric long/short" };
  if (long < 0 || short < 0) return { ok: false, error: "negative position" };
  // Sanity cap — no real CFTC contract has >10M speculator positions
  if (long > 10_000_000 || short > 10_000_000) return { ok: false, error: "position exceeds sanity cap" };

  const cLong = Number(row.change_in_noncomm_long_all ?? 0);
  const cShort = Number(row.change_in_noncomm_short_all ?? 0);
  const changeLong = Number.isFinite(cLong) ? cLong : 0;
  const changeShort = Number.isFinite(cShort) ? cShort : 0;

  const net = long - short;
  // Integrity invariant
  if (net !== long - short) return { ok: false, error: "net invariant violated" };

  return {
    ok: true,
    value: {
      currency,
      report_date: reportDate,
      long_positions: Math.trunc(long),
      short_positions: Math.trunc(short),
      net_position: Math.trunc(net),
      change_long: Math.trunc(changeLong),
      change_short: Math.trunc(changeShort),
      source: "cftc_auto",
    },
  };
}

async function fetchLegacyCOT(code: string): Promise<RawCotRow[] | null> {
  try {
    const url = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=2&$order=report_date_as_yyyy_mm_dd DESC&cftc_contract_market_code=${code}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const results: Record<string, { status: string; valid: number; rejected: number; errors: string[] }> = {};
  let totalInserted = 0;
  let totalRejected = 0;

  for (const [currency, code] of Object.entries(CFTC_CODES)) {
    const entry = { status: "ok", valid: 0, rejected: 0, errors: [] as string[] };
    try {
      const data = await fetchLegacyCOT(code);
      if (!data) {
        entry.status = "no_data";
        results[currency] = entry;
        continue;
      }

      for (const row of data) {
        const v = validateRow(currency, row);
        if (!v.ok) {
          entry.rejected++;
          totalRejected++;
          entry.errors.push(v.error);
          continue;
        }
        const { error } = await supabase
          .from("cot_history")
          .upsert(v.value, { onConflict: "currency,report_date" });

        if (error) {
          entry.rejected++;
          totalRejected++;
          entry.errors.push(`db: ${error.message}`);
        } else {
          entry.valid++;
          totalInserted++;
        }
      }
    } catch (e) {
      entry.status = "error";
      entry.errors.push(String(e?.message ?? e));
    }
    results[currency] = entry;
  }

  return new Response(
    JSON.stringify({
      results,
      inserted: totalInserted,
      rejected: totalRejected,
      timestamp: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
