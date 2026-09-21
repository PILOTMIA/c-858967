import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CotHistoryRow {
  currency: string;
  report_date: string;
  long_positions: number;
  short_positions: number;
  net_position: number;
  change_long: number | null;
  change_short: number | null;
  pct_long: number | null;
  pct_short: number | null;
  source: string | null;
}

export const COT_HISTORY_QUERY_KEY = ["cot-history-shared"] as const;

export function useCOTHistory() {
  return useQuery({
    queryKey: COT_HISTORY_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cot_history")
        .select("currency, report_date, long_positions, short_positions, net_position, change_long, change_short, pct_long, pct_short, source")
        .order("report_date", { ascending: true })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as CotHistoryRow[];
    },
    staleTime: 15 * 60_000,
    refetchInterval: 30 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function latestHistoryRows(rows?: CotHistoryRow[]) {
  const latest = new Map<string, CotHistoryRow>();
  for (const row of rows ?? []) {
    const current = latest.get(row.currency);
    const verified = row.source?.includes("verified_upload") || row.source === "admin_upload";
    const currentVerified = current?.source?.includes("verified_upload") || current?.source === "admin_upload";
    if (!current || (verified && !currentVerified) || (verified === currentVerified && row.report_date > current.report_date)) {
      latest.set(row.currency, row);
    }
  }
  return latest;
}