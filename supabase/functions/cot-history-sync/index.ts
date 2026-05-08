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

async function fetchLegacyCOT(code: string): Promise<any | null> {
  try {
    const url = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=2&$order=report_date_as_yyyy_mm_dd DESC&cftc_contract_market_code=${code}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
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

  const results: Record<string, string> = {};
  let inserted = 0;
  let errors = 0;

  for (const [currency, code] of Object.entries(CFTC_CODES)) {
    try {
      const data = await fetchLegacyCOT(code);
      if (!data) {
        results[currency] = "no_data";
        continue;
      }

      for (const row of data) {
        const reportDate = row.report_date_as_yyyy_mm_dd;
        const long = parseInt(row.noncomm_positions_long_all || "0");
        const short = parseInt(row.noncomm_positions_short_all || "0");
        const net = long - short;

        const { error } = await supabase.from("cot_history").upsert({
          currency,
          report_date: reportDate,
          long_positions: long,
          short_positions: short,
          net_position: net,
          change_long: parseInt(row.change_in_noncomm_long_all || "0"),
          change_short: parseInt(row.change_in_noncomm_short_all || "0"),
          source: "cftc_auto",
        }, { onConflict: "currency,report_date" });

        if (error) {
          console.error(`Upsert error ${currency}:`, error.message);
          errors++;
        } else {
          inserted++;
        }
      }
      results[currency] = "ok";
    } catch (e) {
      results[currency] = `error: ${e.message}`;
      errors++;
    }
  }

  return new Response(
    JSON.stringify({ results, inserted, errors, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
