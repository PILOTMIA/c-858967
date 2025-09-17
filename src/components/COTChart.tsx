import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface COTChartProps {
  data: Array<{
    date: string;
    netPosition: number;
    price: number;
    longPositions: number;
    shortPositions: number;
  }>;
  currency: string;
}

const COTChart = ({ data, currency }: COTChartProps) => {
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'price') return [value.toFixed(4), `${currency}/USD Price`];
    if (name === 'netPosition') return [value.toLocaleString(), `USD Net Position vs ${currency}`];
    return [value.toLocaleString(), name];
  };

  // Calculate net position changes and trends
  const currentNetPosition = data[data.length - 1]?.netPosition || 0;
  const previousNetPosition = data[data.length - 2]?.netPosition || 0;
  const netChange = currentNetPosition - previousNetPosition;
  const isPositive = netChange > 0;

  return (
    <Card className="bg-card border-border shadow-elegant">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2 font-display">
          📈 USD Position vs {currency} - Institutional Analysis
        </CardTitle>
        <CardDescription className="font-medium">
          Track how institutional money (hedge funds & asset managers) position USD vs {currency} over time
        </CardDescription>
        
        {/* Real-time Net Change Indicator */}
        <div className="flex items-center gap-4 mt-2 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg border border-muted/30">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPositive ? 'bg-success' : 'bg-destructive'} animate-pulse`}></div>
            <span className="font-bold text-sm">Net Change:</span>
            <span className={`font-mono font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{netChange.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {currentNetPosition > 0 
              ? `🟢 Institutions are NET LONG USD vs ${currency} (USD Bullish)` 
              : `🔴 Institutions are NET SHORT USD vs ${currency} (${currency} Bullish)`
            }
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(4)}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
              
              {/* Net Position Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="netPosition"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                name="netPosition"
              />
              
              {/* Price Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name="price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Legend with Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-1 bg-primary rounded"></div>
              <span className="font-bold text-primary">USD Net Position (Left Axis)</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              When line is <strong className="text-success">above zero</strong> = Institutions prefer USD over {currency}<br/>
              When line is <strong className="text-destructive">below zero</strong> = Institutions prefer {currency} over USD
            </p>
          </div>
          
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-1 bg-destructive border-dashed border border-destructive"></div>
              <span className="font-bold text-destructive">{currency}/USD Price (Right Axis)</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              <strong className="text-primary">Rising price</strong> = {currency} strengthening vs USD<br/>
              <strong className="text-warning">Falling price</strong> = USD strengthening vs {currency}
            </p>
          </div>
        </div>

        {/* Trading Signal Box */}
        <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
          <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
            🎯 Current Trading Signal
          </h4>
          <p className="text-sm font-medium text-foreground">
            {currentNetPosition > 5000 && isPositive 
              ? `Strong BUY USD/${currency} - Institutional money is heavily long USD with increasing positions`
              : currentNetPosition < -5000 && !isPositive
              ? `Strong BUY ${currency}/USD - Institutional money is heavily short USD with decreasing positions`  
              : currentNetPosition > 0
              ? `Moderate USD strength vs ${currency} - Institutions slightly favor USD`
              : `Moderate ${currency} strength vs USD - Institutions slightly favor ${currency}`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default COTChart;