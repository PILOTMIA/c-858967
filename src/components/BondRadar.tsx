import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BondData { date: string; value: number; }

interface BondIndicatorData {
  current: number;
  trend: string;
  projectionLow: number;
  projectionHigh: number;
  historicalData: BondData[];
  change1M: number;
  change3M: number;
  source: string;
}

interface BondRadarData {
  treasury10Y: BondIndicatorData;
  breakeven10Y: BondIndicatorData;
  treasury2Y: BondIndicatorData;
  yieldSpread: BondIndicatorData;
}

const FALLBACK: BondRadarData = {
  treasury10Y: { current: 4.28, trend: "Falling yields", projectionLow: 4.0, projectionHigh: 4.5, historicalData: [], change1M: -0.12, change3M: -0.22, source: 'Fallback' },
  breakeven10Y: { current: 2.35, trend: "Stable expectations", projectionLow: 2.15, projectionHigh: 2.55, historicalData: [], change1M: 0.03, change3M: 0.05, source: 'Fallback' },
  treasury2Y: { current: 4.05, trend: "Falling yields", projectionLow: 3.8, projectionHigh: 4.3, historicalData: [], change1M: -0.08, change3M: -0.20, source: 'Fallback' },
  yieldSpread: { current: 0.23, trend: "Flattening yield curve", projectionLow: 0.05, projectionHigh: 0.40, historicalData: [], change1M: -0.04, change3M: -0.02, source: 'Calculated' },
};

const fetchBondData = async (): Promise<BondRadarData> => {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/fred-proxy?series=DGS10,T10YIE,DGS2&limit=90`,
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

    const buildBond = (seriesId: string, fallback: BondIndicatorData): BondIndicatorData => {
      const obs = d[seriesId]?.observations;
      if (!obs || obs.length === 0) return fallback;
      const current = parseFloat(obs[0].value);
      const change1M = obs.length > 20 ? parseFloat((current - parseFloat(obs[20].value)).toFixed(2)) : 0;
      const change3M = obs.length > 60 ? parseFloat((current - parseFloat(obs[60].value)).toFixed(2)) : 0;

      let trend = "Stable yields";
      if (change1M > 0.1) trend = "Rising yields, bond prices declining";
      else if (change1M < -0.1) trend = "Falling yields, bond prices rising";

      const historicalData: BondData[] = obs.slice().reverse().map((o: any) => ({
        date: new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(o.value),
      }));

      return {
        current,
        trend,
        projectionLow: parseFloat((current - 0.3).toFixed(2)),
        projectionHigh: parseFloat((current + 0.3).toFixed(2)),
        historicalData,
        change1M,
        change3M,
        source: 'FRED API 🟢',
      };
    };

    const t10 = buildBond('DGS10', FALLBACK.treasury10Y);
    const be10 = buildBond('T10YIE', FALLBACK.breakeven10Y);
    const t2 = buildBond('DGS2', FALLBACK.treasury2Y);

    const spread = parseFloat((t10.current - t2.current).toFixed(2));
    return {
      treasury10Y: t10,
      breakeven10Y: { ...be10, trend: be10.change1M > 0.05 ? "Rising inflation expectations" : be10.change1M < -0.05 ? "Falling inflation expectations" : "Stable inflation expectations" },
      treasury2Y: t2,
      yieldSpread: {
        current: spread,
        trend: spread < 0 ? "Inverted yield curve — recession signal" : spread < 0.5 ? "Flattening yield curve" : "Normal yield curve",
        projectionLow: parseFloat((spread - 0.2).toFixed(2)),
        projectionHigh: parseFloat((spread + 0.2).toFixed(2)),
        historicalData: [],
        change1M: parseFloat((t10.change1M - t2.change1M).toFixed(2)),
        change3M: 0,
        source: 'Calculated',
      },
    };
  } catch (error) {
    console.error('Error fetching bond data:', error);
    return FALLBACK;
  }
};

const BondRadar = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bondData'],
    queryFn: fetchBondData,
    refetchInterval: 60 * 60 * 1000,
  });

  const getTrendIcon = (trend: string) => {
    if (trend.includes('Rising') || trend.includes('Inverted')) return <TrendingUp className="w-4 h-4 text-destructive" />;
    if (trend.includes('Falling')) return <TrendingDown className="w-4 h-4 text-success" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('Rising') || trend.includes('Inverted')) return "text-destructive";
    if (trend.includes('Falling')) return "text-success";
    return "text-muted-foreground";
  };

  const getChangeColor = (change: number) => {
    if (change > 0.05) return "text-destructive";
    if (change < -0.05) return "text-success";
    return "text-muted-foreground";
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const renderBondCard = (title: string, description: string, indicatorData: BondIndicatorData) => (
    <div className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <Badge variant="outline" className="text-[10px]">{indicatorData.source}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="px-4 sm:px-5 pb-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Yield</p>
            <p className="text-3xl font-bold text-foreground">{indicatorData.current}%</p>
          </div>
          {getTrendIcon(indicatorData.trend)}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/30 p-2 rounded-xl">
            <p className="text-[10px] text-muted-foreground">1M Change</p>
            <p className={`text-sm font-bold ${getChangeColor(indicatorData.change1M)}`}>
              {indicatorData.change1M > 0 ? '+' : ''}{indicatorData.change1M}%
            </p>
          </div>
          <div className="bg-muted/30 p-2 rounded-xl">
            <p className="text-[10px] text-muted-foreground">3M Change</p>
            <p className={`text-sm font-bold ${getChangeColor(indicatorData.change3M)}`}>
              {indicatorData.change3M > 0 ? '+' : ''}{indicatorData.change3M}%
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-2 rounded-xl">
          <p className={`text-xs font-medium ${getTrendColor(indicatorData.trend)}`}>{indicatorData.trend}</p>
        </div>

        {indicatorData.historicalData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indicatorData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={Math.floor(indicatorData.historicalData.length / 6)} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name={title} />
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
            <DollarSign className="w-6 h-6 text-primary" /> Bond Market Monitor
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            US Treasury yields and inflation expectations from FRED
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderBondCard("10-Year Treasury Yield", "Key benchmark for mortgage rates and economic sentiment", data.treasury10Y)}
        {renderBondCard("10-Year Breakeven Inflation", "Market's expected inflation over the next 10 years", data.breakeven10Y)}
        {renderBondCard("2-Year Treasury Yield", "Sensitive to Fed policy expectations", data.treasury2Y)}
        {renderBondCard("10Y-2Y Yield Spread", "Inversion often precedes recessions", data.yieldSpread)}
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Source: Federal Reserve Economic Data (FRED) — St. Louis Fed • Data refreshes hourly
      </p>
    </div>
  );
};

export default BondRadar;
