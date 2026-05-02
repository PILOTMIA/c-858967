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
  EUR: { netPosition: 11594, long: 111857, short: 100263, weeklyChange: -8723, dealerLong: 48682, dealerShort: 396571, assetManagerLong: 439565, assetManagerShort: 148667, reportDate: "2026-04-28" },
  GBP: { netPosition: 28882, long: 58489, short: 29607, weeklyChange: -255, dealerLong: 131315, dealerShort: 63446, assetManagerLong: 39695, assetManagerShort: 133448, reportDate: "2026-04-28" },
  JPY: { netPosition: -75802, long: 81800, short: 157602, weeklyChange: -7305, dealerLong: 84091, dealerShort: 25315, assetManagerLong: 66512, assetManagerShort: 93062, reportDate: "2026-04-28" },
  CHF: { netPosition: -5174, long: 7107, short: 12281, weeklyChange: -1408, dealerLong: 62055, dealerShort: 12371, assetManagerLong: 6003, assetManagerShort: 43537, reportDate: "2026-04-28" },
  AUD: { netPosition: 47855, long: 73808, short: 25953, weeklyChange: -470, dealerLong: 41534, dealerShort: 166752, assetManagerLong: 102988, assetManagerShort: 57891, reportDate: "2026-04-28" },
  CAD: { netPosition: -53828, long: 25239, short: 79067, weeklyChange: 10387, dealerLong: 83444, dealerShort: 60192, assetManagerLong: 88349, assetManagerShort: 72317, reportDate: "2026-04-28" },
  NZD: { netPosition: -16833, long: 7160, short: 23993, weeklyChange: 1229, dealerLong: 61264, dealerShort: 3960, assetManagerLong: 7660, assetManagerShort: 49488, reportDate: "2026-04-28" },
  MXN: { netPosition: 49189, long: 76797, short: 27608, weeklyChange: 3969, dealerLong: 21503, dealerShort: 60570, assetManagerLong: 91215, assetManagerShort: 35502, reportDate: "2026-04-28" },
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
