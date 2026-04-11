import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Globe, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface GDPEntry {
  country: string;
  flag: string;
  currency: string;
  gdp: number;
  previous: number;
  forecast: number;
  source: string;
}

const GDP_DATA: GDPEntry[] = [
  { country: 'United States', flag: '🇺🇸', currency: 'USD', gdp: 2.4, previous: 3.1, forecast: 2.0, source: 'BEA / FRED' },
  { country: 'Eurozone', flag: '🇪🇺', currency: 'EUR', gdp: 0.9, previous: 0.4, forecast: 1.0, source: 'Eurostat' },
  { country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', gdp: 1.1, previous: 0.1, forecast: 1.3, source: 'ONS' },
  { country: 'Japan', flag: '🇯🇵', currency: 'JPY', gdp: 1.2, previous: 0.7, forecast: 1.0, source: 'Cabinet Office' },
  { country: 'Switzerland', flag: '🇨🇭', currency: 'CHF', gdp: 1.5, previous: 1.3, forecast: 1.4, source: 'SECO' },
  { country: 'Australia', flag: '🇦🇺', currency: 'AUD', gdp: 2.6, previous: 2.1, forecast: 2.3, source: 'ABS' },
  { country: 'Canada', flag: '🇨🇦', currency: 'CAD', gdp: 1.8, previous: 1.5, forecast: 1.6, source: 'StatCan' },
  { country: 'New Zealand', flag: '🇳🇿', currency: 'NZD', gdp: 1.5, previous: -0.2, forecast: 1.8, source: 'StatsNZ' },
];

const fetchLiveGDP = async (): Promise<GDPEntry[]> => {
  try {
    const currencies = GDP_DATA.map(g => g.currency).join(',');
    const { data } = await supabase.functions.invoke('macro-data', {
      body: undefined,
      headers: { 'Content-Type': 'application/json' },
    });

    // Use URL-based approach
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/macro-data?currencies=${currencies}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch');
    const result = await res.json();

    return GDP_DATA.map(entry => ({
      ...entry,
      gdp: result.data?.[entry.currency]?.gdp ?? entry.gdp,
      source: result.data?.[entry.currency]?.source === 'fred' ? 'FRED API 🟢' : entry.source,
    }));
  } catch {
    return GDP_DATA;
  }
};

const GDPRadar = () => {
  const { data: gdpData, isLoading } = useQuery({
    queryKey: ['gdpRadar'],
    queryFn: fetchLiveGDP,
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  const entries = gdpData || GDP_DATA;
  const chartData = entries.map(e => ({ name: e.currency, gdp: e.gdp, previous: e.previous, forecast: e.forecast }));

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" /> GDP Growth Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quarterly annualized GDP growth (%) across G8 economies • Sources: FRED, BEA, Eurostat, ONS
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" /> Q4 2025
        </Badge>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
                formatter={(value: number, name: string) => [`${value}%`, name === 'gdp' ? 'Current' : name === 'previous' ? 'Previous' : 'Forecast']}
              />
              <Bar dataKey="gdp" name="Current GDP" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.gdp >= 2 ? 'hsl(var(--success))' : entry.gdp >= 1 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                ))}
              </Bar>
              <Bar dataKey="previous" name="Previous" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {entries.map((entry) => {
          const change = entry.gdp - entry.previous;
          const isPositive = change > 0;
          return (
            <div
              key={entry.currency}
              className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{entry.flag}</span>
                  <div>
                    <div className="font-bold text-foreground text-sm">{entry.currency}</div>
                    <div className="text-[10px] text-muted-foreground">{entry.country}</div>
                  </div>
                </div>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : change < 0 ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="text-3xl font-bold text-foreground mb-1">{entry.gdp}%</div>

              <div className="flex items-center gap-2 text-xs">
                <span className={isPositive ? 'text-success' : 'text-destructive'}>
                  {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}pp
                </span>
                <span className="text-muted-foreground">vs prev</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Forecast: {entry.forecast}%</span>
                <span>{entry.source}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5">
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          💡 Key GDP Insights for Traders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">🇺🇸 USD</span> — US GDP at 2.4% shows resilient growth despite tariff uncertainties. Supports hawkish Fed stance and USD demand.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇪🇺 EUR</span> — Eurozone recovery fragile at 0.9%. ECB's aggressive easing cycle reflects weak fundamentals.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇦🇺 AUD</span> — Australia leads at 2.6%, commodity-driven growth. RBA cut was cautious, limiting downside.
          </div>
          <div>
            <span className="font-semibold text-foreground">🇳🇿 NZD</span> — NZ bouncing from -0.2% to 1.5%. Recovery supports NZD but RBNZ still cutting aggressively.
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Source: Federal Reserve Economic Data (FRED), Bureau of Economic Analysis (BEA), Eurostat, ONS, Cabinet Office Japan • Last updated: Q4 2025 release
        </p>
      </div>
    </div>
  );
};

export default GDPRadar;
