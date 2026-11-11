import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { latestRate, basisPointChange, type RateObservation } from "@/lib/rateEvidence";

const series = [
  { id: "FEDFUNDS", label: "Effective Fed Funds", note: "Monthly effective rate, not the target range" },
  { id: "DGS2", label: "US 2Y Treasury", note: "Daily reference" },
  { id: "DGS10", label: "US 10Y Treasury", note: "Daily reference" },
  { id: "DGS30", label: "US 30Y Treasury", note: "Daily reference" },
];
const InterestRatesModule = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["interest-rates-module"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fred-proxy?series=FEDFUNDS,DGS2,DGS10,DGS30&limit=5");
      if (error) throw error;
      return data as { data: Record<string, { observations: RateObservation[] }> };
    },
    refetchInterval: 30 * 60_000,
  });
  const two = latestRate(data?.data?.DGS2?.observations);
  const ten = latestRate(data?.data?.DGS10?.observations);
  const spread = two && ten && two.date === ten.date ? basisPointChange(ten.value, two.value) : null;
  return <Card className="border-border bg-card">
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground"><Landmark className="h-5 w-5 text-primary" />Interest Rates & Treasury Yields</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      <p className="text-sm text-muted-foreground">FRED observations. Unavailable values are not replaced with estimates.</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {series.map(s => {
          const rate = latestRate(data?.data?.[s.id]?.observations);
          return <div key={s.id} className="rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{rate ? `${rate.value.toFixed(2)}%` : isLoading ? "Loading…" : "Unavailable"}</p>
            <p className="mt-2 text-xs text-muted-foreground">{rate ? `Observation: ${rate.date} · ${s.note}` : "Provider has not returned a valid observation"}</p>
          </div>;
        })}
      </div>
      <p className="text-sm text-foreground">{spread !== null ? `2s10s spread: ${spread.toFixed(1)} basis points · ${ten?.date}` : "Yield-curve assessment unavailable without matching dated 2Y and 10Y observations."}</p>
    </CardContent>
  </Card>;
};
export default InterestRatesModule;
