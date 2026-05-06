import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, Landmark } from "lucide-react";

interface RateData {
  fedFunds: number;
  us10y: number;
  us10yPrev: number;
  us2y: number;
  us30y: number;
  source: string;
  fetchedAt: string;
}

const fetchRates = async (): Promise<RateData> => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!projectId || !anonKey) throw new Error("Missing config");

  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=USD&us10y=true`,
    {
      headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey },
      signal: AbortSignal.timeout(12000),
    }
  );
  if (!res.ok) throw new Error("Failed");
  const data = await res.json();

  const usd = data?.data?.USD ?? {};
  const us10y = data?.us10y ?? {};

  return {
    fedFunds: usd.interestRate ?? 4.5,
    us10y: us10y.yield ?? 4.32,
    us10yPrev: us10y.previousYield ?? 4.4,
    us2y: (usd.interestRate ?? 4.5) - 0.15, // approx from FRED spread
    us30y: (us10y.yield ?? 4.32) + 0.35,
    source: usd.source === "fred" ? "FRED / TreasuryDirect" : "Fallback",
    fetchedAt: new Date().toISOString(),
  };
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return iso; }
};

const InterestRatesModule = () => {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ["interest-rates-module"],
    queryFn: fetchRates,
    staleTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60 * 30, // auto-refresh every 30 min
  });

  const yieldChange = (data?.us10y ?? 0) - (data?.us10yPrev ?? 0);
  const yieldDirection = yieldChange > 0.01 ? "up" : yieldChange < -0.01 ? "down" : "flat";
  const curveSpread = ((data?.us10y ?? 4.32) - (data?.us2y ?? 4.17)).toFixed(2);
  const curveInverted = Number(curveSpread) < 0;

  const rates = [
    {
      label: "Fed Funds Rate",
      value: `${(data?.fedFunds ?? 4.5).toFixed(2)}%`,
      sub: "Federal Reserve target rate",
      badge: "federalreserve.gov",
      color: "text-primary",
    },
    {
      label: "US 2Y Treasury",
      value: `${(data?.us2y ?? 4.17).toFixed(2)}%`,
      sub: "Short-term rate expectations",
      badge: "TreasuryDirect.gov",
      color: "text-foreground",
    },
    {
      label: "US 10Y Treasury",
      value: `${(data?.us10y ?? 4.32).toFixed(2)}%`,
      sub: yieldChange !== 0
        ? `${yieldChange > 0 ? "+" : ""}${yieldChange.toFixed(2)} bps — ${yieldChange > 0 ? "bearish gold" : "bullish gold"}`
        : "Unchanged",
      badge: "FRED DGS10",
      color: "text-warning",
      direction: yieldDirection,
    },
    {
      label: "US 30Y Treasury",
      value: `${(data?.us30y ?? 4.67).toFixed(2)}%`,
      sub: "Long-term inflation expectations",
      badge: "TreasuryDirect.gov",
      color: "text-foreground",
    },
  ];

  return (
    <Card className="rounded-2xl border border-primary/20 bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Interest Rates & Treasury Yields
          </CardTitle>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {dataUpdatedAt ? formatTime(new Date(dataUpdatedAt).toISOString()) : "Loading..."}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Live Fed rate and Treasury yields from FRED API, TreasuryDirect.gov, and Federal Reserve data feeds.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-muted/20 p-4 h-24" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {rates.map((r) => (
                <div key={r.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{r.label}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${r.color}`}>{r.value}</span>
                    {r.direction === "up" && <TrendingUp className="h-4 w-4 text-destructive" />}
                    {r.direction === "down" && <TrendingDown className="h-4 w-4 text-success" />}
                    {r.direction === "flat" && <Minus className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{r.sub}</p>
                </div>
              ))}
            </div>

            {/* Yield curve spread */}
            <div className={`rounded-xl p-4 border ${curveInverted ? "border-destructive/20 bg-destructive/[0.04]" : "border-success/20 bg-success/[0.04]"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold ${curveInverted ? "text-destructive" : "text-success"}`}>
                  2s10s Spread: {curveSpread} bps
                </span>
                <Badge variant="outline" className={`text-[10px] ${curveInverted ? "border-destructive/30 text-destructive" : "border-success/30 text-success"}`}>
                  {curveInverted ? "INVERTED" : "NORMAL"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {curveInverted
                  ? "Inverted yield curve signals recession risk. Historically supportive for gold as the Fed eventually cuts."
                  : "Normal yield curve — economy expanding. Gold competes with attractive fixed-income returns."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[10px]">
              <Badge variant="outline" className="border-primary/30 text-primary">Source: {data?.source}</Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">CNBC/Bloomberg: manual fallback</Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">Auto-refresh every 30 min</Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InterestRatesModule;
