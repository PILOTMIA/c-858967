import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fetchGoldPrice = async () => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!projectId || !anonKey) return null;

  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/forex-prices?pairs=XAUUSD`, {
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

const fetchYield = async () => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!projectId || !anonKey) return null;

  const res = await fetch(`https://${projectId}.supabase.co/functions/v1/macro-data?currencies=USD&us10y=true`, {
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
};

const formatTime = (ts: number) => {
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return ""; }
};

const GoldLivePrice = () => {
  const { data: goldData, dataUpdatedAt: goldUpdated } = useQuery({
    queryKey: ["gold-live"],
    queryFn: fetchGoldPrice,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 15,
  });
  const { data: yieldData, dataUpdatedAt: yieldUpdated } = useQuery({
    queryKey: ["yield-live"],
    queryFn: fetchYield,
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30,
  });

  const goldPrice = goldData?.rates?.XAUUSD?.rate ?? 2350;
  const goldSource = goldData?.rates?.XAUUSD?.source ?? "fallback";
  const us10y = yieldData?.us10y?.yield ?? 4.32;
  const us10yPrev = yieldData?.us10y?.previousYield ?? 4.40;
  const yieldChange = us10y - us10yPrev;
  const fedRate = yieldData?.data?.USD?.interestRate ?? 4.50;

  const goldDirection = goldPrice >= 2400 ? "up" : goldPrice <= 2200 ? "down" : "flat";
  const lastUpdate = Math.max(goldUpdated || 0, yieldUpdated || 0);

  return (
    <div className="space-y-2">
      {lastUpdate > 0 && (
        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          Last updated: {formatTime(lastUpdate)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gold Price */}
        <div className="rounded-2xl border border-warning/20 bg-gradient-to-br from-warning/[0.06] to-transparent p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">XAUUSD Spot</span>
            <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">{goldSource}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-warning">${goldPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            {goldDirection === "up" && <TrendingUp className="h-6 w-6 text-success" />}
            {goldDirection === "down" && <TrendingDown className="h-6 w-6 text-destructive" />}
            {goldDirection === "flat" && <Minus className="h-6 w-6 text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Gold pays no yield — it competes with rate-bearing assets.</p>
        </div>

        {/* US 10Y */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">US 10Y Yield</span>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">FRED</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-primary">{us10y.toFixed(2)}%</span>
            {yieldChange > 0 ? <TrendingUp className="h-5 w-5 text-destructive" /> : <TrendingDown className="h-5 w-5 text-success" />}
          </div>
          <p className={`text-sm font-semibold mt-1 ${yieldChange > 0 ? "text-destructive" : "text-success"}`}>
            {yieldChange > 0 ? "+" : ""}{yieldChange.toFixed(2)} bps — {yieldChange > 0 ? "bearish for gold" : "bullish for gold"}
          </p>
        </div>

        {/* Fed Funds */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/30 to-transparent p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fed Funds Rate</span>
            <Badge variant="outline" className="text-[10px] border-border text-foreground">FRED</Badge>
          </div>
          <span className="text-4xl font-bold text-foreground">{fedRate.toFixed(2)}%</span>
          <p className="text-xs text-muted-foreground mt-3">Rate cuts weaken USD and tend to boost gold. Hikes do the opposite.</p>
        </div>
      </div>
    </div>
  );
};

export default GoldLivePrice;
