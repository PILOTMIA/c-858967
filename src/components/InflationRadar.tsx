import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CPIData {
  date: string;
  value: number;
}

interface IndicatorData {
  current: number;
  trend: string;
  projectionLow: number;
  projectionHigh: number;
  nextRelease: string;
  historicalData: CPIData[];
  yoyChange?: number;
  source: string;
}

interface InflationData {
  cpi: IndicatorData;
  coreCPI: IndicatorData;
  ppi: IndicatorData;
  exportPriceIndex: IndicatorData;
}

const FALLBACK: InflationData = {
  cpi: { current: 2.8, trend: "Stable inflation trend", projectionLow: 2.6, projectionHigh: 3.0, nextRelease: "Apr 10, 2026", historicalData: [], yoyChange: 2.8, source: 'Fallback' },
  coreCPI: { current: 3.0, trend: "Stable inflation trend", projectionLow: 2.8, projectionHigh: 3.2, nextRelease: "Apr 10, 2026", historicalData: [], yoyChange: 3.0, source: 'Fallback' },
  ppi: { current: 2.4, trend: "Declining trend", projectionLow: 2.1, projectionHigh: 2.7, nextRelease: "Apr 11, 2026", historicalData: [], yoyChange: 2.4, source: 'Fallback' },
  exportPriceIndex: { current: 1.5, trend: "Declining trend", projectionLow: 1.2, projectionHigh: 1.8, nextRelease: "Apr 14, 2026", historicalData: [], yoyChange: 1.5, source: 'Fallback' },
};

const fetchInflationData = async (): Promise<InflationData> => {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/fred-proxy?series=CPIAUCSL,CPILFESL,PPIACO,IQ&limit=24&units=pc1`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) throw new Error('API error');
    const result = await res.json();
    const d = result.data;

    const buildIndicator = (seriesId: string, fallback: IndicatorData): IndicatorData => {
      const obs = d[seriesId]?.observations;
      if (!obs || obs.length === 0) return fallback;
      const current = parseFloat(parseFloat(obs[0].value).toFixed(1));
      const prev = obs.length > 1 ? parseFloat(obs[1].value) : current;
      const older = obs.length > 2 ? parseFloat(obs[2].value) : prev;
      const recentChange = current - prev;
      const priorChange = prev - older;
      let trend = "Stable inflation trend with minimal change";
      if (recentChange > 0.1 && priorChange > 0.1) trend = "Rising inflation trend, up recently";
      else if (recentChange < -0.1 && priorChange < -0.1) trend = "Declining inflation trend, down recently";

      const historicalData: CPIData[] = obs.slice().reverse().map((o: any) => ({
        date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: parseFloat(parseFloat(o.value).toFixed(2)),
      }));

      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      const nextRelease = nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        current,
        trend,
        projectionLow: parseFloat((current - 0.2).toFixed(1)),
        projectionHigh: parseFloat((current + 0.2).toFixed(1)),
        nextRelease,
        historicalData,
        yoyChange: current,
        source: 'FRED API 🟢',
      };
    };

    return {
      cpi: buildIndicator('CPIAUCSL', FALLBACK.cpi),
      coreCPI: buildIndicator('CPILFESL', FALLBACK.coreCPI),
      ppi: buildIndicator('PPIACO', FALLBACK.ppi),
      exportPriceIndex: buildIndicator('IQ', FALLBACK.exportPriceIndex),
    };
  } catch (error) {
    console.error('Error fetching inflation data:', error);
    return FALLBACK;
  }
};

const InflationRadar = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['inflationData'],
    queryFn: fetchInflationData,
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  const getTrendIcon = (trend: string) => {
    if (trend.includes('Rising')) return <TrendingUp className="w-4 h-4 text-destructive" />;
    if (trend.includes('Declining')) return <TrendingDown className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('Rising')) return "text-destructive";
    if (trend.includes('Declining')) return "text-success";
    return "text-muted-foreground";
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-3 sm:p-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const renderIndicatorCard = (
    title: string,
    description: string,
    indicatorData: IndicatorData,
    color: string = "red"
  ) => (
    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1">
          <h3 className="text-base sm:text-lg font-bold text-foreground">{title}</h3>
          <Badge variant="outline" className="text-[10px]">
            {indicatorData.source}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="px-4 sm:px-5 pb-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Rate (YoY)</p>
            <p className="text-3xl font-bold text-foreground">{indicatorData.current}%</p>
          </div>
          {getTrendIcon(indicatorData.trend)}
        </div>

        <div className="bg-muted/30 p-3 rounded-xl">
          <p className={`text-xs font-medium ${getTrendColor(indicatorData.trend)}`}>
            {indicatorData.trend}
          </p>
        </div>

        <div className="border border-border/30 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">Next Release Projection</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Low</p>
              <p className="text-base font-bold text-success">{indicatorData.projectionLow}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">High</p>
              <p className="text-base font-bold text-destructive">{indicatorData.projectionHigh}%</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Next: {indicatorData.nextRelease}</p>
        </div>

        {indicatorData.historicalData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indicatorData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} interval="preserveStartEnd" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  name={title}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Inflation Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            US inflation indicators from FRED — CPI, Core CPI, PPI, Export Price Index
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {renderIndicatorCard("Consumer Price Index (CPI)", "Average change in prices paid by urban consumers", data.cpi)}
        {renderIndicatorCard("Core CPI", "CPI excluding volatile food and energy prices", data.coreCPI)}
        {renderIndicatorCard("Producer Price Index (PPI)", "Average change in prices received by domestic producers", data.ppi)}
        {renderIndicatorCard("Export Price Index", "Change in prices of goods exported from the US", data.exportPriceIndex)}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Source: Federal Reserve Economic Data (FRED) — St. Louis Fed • Data refreshes every 6 hours
      </p>
    </div>
  );
};

export default InflationRadar;
