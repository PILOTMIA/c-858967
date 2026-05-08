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

// Verified fallback data — Non-Commercial (Speculator) positions, CFTC report 4/27/2026
// Source: User-verified CFTC legacy COT report screenshots
const FALLBACK_DATA: Record<string, any> = {
  EUR: { netPosition: 35712, long: 217091, short: 181379, weeklyChange: -5612, reportDate: "2026-04-27", source: "verified_4_27" },
  GBP: { netPosition: -60639, long: 59577, short: 120216, weeklyChange: -8600, reportDate: "2026-04-27", source: "verified_4_27" },
  JPY: { netPosition: -102059, long: 106530, short: 208589, weeklyChange: -7599, reportDate: "2026-04-27", source: "verified_4_27" },
  CHF: { netPosition: -35221, long: 6359, short: 41580, weeklyChange: -1948, reportDate: "2026-04-27", source: "verified_4_27" },
  AUD: { netPosition: 71869, long: 136909, short: 65040, weeklyChange: 7052, reportDate: "2026-04-27", source: "verified_4_27" },
  CAD: { netPosition: -38476, long: 66517, short: 104993, weeklyChange: 20358, reportDate: "2026-04-27", source: "verified_4_27" },
  NZD: { netPosition: -46322, long: 9044, short: 55366, weeklyChange: 2132, reportDate: "2026-04-27", source: "verified_4_27" },
  MXN: { netPosition: 49189, long: 76797, short: 27608, weeklyChange: 3969, reportDate: "2026-04-27", source: "verified_4_27" },
  USD: { netPosition: 4508, long: 17180, short: 12672, weeklyChange: -475, reportDate: "2026-04-27", source: "verified_4_27" },
  XAU: { netPosition: 159571, long: 211818, short: 52247, weeklyChange: -4435, reportDate: "2026-04-27", source: "verified_4_27" },
  BTC: { netPosition: 2392, long: 17431, short: 15039, weeklyChange: 321, reportDate: "2026-04-27", source: "verified_4_27" },
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
