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

// Verified fallback data — Leveraged Funds (TFF) positions, CFTC report 7/07/2026
// Source: CFTC TFF & Disaggregated PDFs (Futures Only), parsed July 7, 2026
const FALLBACK_DATA: Record<string, any> = {
  EUR: { netPosition: -16227, long: 223430, short: 239657, weeklyChange: -17326, reportDate: "2026-07-07", source: "verified_7_07" },
  GBP: { netPosition: -87903, long: 44564, short: 132467, weeklyChange: 14244, reportDate: "2026-07-07", source: "verified_7_07" },
  JPY: { netPosition: -123778, long: 112247, short: 236025, weeklyChange: 31314, reportDate: "2026-07-07", source: "verified_7_07" },
  CHF: { netPosition: -37414, long: 10561, short: 47975, weeklyChange: 1544, reportDate: "2026-07-07", source: "verified_7_07" },
  AUD: { netPosition: -24651, long: 71962, short: 96613, weeklyChange: -6951, reportDate: "2026-07-07", source: "verified_7_07" },
  CAD: { netPosition: -173126, long: 31566, short: 204692, weeklyChange: -22320, reportDate: "2026-07-07", source: "verified_7_07" },
  NZD: { netPosition: -65189, long: 10919, short: 76108, weeklyChange: -1909, reportDate: "2026-07-07", source: "verified_7_07" },
  MXN: { netPosition: 77357, long: 112628, short: 35271, weeklyChange: 6421, reportDate: "2026-07-07", source: "verified_7_07" },
  USD: { netPosition: 13269, long: 31921, short: 18652, weeklyChange: 253, reportDate: "2026-07-07", source: "verified_7_07" },
  XAU: { netPosition: 194246, long: 233713, short: 39467, weeklyChange: 227, reportDate: "2026-07-07", source: "verified_7_07" },
  BTC: { netPosition: 3500, long: 16073, short: 12573, weeklyChange: -270, reportDate: "2026-07-07", source: "verified_7_07" },
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
