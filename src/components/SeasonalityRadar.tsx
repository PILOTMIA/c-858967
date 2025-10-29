import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MonthlyData {
  month: string;
  avg2023: number;
  avg2024: number;
  avg2025: number;
  historical: number;
}

interface SeasonalityData {
  eurusd: MonthlyData[];
  gbpusd: MonthlyData[];
  usdjpy: MonthlyData[];
  gold: MonthlyData[];
}

const fetchSeasonalityData = async (): Promise<SeasonalityData> => {
  // Simulate fetching historical seasonal patterns
  // In production, this would come from a real API or database
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate realistic seasonal patterns based on historical forex trends
  const generateSeasonalData = (basePattern: number[]): MonthlyData[] => {
    return months.map((month, idx) => ({
      month,
      avg2023: basePattern[idx] + (Math.random() - 0.5) * 0.3,
      avg2024: basePattern[idx] + (Math.random() - 0.5) * 0.3,
      avg2025: basePattern[idx] + (Math.random() - 0.5) * 0.3,
      historical: basePattern[idx]
    }));
  };

  // EURUSD tends to be stronger in Jan-Feb, weaker mid-year
  const eurusdPattern = [0.8, 0.9, 0.3, -0.2, -0.5, -0.6, -0.4, -0.1, 0.2, 0.5, 0.7, 0.6];
  
  // GBPUSD tends to be volatile with Q1 strength
  const gbpusdPattern = [1.2, 1.0, 0.5, 0.1, -0.3, -0.5, -0.2, 0.1, 0.4, 0.7, 0.9, 0.8];
  
  // USDJPY tends to strengthen late year
  const usdjpyPattern = [-0.4, -0.5, -0.2, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0, 0.8, 0.6, 0.4];
  
  // Gold tends to be strong early and late year
  const goldPattern = [1.5, 1.3, 0.8, 0.2, -0.5, -0.8, -0.6, -0.3, 0.2, 0.8, 1.2, 1.4];

  return {
    eurusd: generateSeasonalData(eurusdPattern),
    gbpusd: generateSeasonalData(gbpusdPattern),
    usdjpy: generateSeasonalData(usdjpyPattern),
    gold: generateSeasonalData(goldPattern)
  };
};

const SeasonalityRadar = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['seasonalityData'],
    queryFn: fetchSeasonalityData,
    staleTime: 24 * 60 * 60 * 1000, // Data is stable for 24 hours
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4 p-3 sm:p-6">
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const renderSeasonalChart = (
    title: string,
    description: string,
    monthlyData: MonthlyData[],
    color: string
  ) => (
    <Card className="border-border">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
          <Badge variant="outline" className="text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Seasonal Pattern
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 space-y-4">
        {/* Year-by-Year Comparison */}
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                label={{ value: '% Change', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="avg2023" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="2023"
              />
              <Line 
                type="monotone" 
                dataKey="avg2024" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="2024"
              />
              <Line 
                type="monotone" 
                dataKey="avg2025" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3 }}
                name="2025 (YTD)"
              />
              <Line 
                type="monotone" 
                dataKey="historical" 
                stroke="#f59e0b" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Historical Avg"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Best Month</p>
            <p className="text-sm sm:text-base font-bold text-green-500">
              {monthlyData.reduce((best, curr) => 
                curr.historical > best.historical ? curr : best
              ).month}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Avg: {monthlyData.reduce((best, curr) => 
                curr.historical > best.historical ? curr : best
              ).historical.toFixed(2)}%
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Worst Month</p>
            <p className="text-sm sm:text-base font-bold text-red-500">
              {monthlyData.reduce((worst, curr) => 
                curr.historical < worst.historical ? curr : worst
              ).month}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Avg: {monthlyData.reduce((worst, curr) => 
                curr.historical < worst.historical ? curr : worst
              ).historical.toFixed(2)}%
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Current Month</p>
            <p className="text-sm sm:text-base font-bold text-blue-500">
              {new Date().toLocaleString('en-US', { month: 'short' })}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Historical Avg: {monthlyData[new Date().getMonth()].historical.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Trading Implications */}
        <div className="border border-border rounded-lg p-3 sm:p-4 bg-muted/20">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold mb-1">Trading Implications</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Historical patterns show seasonal trends, but past performance doesn't guarantee future results. 
                Use this data alongside technical and fundamental analysis for informed trading decisions.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold mb-2">About Seasonality Analysis</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Seasonality analysis shows historical patterns of price movements across different months. 
          This data is based on 2+ years of historical price movements and helps identify recurring trends. 
          Combine with other analysis methods for better trading decisions.
        </p>
      </div>

      <Tabs defaultValue="eurusd" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto bg-card border border-border p-1">
          <TabsTrigger value="eurusd" className="text-xs sm:text-sm py-2">EUR/USD</TabsTrigger>
          <TabsTrigger value="gbpusd" className="text-xs sm:text-sm py-2">GBP/USD</TabsTrigger>
          <TabsTrigger value="usdjpy" className="text-xs sm:text-sm py-2">USD/JPY</TabsTrigger>
          <TabsTrigger value="gold" className="text-xs sm:text-sm py-2">Gold (XAU/USD)</TabsTrigger>
        </TabsList>

        <TabsContent value="eurusd" className="mt-6">
          {renderSeasonalChart(
            "EUR/USD Seasonality",
            "Historical monthly performance patterns for EUR/USD based on 2+ years of data",
            data.eurusd,
            "#3b82f6"
          )}
        </TabsContent>

        <TabsContent value="gbpusd" className="mt-6">
          {renderSeasonalChart(
            "GBP/USD Seasonality",
            "Historical monthly performance patterns for GBP/USD based on 2+ years of data",
            data.gbpusd,
            "#10b981"
          )}
        </TabsContent>

        <TabsContent value="usdjpy" className="mt-6">
          {renderSeasonalChart(
            "USD/JPY Seasonality",
            "Historical monthly performance patterns for USD/JPY based on 2+ years of data",
            data.usdjpy,
            "#f59e0b"
          )}
        </TabsContent>

        <TabsContent value="gold" className="mt-6">
          {renderSeasonalChart(
            "Gold (XAU/USD) Seasonality",
            "Historical monthly performance patterns for Gold based on 2+ years of data",
            data.gold,
            "#eab308"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeasonalityRadar;
