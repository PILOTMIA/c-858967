
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface ForexPerformanceProps {
  selectedPair?: string;
}

const fetchCurrencyHistorical = async (pair: string = 'EURUSD') => {
  // Mock historical data for the selected currency pair
  const mockData = [];
  const baseRates: { [key: string]: number } = {
    'EURUSD': 1.0542,
    'GBPUSD': 1.2745,
    'USDJPY': 149.85,
    'USDCHF': 0.8745,
    'AUDUSD': 0.6542,
    'USDCAD': 1.3654,
    'EURGBP': 0.8567,
    'EURJPY': 158.45,
    'GBPJPY': 189.75,
    'AUDJPY': 98.15,
    'XAUUSD': 2055.32, // Gold price
    'XTIUSD': 78.45,   // Oil price
  };
  
  const baseRate = baseRates[pair] || 1.0542;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 0.02; // Small random variation
    mockData.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: parseFloat((baseRate + variation * baseRate).toFixed(pair === 'XAUUSD' || pair === 'XTIUSD' ? 2 : 4))
    });
  }
  
  return mockData;
};

const ForexPerformance = ({ selectedPair = 'EURUSD' }: ForexPerformanceProps) => {
  const { data: rateData, isLoading } = useQuery({
    queryKey: ['currencyHistorical', selectedPair],
    queryFn: () => fetchCurrencyHistorical(selectedPair),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const formatPairDisplay = (pair: string) => {
    if (pair === 'XAUUSD') return 'GOLD';
    if (pair === 'XTIUSD') return 'WTI CRUDE';
    return pair.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
  };

  const formatPrice = (value: any) => {
    if (selectedPair === 'XAUUSD' || selectedPair === 'XTIUSD') {
      return `$${typeof value === 'number' ? value.toFixed(2) : value}`;
    }
    return typeof value === 'number' ? value.toFixed(4) : value;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">{formatPairDisplay(selectedPair)} Performance</h2>
        <div className="w-full h-[200px] flex items-center justify-center">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">{formatPairDisplay(selectedPair)} Performance</h2>
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rateData}>
            <XAxis 
              dataKey="date" 
              stroke="#E6E4DD"
              fontSize={12}
            />
            <YAxis 
              stroke="#E6E4DD"
              fontSize={12}
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => formatPrice(value)}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#3A3935',
                border: '1px solid #605F5B',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#E6E4DD' }}
              itemStyle={{ color: '#8989DE' }}
              formatter={(value) => [formatPrice(value), 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#8989DE" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForexPerformance;
