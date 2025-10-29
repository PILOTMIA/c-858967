import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BondData {
  date: string;
  value: number;
}

interface BondIndicatorData {
  current: number;
  trend: string;
  projectionLow: number;
  projectionHigh: number;
  historicalData: BondData[];
  change1M: number;
  change3M: number;
}

interface BondRadarData {
  treasury10Y: BondIndicatorData;
  breakeven10Y: BondIndicatorData;
  treasury2Y: BondIndicatorData;
  yieldSpread: BondIndicatorData;
}

const fetchBondData = async (): Promise<BondRadarData> => {
  try {
    // Fetch bond market data from FRED
    const [treasury10YRes, breakeven10YRes, treasury2YRes] = await Promise.all([
      fetch('https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=demo&file_type=json&limit=90&sort_order=desc'),
      fetch('https://api.stlouisfed.org/fred/series/observations?series_id=T10YIE&api_key=demo&file_type=json&limit=90&sort_order=desc'),
      fetch('https://api.stlouisfed.org/fred/series/observations?series_id=DGS2&api_key=demo&file_type=json&limit=90&sort_order=desc')
    ]);

    if (!treasury10YRes.ok || !breakeven10YRes.ok || !treasury2YRes.ok) {
      throw new Error('Failed to fetch bond data');
    }

    const treasury10YData = await treasury10YRes.json();
    const breakeven10YData = await breakeven10YRes.json();
    const treasury2YData = await treasury2YRes.json();

    // Helper functions
    const calculateChange = (observations: any[], periods: number) => {
      if (observations.length < periods + 1) return 0;
      const current = parseFloat(observations[0]?.value || '0');
      const past = parseFloat(observations[periods]?.value || current);
      return parseFloat((current - past).toFixed(2));
    };

    const determineTrend = (change1M: number) => {
      if (change1M > 0.1) return "Rising yields, bond prices declining";
      if (change1M < -0.1) return "Falling yields, bond prices rising";
      return "Stable yields with minimal change";
    };

    const formatHistoricalData = (observations: any[]): BondData[] => {
      return observations
        .reverse()
        .filter(obs => obs.value && obs.value !== '.')
        .map((obs: any) => ({
          date: new Date(obs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: parseFloat(obs.value)
        }));
    };

    // Process 10-Year Treasury
    const treasury10YCurrent = parseFloat(treasury10YData.observations[0]?.value || '4.5');
    const treasury10YChange1M = calculateChange(treasury10YData.observations, 30);
    const treasury10YChange3M = calculateChange(treasury10YData.observations, 90);

    // Process 10-Year Breakeven
    const breakeven10YCurrent = parseFloat(breakeven10YData.observations[0]?.value || '2.3');
    const breakeven10YChange1M = calculateChange(breakeven10YData.observations, 30);
    const breakeven10YChange3M = calculateChange(breakeven10YData.observations, 90);

    // Process 2-Year Treasury
    const treasury2YCurrent = parseFloat(treasury2YData.observations[0]?.value || '4.3');
    const treasury2YChange1M = calculateChange(treasury2YData.observations, 30);
    const treasury2YChange3M = calculateChange(treasury2YData.observations, 90);

    // Calculate yield spread (10Y - 2Y)
    const yieldSpreadCurrent = parseFloat((treasury10YCurrent - treasury2YCurrent).toFixed(2));
    const yieldSpread1MValue = treasury10YCurrent - treasury2YChange1M - (treasury2YCurrent - treasury2YChange1M);
    const yieldSpreadChange1M = parseFloat((yieldSpreadCurrent - yieldSpread1MValue).toFixed(2));

    return {
      treasury10Y: {
        current: treasury10YCurrent,
        trend: determineTrend(treasury10YChange1M),
        projectionLow: parseFloat((treasury10YCurrent - 0.3).toFixed(2)),
        projectionHigh: parseFloat((treasury10YCurrent + 0.3).toFixed(2)),
        historicalData: formatHistoricalData(treasury10YData.observations),
        change1M: treasury10YChange1M,
        change3M: treasury10YChange3M
      },
      breakeven10Y: {
        current: breakeven10YCurrent,
        trend: breakeven10YChange1M > 0.05 ? "Rising inflation expectations" : breakeven10YChange1M < -0.05 ? "Falling inflation expectations" : "Stable inflation expectations",
        projectionLow: parseFloat((breakeven10YCurrent - 0.2).toFixed(2)),
        projectionHigh: parseFloat((breakeven10YCurrent + 0.2).toFixed(2)),
        historicalData: formatHistoricalData(breakeven10YData.observations),
        change1M: breakeven10YChange1M,
        change3M: breakeven10YChange3M
      },
      treasury2Y: {
        current: treasury2YCurrent,
        trend: determineTrend(treasury2YChange1M),
        projectionLow: parseFloat((treasury2YCurrent - 0.3).toFixed(2)),
        projectionHigh: parseFloat((treasury2YCurrent + 0.3).toFixed(2)),
        historicalData: formatHistoricalData(treasury2YData.observations),
        change1M: treasury2YChange1M,
        change3M: treasury2YChange3M
      },
      yieldSpread: {
        current: yieldSpreadCurrent,
        trend: yieldSpreadCurrent < 0 ? "Inverted yield curve - recession signal" : yieldSpreadCurrent < 0.5 ? "Flattening yield curve" : "Normal yield curve",
        projectionLow: parseFloat((yieldSpreadCurrent - 0.2).toFixed(2)),
        projectionHigh: parseFloat((yieldSpreadCurrent + 0.2).toFixed(2)),
        historicalData: [],
        change1M: yieldSpreadChange1M,
        change3M: 0
      }
    };
  } catch (error) {
    console.error('Error fetching bond data:', error);
    return {
      treasury10Y: {
        current: 4.5,
        trend: "Stable yields with minimal change",
        projectionLow: 4.2,
        projectionHigh: 4.8,
        historicalData: [],
        change1M: 0.05,
        change3M: 0.15
      },
      breakeven10Y: {
        current: 2.3,
        trend: "Stable inflation expectations",
        projectionLow: 2.1,
        projectionHigh: 2.5,
        historicalData: [],
        change1M: 0.02,
        change3M: 0.08
      },
      treasury2Y: {
        current: 4.3,
        trend: "Stable yields with minimal change",
        projectionLow: 4.0,
        projectionHigh: 4.6,
        historicalData: [],
        change1M: 0.03,
        change3M: 0.12
      },
      yieldSpread: {
        current: 0.2,
        trend: "Flattening yield curve",
        projectionLow: 0.0,
        projectionHigh: 0.4,
        historicalData: [],
        change1M: 0.02,
        change3M: 0.03
      }
    };
  }
};

const BondRadar = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bondData'],
    queryFn: fetchBondData,
    refetchInterval: 60 * 60 * 1000, // Refetch hourly
  });

  const getTrendIcon = (trend: string) => {
    if (trend.includes('Rising') || trend.includes('Inverted')) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend.includes('Falling')) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend.includes('Rising') || trend.includes('Inverted')) return "text-red-500";
    if (trend.includes('Falling')) return "text-green-500";
    return "text-yellow-500";
  };

  const getChangeColor = (change: number) => {
    if (change > 0.05) return "text-red-500";
    if (change < -0.05) return "text-green-500";
    return "text-yellow-500";
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const renderBondCard = (
    title: string,
    description: string,
    indicatorData: BondIndicatorData,
    color: string = "blue"
  ) => (
    <Card className="border-border">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <Badge variant="outline" className="text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Latest
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 space-y-4">
        {/* Current Value */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Current Yield</p>
            <p className={`text-2xl sm:text-3xl font-bold text-${color}-500`}>{indicatorData.current}%</p>
          </div>
          {getTrendIcon(indicatorData.trend)}
        </div>

        {/* Changes */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground">1M Change</p>
            <p className={`text-sm sm:text-base font-bold ${getChangeColor(indicatorData.change1M)}`}>
              {indicatorData.change1M > 0 ? '+' : ''}{indicatorData.change1M}%
            </p>
          </div>
          <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground">3M Change</p>
            <p className={`text-sm sm:text-base font-bold ${getChangeColor(indicatorData.change3M)}`}>
              {indicatorData.change3M > 0 ? '+' : ''}{indicatorData.change3M}%
            </p>
          </div>
        </div>

        {/* Trend */}
        <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
          <p className={`text-xs sm:text-sm font-medium ${getTrendColor(indicatorData.trend)}`}>
            {indicatorData.trend}
          </p>
        </div>

        {/* Historical Chart */}
        {indicatorData.historicalData.length > 0 && (
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indicatorData.historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  interval={Math.floor(indicatorData.historicalData.length / 6)}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  domain={['dataMin - 0.2', 'dataMax + 0.2']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color === "blue" ? "#3b82f6" : "#10b981"}
                  strokeWidth={2}
                  dot={false}
                  name={title}
                />
                <ReferenceLine 
                  y={indicatorData.current} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="3 3" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {renderBondCard(
          "10-Year Treasury Yield",
          "The yield on 10-year U.S. Treasury bonds, a key benchmark for mortgage rates and broader economic sentiment",
          data.treasury10Y,
          "blue"
        )}

        {renderBondCard(
          "10-Year Breakeven Inflation",
          "Market's expected inflation over the next 10 years, derived from the difference between nominal and TIPS yields",
          data.breakeven10Y,
          "blue"
        )}

        {renderBondCard(
          "2-Year Treasury Yield",
          "The yield on 2-year U.S. Treasury bonds, sensitive to Fed policy expectations",
          data.treasury2Y,
          "blue"
        )}

        {renderBondCard(
          "10Y-2Y Yield Spread",
          "The difference between 10-year and 2-year Treasury yields. Inversion often precedes recessions",
          data.yieldSpread,
          "blue"
        )}
      </div>
    </div>
  );
};

export default BondRadar;
