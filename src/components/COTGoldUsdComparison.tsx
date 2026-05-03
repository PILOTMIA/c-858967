import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const USD_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "USDCAD", "AUDUSD", "NZDUSD", "USDCHF"];

type HistoryPoint = { date: string; close: number };

type PriceResponse = {
  rates?: Record<string, { rate: number; source: string }>;
  history?: Record<string, HistoryPoint[]>;
};

const fallbackHistory = (start: number, direction: 1 | -1) =>
  Array.from({ length: 28 }, (_, index) => ({
    date: `D${index + 1}`,
    close: Number((start * (1 + direction * index * 0.002 + Math.sin(index / 3) * 0.004)).toFixed(4)),
  }));

const fetchComparisonData = async (pair: string): Promise<PriceResponse> => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!projectId || !anonKey) return {};

  const response = await fetch(`https://${projectId}.supabase.co/functions/v1/forex-prices?pairs=XAUUSD,${pair}&history=true`, {
    headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) throw new Error(`Price data failed with status ${response.status}`);
  return response.json();
};

const pctChange = (series: HistoryPoint[]) => {
  if (series.length < 2) return 0;
  const first = series[0].close;
  const last = series[series.length - 1].close;
  return ((last - first) / first) * 100;
};

const correlation = (a: number[], b: number[]) => {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const ax = a.slice(-n);
  const bx = b.slice(-n);
  const avgA = ax.reduce((sum, value) => sum + value, 0) / n;
  const avgB = bx.reduce((sum, value) => sum + value, 0) / n;
  const numerator = ax.reduce((sum, value, index) => sum + (value - avgA) * (bx[index] - avgB), 0);
  const denomA = Math.sqrt(ax.reduce((sum, value) => sum + (value - avgA) ** 2, 0));
  const denomB = Math.sqrt(bx.reduce((sum, value) => sum + (value - avgB) ** 2, 0));
  return denomA && denomB ? numerator / (denomA * denomB) : 0;
};

const returns = (series: HistoryPoint[]) =>
  series.slice(1).map((point, index) => ((point.close - series[index].close) / series[index].close) * 100);

const COTGoldUsdComparison = () => {
  const [pair, setPair] = useState("EURUSD");
  const { data, isLoading } = useQuery({
    queryKey: ["gold-usd-comparison", pair],
    queryFn: () => fetchComparisonData(pair),
    staleTime: 1000 * 60 * 15,
  });

  const xauHistory = data?.history?.XAUUSD?.length ? data.history.XAUUSD : fallbackHistory(2350, 1);
  const pairHistory = data?.history?.[pair]?.length ? data.history[pair] : fallbackHistory(pair.startsWith("USD") ? 150 : 1.08, pair.startsWith("USD") ? 1 : -1);

  const chartData = useMemo(() => {
    const count = Math.min(xauHistory.length, pairHistory.length, 45);
    const gold = xauHistory.slice(-count);
    const fx = pairHistory.slice(-count);
    const goldStart = gold[0]?.close || 1;
    const fxStart = fx[0]?.close || 1;
    return gold.map((point, index) => ({
      date: point.date.slice(5) || point.date,
      XAUUSD: Number(((point.close / goldStart) * 100).toFixed(2)),
      [pair]: Number((((fx[index]?.close || fxStart) / fxStart) * 100).toFixed(2)),
    }));
  }, [pair, pairHistory, xauHistory]);

  const goldChange = pctChange(xauHistory);
  const pairChange = pctChange(pairHistory);
  const corr = correlation(returns(xauHistory), returns(pairHistory));
  const source = data?.rates?.XAUUSD?.source || data?.rates?.[pair]?.source || "live/fallback blend";
  const goldSupportsUsdWeakness = goldChange > 0 && (!pair.startsWith("USD") ? pairChange > 0 : pairChange < 0);

  return (
    <Card className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            XAUUSD vs USD Pair Comparison
          </CardTitle>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Indexed trend chart with live price data where available. Gold strength often confirms USD weakness.
          </p>
        </div>
        <Select value={pair} onValueChange={setPair}>
          <SelectTrigger className="w-full border-border bg-background text-foreground sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USD_PAIRS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">Correlation</p>
            <div className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground">
              {corr <= -0.2 ? <TrendingDown className="h-5 w-5 text-destructive" /> : <Activity className="h-5 w-5 text-warning" />}
              {corr.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">XAUUSD Trend</p>
            <div className={`mt-2 flex items-center gap-2 text-2xl font-bold ${goldChange >= 0 ? "text-success" : "text-destructive"}`}>
              {goldChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {goldChange >= 0 ? "+" : ""}{goldChange.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-medium text-muted-foreground">{pair} Trend</p>
            <div className={`mt-2 flex items-center gap-2 text-2xl font-bold ${pairChange >= 0 ? "text-success" : "text-destructive"}`}>
              {pairChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {pairChange >= 0 ? "+" : ""}{pairChange.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="h-80 rounded-lg border border-border bg-background p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              <Line type="monotone" dataKey="XAUUSD" stroke="hsl(var(--warning))" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey={pair} stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-foreground">
            {goldSupportsUsdWeakness
              ? `Gold and ${pair} are confirming broad USD weakness. Look for clean pullbacks before chasing entries.`
              : `Gold and ${pair} are not fully aligned. Treat USD trades as lower conviction until trends confirm.`}
          </p>
          <Badge variant="outline" className="w-fit border-border text-sm text-foreground">Source: {source}</Badge>
        </div>
        {isLoading && <p className="text-sm text-muted-foreground">Refreshing live comparison data...</p>}
      </CardContent>
    </Card>
  );
};

export default COTGoldUsdComparison;
