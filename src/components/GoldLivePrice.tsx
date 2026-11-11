import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { usableQuote, quoteStatus, quoteChange, type QuoteEvidence } from "@/lib/quoteQuality";
import { latestRate, basisPointChange, type RateObservation } from "@/lib/rateEvidence";
import { supabase } from "@/integrations/supabase/client";

const GoldLivePrice = () => {
  const { data: quotes } = useQuery({
    queryKey: ["gold-live"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("forex-prices?pairs=XAUUSD,US10Y");
      if (error) throw error;
      return data as { rates: Record<string, QuoteEvidence> };
    }, refetchInterval: 60_000,
  });
  const { data: rates } = useQuery({
    queryKey: ["yield-live"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fred-proxy?series=FEDFUNDS&limit=2");
      if (error) throw error;
      return data as { data: Record<string, { observations: RateObservation[] }> };
    }, refetchInterval: 30 * 60_000,
  });
  const gold = quotes?.rates?.XAUUSD;
  const yieldQuote = quotes?.rates?.US10Y;
  const fed = latestRate(rates?.data?.FEDFUNDS?.observations);
  const change = gold && usableQuote(gold) ? quoteChange(gold) : undefined;
  const items = [
    { title: "XAUUSD Spot", value: usableQuote(gold) ? `$${gold.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable", source: gold && usableQuote(gold) ? `${gold.source} · ${quoteStatus(gold)}` : "No verified quote", date: gold?.asOf, detail: change !== undefined ? `${change.toFixed(2)}% vs provider previous close` : "Price change unavailable without a same-provider previous close" },
    { title: "US 10Y Yield", value: usableQuote(yieldQuote) ? `${yieldQuote.rate.toFixed(3)}%` : "Unavailable", source: yieldQuote && usableQuote(yieldQuote) ? `${yieldQuote.source} · ${quoteStatus(yieldQuote)}` : "No verified quote", date: yieldQuote?.asOf, detail: yieldQuote && usableQuote(yieldQuote) && yieldQuote.previousClose !== undefined ? `${basisPointChange(yieldQuote.rate, yieldQuote.previousClose).toFixed(1)} basis points vs provider previous close` : "Yield change unavailable" },
    { title: "Effective Fed Funds", value: fed ? `${fed.value.toFixed(2)}%` : "Unavailable", source: fed ? "FRED · Monthly effective rate" : "FRED observation unavailable", date: fed?.date, detail: "Monthly effective rate, not the Federal Reserve target range" },
  ];
  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{items.map(item => <div key={item.title} className="rounded-lg border border-border bg-card p-5">
    <p className="mb-3 text-sm font-semibold text-foreground">{item.title}</p>
    <p className="break-words text-3xl font-bold text-foreground">{item.value}</p>
    <Badge variant="outline" className="mt-3 whitespace-normal text-xs text-foreground">{item.source}</Badge>
    {item.date && <p className="mt-2 text-xs text-muted-foreground">Observation: {item.date}</p>}
    <p className="mt-3 text-sm text-muted-foreground">{item.detail}</p>
  </div>)}</div>;
};
export default GoldLivePrice;
