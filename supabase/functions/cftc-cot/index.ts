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

// Verified fallback data — Leveraged Funds (TFF) positions, CFTC report 6/16/2026
// Source: CFTC TFF & Disaggregated PDFs (Futures Only), parsed June 16, 2026
const FALLBACK_DATA: Record<string, any> = {
  EUR: { netPosition: -8926, long: 94228, short: 103154, weeklyChange: 8462, reportDate: "2026-06-16", source: "verified_6_16" },
  GBP: { netPosition: 16836, long: 54078, short: 37242, weeklyChange: -5476, reportDate: "2026-06-16", source: "verified_6_16" },
  JPY: { netPosition: -96772, long: 93889, short: 190661, weeklyChange: 3072, reportDate: "2026-06-16", source: "verified_6_16" },
  CHF: { netPosition: -12366, long: 7480, short: 19846, weeklyChange: -1581, reportDate: "2026-06-16", source: "verified_6_16" },
  AUD: { netPosition: 41538, long: 68177, short: 26639, weeklyChange: -754, reportDate: "2026-06-16", source: "verified_6_16" },
  CAD: { netPosition: -65053, long: 31107, short: 96160, weeklyChange: -6430, reportDate: "2026-06-16", source: "verified_6_16" },
  NZD: { netPosition: -22187, long: 6535, short: 28722, weeklyChange: 67, reportDate: "2026-06-16", source: "verified_6_16" },
  MXN: { netPosition: 49274, long: 86501, short: 37227, weeklyChange: -1704, reportDate: "2026-06-16", source: "verified_6_16" },
  USD: { netPosition: -1870, long: 16240, short: 18110, weeklyChange: 11786, reportDate: "2026-06-16", source: "verified_6_16" },
  XAU: { netPosition: 113721, long: 128043, short: 14322, weeklyChange: 7858, reportDate: "2026-06-16", source: "verified_6_16" },
  BTC: { netPosition: -6607, long: 6077, short: 12684, weeklyChange: -612, reportDate: "2026-06-16", source: "verified_6_16" },
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
