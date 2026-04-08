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
  EUR: { netPosition: -13538, long: 97985, short: 111523, weeklyChange: -6586, dealerLong: 39995, dealerShort: 357133, assetManagerLong: 446373, assetManagerShort: 158433, reportDate: "2026-03-24" },
  GBP: { netPosition: 15716, long: 47450, short: 31734, weeklyChange: 3948, dealerLong: 128153, dealerShort: 46144, assetManagerLong: 28499, assetManagerShort: 122962, reportDate: "2026-03-24" },
  JPY: { netPosition: -54852, long: 67921, short: 122773, weeklyChange: 10577, dealerLong: 60117, dealerShort: 42836, assetManagerLong: 58266, assetManagerShort: 64516, reportDate: "2026-03-24" },
  CHF: { netPosition: 235, long: 7950, short: 7715, weeklyChange: -278, dealerLong: 47188, dealerShort: 6284, assetManagerLong: 5541, assetManagerShort: 42537, reportDate: "2026-03-24" },
  AUD: { netPosition: 49145, long: 68577, short: 19432, weeklyChange: 3786, dealerLong: 32930, dealerShort: 152299, assetManagerLong: 103155, assetManagerShort: 59229, reportDate: "2026-03-24" },
  CAD: { netPosition: -31700, long: 26751, short: 58451, weeklyChange: 6152, dealerLong: 30119, dealerShort: 37684, assetManagerLong: 67647, assetManagerShort: 41518, reportDate: "2026-03-24" },
  NZD: { netPosition: -16730, long: 7461, short: 24191, weeklyChange: -813, dealerLong: 43769, dealerShort: 4053, assetManagerLong: 6572, assetManagerShort: 31584, reportDate: "2026-03-24" },
  MXN: { netPosition: 54787, long: 75059, short: 20272, weeklyChange: 7841, dealerLong: 8722, dealerShort: 44498, assetManagerLong: 72526, assetManagerShort: 23942, reportDate: "2026-03-24" },
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
