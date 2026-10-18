import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DowStat { day: string; short: string; avgPct: number; avgRangePct: number; upRate: number; samples: number }
export interface RhythmRow {
  pair: string; base: string; quote: string; klass: string; ok: boolean;
  lastClose: number; asOf: string; momentum20: number; momentum60: number; vol20: number;
  sessions: number; dayOfWeek: DowStat[]; biggestMoveDay: string; strongestDay: string;
  strongestDayDirection: "up" | "down"; strongestDayAvgPct: number;
  seasonal: { month: string; avgPct: number; upRate: number; years: number; history: { year: number; pct: number }[] };
}
export function useMarketRhythm() {
  return useQuery({
    queryKey: ["market-rhythm"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("market-rhythm");
      if (error) throw error;
      return (data?.data ?? []) as RhythmRow[];
    },
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
  });
}