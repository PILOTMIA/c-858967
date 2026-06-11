import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// All instruments we expect to have weekly COT data for
const EXPECTED = ["EUR", "GBP", "JPY", "CHF", "AUD", "CAD", "NZD", "MXN", "USD", "XAU", "BTC"];

// CFTC publishes weekly; allow up to 10 days before flagging stale (cron runs Fri+Sat)
const STALE_DAYS = 10;
const CRITICAL_DAYS = 17;

export interface InstrumentHealth {
  currency: string;
  latest_report: string | null;
  age_days: number | null;
  status: "fresh" | "stale" | "critical" | "missing";
  rows_total: number;
  field_issues: string[];
}

export interface HealthReport {
  generated_at: string;
  overall: "healthy" | "warning" | "critical";
  fresh: number;
  stale: number;
  critical: number;
  missing: number;
  instruments: InstrumentHealth[];
  next_cron_runs_utc: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("cot_history")
      .select("currency, report_date, long_positions, short_positions, net_position");

    if (error) throw error;

    const now = Date.now();
    const byCurrency = new Map<string, any[]>();
    for (const row of data ?? []) {
      if (!byCurrency.has(row.currency)) byCurrency.set(row.currency, []);
      byCurrency.get(row.currency)!.push(row);
    }

    const instruments: InstrumentHealth[] = EXPECTED.map((currency) => {
      const rows = byCurrency.get(currency) ?? [];
      if (rows.length === 0) {
        return { currency, latest_report: null, age_days: null, status: "missing", rows_total: 0, field_issues: [] };
      }
      rows.sort((a, b) => (a.report_date < b.report_date ? 1 : -1));
      const latest = rows[0];
      const ageMs = now - new Date(latest.report_date + "T00:00:00Z").getTime();
      const ageDays = Math.floor(ageMs / 86_400_000);

      // Per-field integrity audit across ALL rows
      const issues: string[] = [];
      for (const r of rows) {
        if (r.long_positions == null || r.short_positions == null || r.net_position == null) {
          issues.push(`${r.report_date}: null field`);
          continue;
        }
        if (r.long_positions < 0 || r.short_positions < 0) {
          issues.push(`${r.report_date}: negative position`);
        }
        if (Number(r.net_position) !== Number(r.long_positions) - Number(r.short_positions)) {
          issues.push(`${r.report_date}: net != long - short`);
        }
      }

      let status: InstrumentHealth["status"] = "fresh";
      if (ageDays > CRITICAL_DAYS) status = "critical";
      else if (ageDays > STALE_DAYS) status = "stale";

      return {
        currency,
        latest_report: latest.report_date,
        age_days: ageDays,
        status,
        rows_total: rows.length,
        field_issues: issues.slice(0, 5), // cap
      };
    });

    const counts = { fresh: 0, stale: 0, critical: 0, missing: 0 };
    for (const i of instruments) counts[i.status]++;

    const overall: HealthReport["overall"] =
      counts.critical > 0 || counts.missing > 0 ? "critical" : counts.stale > 0 ? "warning" : "healthy";

    const body: HealthReport = {
      generated_at: new Date().toISOString(),
      overall,
      ...counts,
      instruments,
      next_cron_runs_utc: ["Fri 21:00 UTC", "Sat 16:00 UTC"],
    };

    return new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
