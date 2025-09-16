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
    if (name === 'price') return [value.toFixed(4), 'Price'];
    if (name === 'netPosition') return [value.toLocaleString(), 'Net Position'];
    return [value.toLocaleString(), name];
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          📈 {currency}/USD Positioning vs Price
        </CardTitle>
        <CardDescription>
          Track institutional positioning changes against price movements over time
        </CardDescription>
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
        
        <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span className="text-muted-foreground">Net Position (Left Axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-destructive border-dashed"></div>
            <span className="text-muted-foreground">Price (Right Axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default COTChart;