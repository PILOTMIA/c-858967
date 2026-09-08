import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Admin COT upload.
 *
 * The uploaded CFTC report tells us WHICH report week is now current. We then pull
 * that exact week (plus the prior week for the change columns) straight from the CFTC
 * public reporting API for every market the site tracks, and store it in cot_history.
 * Every page on the site reads from that table (directly or through cftc-cot), so one
 * upload refreshes the whole site with official numbers — no hand-typed values.
 */

// currency key -> CFTC contract market code
const CODES: Record<string, string> = {
  EUR: "099741",
  GBP: "096742",
  JPY: "097741",
  CHF: "092741",
  AUD: "232741",
  CAD: "090741",
  NZD: "112741",
  MXN: "095741",
  BRL: "102741",
  USD: "098662",
  XAU: "088691",
  XAG: "084691",
  HG: "085692",
  XPT: "076651",
  BTC: "133741",
  WTI: "067651",
  NG: "023651",
  CORN: "002602",
  WHEAT: "001602",
  SOYBEAN: "005602",
  SUGAR: "080732",
  COFFEE: "083731",
  COTTON: "033661",
  COCOA: "073732",
  CATTLE: "057642",
  HOGS: "054642",
  SP500: "13874P",
  NASDAQ: "209742",
  DOW: "12460P",
  VIX: "1170E1",
};

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** Pull a report date out of the uploaded document text. */
function detectReportDate(text: string): string | null {
  if (!text) return null;
  const re = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(20\d{2})/gi;
  const found: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const month = MONTHS[m[1].toLowerCase()];
    const day = Number(m[2]);
    const year = Number(m[3]);
    if (!month || !day) continue;
    found.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  if (!found.length) return null;
  // the report header date is the most recent date mentioned in the document
  found.sort();
  return found[found.length - 1];
}

const num = (v: unknown) => {
  const n = parseInt(String(v ?? "0").replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

async function fetchRows(code: string, onOrBefore: string) {
  const url =
    `https://publicreporting.cftc.gov/resource/72hh-3qpy.json` +
    `?$limit=2&$order=report_date_as_yyyy_mm_dd DESC` +
    `&cftc_contract_market_code=${code}` +
    `&$where=report_date_as_yyyy_mm_dd <= '${onOrBefore}T00:00:00.000'`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return null;
    return rows;
  } catch (_e) {
    return null;
  }
}

function speculatorLegs(row: Record<string, unknown>) {
  const long = num(row.lev_money_positions_long_all ?? row.m_money_positions_long_all ?? row.noncomm_positions_long_all);
  const short = num(row.lev_money_positions_short_all ?? row.m_money_positions_short_all ?? row.noncomm_positions_short_all);
  return { long, short };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const expected = Deno.env.get("COT_ADMIN_PASSWORD") ?? "MIAFOREX!00!";
    if (body?.password !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);
    const reportDate: string =
      (typeof body.reportDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.reportDate) && body.reportDate) ||
      detectReportDate(String(body.text ?? "")) ||
      today;

    const rowsToWrite: Record<string, unknown>[] = [];
    const markets: string[] = [];
    const missing: string[] = [];

    // 1) Explicit records (CSV / JSON upload) win — they are what the admin typed.
    if (Array.isArray(body.records) && body.records.length) {
      for (const r of body.records) {
        const currency = String(r.currency ?? r.Currency ?? "").toUpperCase().trim();
        if (!currency) continue;
        const long = num(r.nonCommercialLong ?? r.long ?? r.NonCommercial_Long);
        const short = num(r.nonCommercialShort ?? r.short ?? r.NonCommercial_Short);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(String(r.reportDate ?? "")) ? String(r.reportDate) : reportDate;
        const total = long + short;
        rowsToWrite.push({
          currency,
          report_date: date,
          long_positions: long,
          short_positions: short,
          net_position: long - short,
          change_long: num(r.changeLong),
          change_short: num(r.changeShort),
          pct_long: total ? Number(((long / total) * 100).toFixed(2)) : 0,
          pct_short: total ? Number(((short / total) * 100).toFixed(2)) : 0,
          source: "admin_upload",
        });
        markets.push(currency);
      }
    }

    // 2) Always refresh every tracked market from the official CFTC feed for that week.
    const entries = Object.entries(CODES);
    await Promise.all(entries.map(async ([currency, code]) => {
      if (markets.includes(currency)) return;
      const rows = await fetchRows(code, reportDate);
      if (!rows) { missing.push(currency); return; }
      const latest = rows[0];
      const prev = rows[1];
      const { long, short } = speculatorLegs(latest);
      if (!long && !short) { missing.push(currency); return; }
      const p = prev ? speculatorLegs(prev) : { long: 0, short: 0 };
      const total = long + short;
      rowsToWrite.push({
        currency,
        report_date: String(latest.report_date_as_yyyy_mm_dd ?? reportDate).slice(0, 10),
        long_positions: long,
        short_positions: short,
        net_position: long - short,
        change_long: prev ? long - p.long : 0,
        change_short: prev ? short - p.short : 0,
        pct_long: total ? Number(((long / total) * 100).toFixed(2)) : 0,
        pct_short: total ? Number(((short / total) * 100).toFixed(2)) : 0,
        source: "cftc_official",
      });
      markets.push(currency);
    }));

    if (!rowsToWrite.length) {
      return new Response(
        JSON.stringify({ error: "No COT rows could be resolved for this report", reportDate }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error } = await supabase
      .from("cot_history")
      .upsert(rowsToWrite, { onConflict: "currency,report_date" });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        reportDate,
        written: rowsToWrite.length,
        markets: markets.sort(),
        unavailable: missing.sort(),
        updatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("cot-upload error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Upload failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
