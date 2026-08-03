import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CFTC commodity codes for forex futures
const CFTC_CODES: Record<string, { name: string; code: string }> = {
  EUR: { name: "EURO FX", code: "099741" },
  GBP: { name: "BRITISH POUND", code: "096742" },
  JPY: { name: "JAPANESE YEN", code: "097741" },
  CHF: { name: "SWISS FRANC", code: "092741" },
  AUD: { name: "AUSTRALIAN DOLLAR", code: "232741" },
  CAD: { name: "CANADIAN DOLLAR", code: "090741" },
  NZD: { name: "NEW ZEALAND DOLLAR", code: "112741" },
  MXN: { name: "MEXICAN PESO", code: "095741" },
  USD: { name: "USD INDEX", code: "098662" },
  XAU: { name: "GOLD", code: "088691" },
  BTC: { name: "BITCOIN", code: "133741" },
};

// Verified fallback data — CFTC report 7/28/2026 (synced from cot_history)
const FALLBACK_DATA: Record<string, any> = {
  EUR: { netPosition: -72447, long: 204975, short: 277422, weeklyChange: -31109, reportDate: "2026-07-28", source: "verified_7_28" },
  GBP: { netPosition: -64814, long: 61458, short: 126272, weeklyChange: -9253, reportDate: "2026-07-28", source: "verified_7_28" },
  JPY: { netPosition: -163412, long: 101271, short: 264683, weeklyChange: -11287, reportDate: "2026-07-28", source: "verified_7_28" },
  CHF: { netPosition: -33462, long: 10117, short: 43579, weeklyChange: 780, reportDate: "2026-07-28", source: "verified_7_28" },
  AUD: { netPosition: -39964, long: 67819, short: 107783, weeklyChange: -2279, reportDate: "2026-07-28", source: "verified_7_28" },
  CAD: { netPosition: -176310, long: 22500, short: 198810, weeklyChange: -1862, reportDate: "2026-07-28", source: "verified_7_28" },
  NZD: { netPosition: -47668, long: 6841, short: 54509, weeklyChange: 2301, reportDate: "2026-07-28", source: "verified_7_28" },
  MXN: { netPosition: 72528, long: 106487, short: 33959, weeklyChange: 829, reportDate: "2026-07-28", source: "verified_7_28" },
  USD: { netPosition: 17197, long: 35339, short: 18142, weeklyChange: 1583, reportDate: "2026-07-28", source: "verified_7_28" },
  XAU: { netPosition: 182070, long: 219622, short: 37552, weeklyChange: -1840, reportDate: "2026-07-28", source: "verified_7_28" },
  BTC: { netPosition: 3904, long: 15572, short: 11668, weeklyChange: 850, reportDate: "2026-07-28", source: "verified_7_28" },
};


async function fetchFromCFTC(currency: string): Promise<any | null> {
  const info = CFTC_CODES[currency];
  if (!info) return null;

  try {
    // CFTC Disaggregated Futures-Only report (Socrata API)
    const url = `https://publicreporting.cftc.gov/resource/72hh-3qpy.json?$limit=2&$order=report_date_as_yyyy_mm_dd DESC&cftc_contract_market_code=${info.code}`;
    
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`CFTC API returned ${res.status} for ${currency}`);
      return null;
    }

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const latest = data[0];
    const previous = data.length > 1 ? data[1] : null;

    const long = parseInt(latest.lev_money_positions_long_all || latest.m_money_positions_long_all || "0");
    const short = parseInt(latest.lev_money_positions_short_all || latest.m_money_positions_short_all || "0");
    const netPosition = long - short;

    const dealerLong = parseInt(latest.dealer_positions_long_all || "0");
    const dealerShort = parseInt(latest.dealer_positions_short_all || "0");
    const assetManagerLong = parseInt(latest.asset_mgr_positions_long || "0");
    const assetManagerShort = parseInt(latest.asset_mgr_positions_short || "0");

    let weeklyChange = 0;
    if (previous) {
      const prevLong = parseInt(previous.lev_money_positions_long_all || previous.m_money_positions_long_all || "0");
      const prevShort = parseInt(previous.lev_money_positions_short_all || previous.m_money_positions_short_all || "0");
      weeklyChange = netPosition - (prevLong - prevShort);
    }

    return {
      netPosition,
      long,
      short,
      weeklyChange,
      dealerLong,
      dealerShort,
      assetManagerLong,
      assetManagerShort,
      reportDate: latest.report_date_as_yyyy_mm_dd || "",
      source: "cftc_live",
    };
  } catch (e) {
    console.error(`Error fetching CFTC data for ${currency}:`, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const currencies = (url.searchParams.get("currencies") || "EUR,GBP,JPY,CHF,AUD,CAD,NZD,MXN").split(",").map(c => c.trim().toUpperCase());

    const results: Record<string, any> = {};
    
    await Promise.all(
      currencies.map(async (currency) => {
        const live = await fetchFromCFTC(currency);
        if (live) {
          results[currency] = live;
        } else {
          results[currency] = { ...FALLBACK_DATA[currency], source: "fallback" };
        }
      })
    );

    return new Response(JSON.stringify({ data: results, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CFTC COT function error:", error);
    return new Response(JSON.stringify({ error: error.message, data: FALLBACK_DATA }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
