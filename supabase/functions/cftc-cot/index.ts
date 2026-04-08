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
};

// Hardcoded fallback data (CFTC Mar 29 2026)
const FALLBACK_DATA: Record<string, any> = {
  EUR: { netPosition: 3947, long: 106291, short: 102344, weeklyChange: 17485, dealerLong: 48543, dealerShort: 357954, assetManagerLong: 431246, assetManagerShort: 166829, reportDate: "2026-03-31" },
  GBP: { netPosition: 29932, long: 58402, short: 28470, weeklyChange: 14216, dealerLong: 132294, dealerShort: 51454, assetManagerLong: 23458, assetManagerShort: 124990, reportDate: "2026-03-31" },
  JPY: { netPosition: -46182, long: 77232, short: 123414, weeklyChange: 8670, dealerLong: 65995, dealerShort: 52624, assetManagerLong: 63211, assetManagerShort: 66856, reportDate: "2026-03-31" },
  CHF: { netPosition: 1490, long: 10695, short: 9205, weeklyChange: 1255, dealerLong: 48430, dealerShort: 4780, assetManagerLong: 5758, assetManagerShort: 45566, reportDate: "2026-03-31" },
  AUD: { netPosition: 52569, long: 76188, short: 23619, weeklyChange: 3424, dealerLong: 30591, dealerShort: 158593, assetManagerLong: 103136, assetManagerShort: 58503, reportDate: "2026-03-31" },
  CAD: { netPosition: -42910, long: 28325, short: 71235, weeklyChange: -11210, dealerLong: 64103, dealerShort: 36157, assetManagerLong: 64749, assetManagerShort: 60401, reportDate: "2026-03-31" },
  NZD: { netPosition: -17798, long: 5752, short: 23550, weeklyChange: -1068, dealerLong: 50305, dealerShort: 6700, assetManagerLong: 6601, assetManagerShort: 34236, reportDate: "2026-03-31" },
  MXN: { netPosition: 52803, long: 76213, short: 23410, weeklyChange: -1984, dealerLong: 24594, dealerShort: 41544, assetManagerLong: 73258, assetManagerShort: 39368, reportDate: "2026-03-31" },
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
