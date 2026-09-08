import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for COT positioning across the site.
 * Reads the newest stored report per market from cot_history — which is exactly what the
 * admin COT upload writes — so one upload refreshes every panel that uses this hook.
 */
export interface CotPosition {
  net: number;
  weekly: number;
  long: number;
  short: number;
  reportDate: string;
  source: string;
}

export const COT_QUERY_KEY = ["latest-cot"] as const;

async function fetchLatestCOT(): Promise<Record<string, CotPosition>> {
  const { data, error } = await supabase
    .from("cot_history")
    .select("currency, report_date, long_positions, short_positions, net_position, change_long, change_short, source")
    .order("report_date", { ascending: false })
    .limit(2000);

  if (error) throw error;

  const out: Record<string, CotPosition> = {};
  for (const row of data ?? []) {
    if (out[row.currency]) continue; // newest row per market wins
    out[row.currency] = {
      net: Number(row.net_position ?? 0),
      weekly: Number(row.change_long ?? 0) - Number(row.change_short ?? 0),
      long: Number(row.long_positions ?? 0),
      short: Number(row.short_positions ?? 0),
      reportDate: String(row.report_date).slice(0, 10),
      source: row.source ?? "stored",
    };
  }
  return out;
}

export function useLatestCOT() {
  return useQuery({
    queryKey: COT_QUERY_KEY,
    queryFn: fetchLatestCOT,
    staleTime: 10 * 60_000,
    refetchInterval: 30 * 60_000,
  });
}

/** Most recent report date across all stored markets. */
export function latestReportDate(map?: Record<string, CotPosition>) {
  if (!map) return null;
  const dates = Object.values(map).map((p) => p.reportDate).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}
