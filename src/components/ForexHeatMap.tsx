import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Activity, Clock, Calculator } from "lucide-react";
import MarketClock from "./MarketClock";
import CorrelationAnalysis from "./CorrelationAnalysis";

interface HeatMapData {
  pair: string;
  currentPrice: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
  strength: number;
  changePercent: number;
  pivot: number;
  r1: number;
  s1: number;
  weeklyPivot: number;
  monthlyPivot: number;
  channelDirection: "BULLISH" | "BEARISH" | "SIDEWAYS";
  riskReward: number;
}

const PAIRS = [
  "EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","NZD/USD",
  "EUR/GBP","EUR/JPY","GBP/JPY","AUD/JPY","CAD/JPY","CHF/JPY","EUR/CHF",
  "EUR/AUD","GBP/CHF","AUD/CHF","NZD/JPY","GBP/AUD","EUR/CAD","GBP/CAD",
  "AUD/CAD","EUR/NZD","XAUUSD","XTIUSD",
];

const fetchHeatMapData = async (): Promise<HeatMapData[]> =>
  PAIRS.map((pair) => {
    const base = pair === "XAUUSD" ? 2000 + Math.random() * 100
      : pair === "XTIUSD" ? 70 + Math.random() * 20
      : Math.random() * 2 + 0.5;
    const high = base * (1 + Math.random() * 0.02);
    const low = base * (1 - Math.random() * 0.02);
    const close = base * (1 + (Math.random() - 0.5) * 0.01);
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const s1 = 2 * pivot - high;
    const change = (Math.random() - 0.5) * 4;
    const dir = change > 0.8 ? "BULLISH" : change < -0.8 ? "BEARISH" : "SIDEWAYS";
    const signal = change > 1 ? "BUY" : change < -1 ? "SELL" : "NEUTRAL";
    return {
      pair,
      currentPrice: close,
      signal,
      strength: Math.min(100, Math.abs(change) * 25),
      changePercent: change,
      pivot, r1, s1,
      weeklyPivot: pivot * (1 + (Math.random() - 0.5) * 0.01),
      monthlyPivot: pivot * (1 + (Math.random() - 0.5) * 0.02),
      channelDirection: dir,
      riskReward: 0.8 + Math.random() * 2,
    };
  });

const formatPair = (p: string) => p === "XAUUSD" ? "GOLD" : p === "XTIUSD" ? "OIL" : p.replace("/", "");
const formatPrice = (p: string, n: number | undefined | null) => {
  if (n == null || isNaN(n as number)) return "—";
  return p === "XAUUSD" || p === "XTIUSD" ? n.toFixed(2) : n.toFixed(4);
};

const ForexHeatMap = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["forexHeatMap"],
    queryFn: fetchHeatMapData,
    refetchInterval: 5000,
  });
  const [selected, setSelected] = useState("EUR/USD");
  const [lotSize, setLotSize] = useState(0.1);
  const [accountCcy, setAccountCcy] = useState("USD");

  const selectedData = useMemo(() => data?.find((d) => d.pair === selected), [data, selected]);

  const summary = useMemo(() => {
    if (!data) return { buy: 0, sell: 0, neutral: 0 };
    return {
      buy: data.filter((d) => d.signal === "BUY").length,
      sell: data.filter((d) => d.signal === "SELL").length,
      neutral: data.filter((d) => d.signal === "NEUTRAL").length,
    };
  }, [data]);

  const pipValue = useMemo(() => {
    if (!selected) return 0;
    return selected.includes("JPY")
      ? (0.01 * lotSize * 100000) / 100
      : 0.0001 * lotSize * 100000;
  }, [selected, lotSize]);

  const getCellStyle = (signal: HeatMapData["signal"], change: number) => {
    const intensity = Math.min(Math.abs(change) / 3, 1);
    if (signal === "BUY") return { background: `hsl(var(--success) / ${0.08 + intensity * 0.18})`, borderColor: `hsl(var(--success) / ${0.3 + intensity * 0.4})` };
    if (signal === "SELL") return { background: `hsl(var(--destructive) / ${0.08 + intensity * 0.18})`, borderColor: `hsl(var(--destructive) / ${0.3 + intensity * 0.4})` };
    return { background: "hsl(var(--muted) / 0.3)", borderColor: "hsl(var(--border))" };
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Currency Heat Map</h2>
          <p className="text-sm text-muted-foreground mt-1">Live pivot signals across 25 instruments · refreshes every 5s</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5 border-success/40 text-success bg-success/10">
            <TrendingUp className="h-3 w-3" /> {summary.buy} Buy
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-destructive/40 text-destructive bg-destructive/10">
            <TrendingDown className="h-3 w-3" /> {summary.sell} Sell
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            <Minus className="h-3 w-3" /> {summary.neutral} Neutral
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-primary/40 text-primary bg-primary/10">
            <Activity className="h-3 w-3 animate-pulse" /> Live
          </Badge>
        </div>
      </div>

      <MarketClock />

      {/* Pip Calculator */}
      <Card className="p-5 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Pip Calculator</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lot Size</label>
            <Input type="number" step="0.01" value={lotSize} onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Currency</label>
            <Select value={accountCcy} onValueChange={setAccountCcy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Selected Pair</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {PAIRS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedData && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/50">
            <Stat label="Pip Value" value={`$${pipValue.toFixed(2)}`} />
            <Stat label="Current Price" value={formatPrice(selected, selectedData.currentPrice)} />
            <Stat label="Risk / Reward" value={`1:${selectedData.riskReward.toFixed(2)}`} />
            <Stat label="Signal" value={selectedData.signal} accent={selectedData.signal} />
          </div>
        )}
      </Card>

      {/* Heat Map Grid */}
      <Card className="p-4 sm:p-6 bg-card/40 backdrop-blur-sm border-border/50">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
          {isLoading
            ? [...Array(25)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-muted/40 animate-pulse" />
              ))
            : data?.map((d) => {
                const style = getCellStyle(d.signal, d.changePercent);
                const isActive = selected === d.pair;
                return (
                  <button
                    key={d.pair}
                    onClick={() => setSelected(d.pair)}
                    style={style}
                    className={`group relative aspect-[4/3] rounded-xl border p-2 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.06] hover:z-10 hover:shadow-lg ${
                      isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.04]" : ""
                    }`}
                  >
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <div className="text-[11px] font-bold tracking-wider text-foreground/90 mb-0.5">
                      {formatPair(d.pair)}
                    </div>
                    <div className={`text-sm font-mono font-bold ${d.changePercent > 0 ? "text-success" : d.changePercent < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {d.changePercent > 0 ? "+" : ""}{d.changePercent.toFixed(2)}%
                    </div>
                    <div className={`mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      d.signal === "BUY" ? "bg-success text-success-foreground" :
                      d.signal === "SELL" ? "bg-destructive text-destructive-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {d.signal}
                    </div>
                  </button>
                );
              })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <LegendDot color="success" label="Bullish" />
          <LegendDot color="destructive" label="Bearish" />
          <LegendDot color="muted" label="Neutral" />
          <span className="opacity-70">Click any cell for detailed analysis</span>
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedData && (
        <Card className="p-5 sm:p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                {selected} <span className="text-muted-foreground font-normal text-sm ml-2">Detailed Analysis</span>
              </h3>
            </div>
            <Badge
              variant="outline"
              className={
                selectedData.channelDirection === "BULLISH" ? "border-success/40 text-success bg-success/10" :
                selectedData.channelDirection === "BEARISH" ? "border-destructive/40 text-destructive bg-destructive/10" :
                ""
              }
            >
              Channel: {selectedData.channelDirection}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label="Current" value={formatPrice(selected, selectedData.currentPrice)} />
            <Stat label="Daily Pivot" value={formatPrice(selected, selectedData.pivot)} />
            <Stat label="R1" value={formatPrice(selected, selectedData.r1)} accent="BUY" />
            <Stat label="S1" value={formatPrice(selected, selectedData.s1)} accent="SELL" />
            <Stat label="Weekly Pivot" value={formatPrice(selected, selectedData.weeklyPivot)} />
            <Stat label="Monthly Pivot" value={formatPrice(selected, selectedData.monthlyPivot)} />
          </div>
        </Card>
      )}

      <CorrelationAnalysis heatMapData={data} />
    </section>
  );
};

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: "BUY" | "SELL" | "NEUTRAL" }) => (
  <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
    <div className={`mt-0.5 font-mono font-semibold text-sm ${
      accent === "BUY" ? "text-success" : accent === "SELL" ? "text-destructive" : "text-foreground"
    }`}>{value}</div>
  </div>
);

const LegendDot = ({ color, label }: { color: "success" | "destructive" | "muted"; label: string }) => (
  <span className="flex items-center gap-1.5">
    <span className={`w-2.5 h-2.5 rounded-full ${
      color === "success" ? "bg-success" : color === "destructive" ? "bg-destructive" : "bg-muted-foreground/50"
    }`} />
    {label}
  </span>
);

export default ForexHeatMap;
