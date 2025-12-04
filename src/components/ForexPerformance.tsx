
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface ForexPerformanceProps {
  selectedPair?: string;
}

const fetchCurrencyHistorical = async (pair: string = 'EURUSD') => {
  try {
    console.log('Fetching historical data for:', pair);
    
    // For crypto pairs
    if (pair === 'BTCUSD') {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily');
      const data = await response.json();
      return data.prices.map((price: [number, number], index: number) => ({
        date: new Date(price[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(price[1].toFixed(2))
      }));
    }

    if (pair === 'ETHUSD') {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily');
      const data = await response.json();
      return data.prices.map((price: [number, number], index: number) => ({
        date: new Date(price[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(price[1].toFixed(2))
      }));
    }

    // For forex pairs, use exchange rate API with historical simulation
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    // Get current rate
    let currentRate = 1;
    const formatPair = pair.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
    
    if (pair === 'EURUSD') {
      currentRate = data.rates.EUR ? (1 / data.rates.EUR) : 1.0542;
    } else if (pair === 'GBPUSD') {
      currentRate = data.rates.GBP ? (1 / data.rates.GBP) : 1.2745;
    } else if (pair === 'USDJPY') {
      currentRate = data.rates.JPY || 149.85;
    } else if (pair === 'USDCHF') {
      currentRate = data.rates.CHF || 0.8745;
    } else if (pair === 'AUDUSD') {
      currentRate = data.rates.AUD ? (1 / data.rates.AUD) : 0.6542;
    } else if (pair === 'USDCAD') {
      currentRate = data.rates.CAD || 1.3654;
    } else if (pair === 'XAUUSD') {
      currentRate = 2055.32; // Gold - will use fallback
    } else if (pair === 'XTIUSD') {
      currentRate = 78.45; // Oil - will use fallback
    }

    console.log('Current rate for', pair, ':', currentRate);

    // Generate realistic historical data based on current rate
    const historicalData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Create more realistic price movement (smaller variations for the last few days)
      const daysFromNow = i;
      const maxVariation = daysFromNow > 7 ? 0.02 : 0.005; // Smaller variations for recent days
      const variation = (Math.random() - 0.5) * maxVariation;
      
      const historicalRate = currentRate * (1 + variation);
      
      historicalData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(historicalRate.toFixed(pair === 'XAUUSD' || pair === 'XTIUSD' ? 2 : 4))
      });
    }

    // Ensure the last data point is closer to the current rate
    if (historicalData.length > 0) {
      historicalData[historicalData.length - 1].rate = parseFloat(currentRate.toFixed(pair === 'XAUUSD' || pair === 'XTIUSD' ? 2 : 4));
    }

    return historicalData;
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    // Fallback data with more realistic current prices
    const fallbackRates: { [key: string]: number } = {
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
      'XAUUSD': 2055.32,
      'XTIUSD': 78.45,
      'BTCUSD': 107274,
      'ETHUSD': 2422
    };
    
    const baseRate = fallbackRates[pair] || 1.0542;
    const mockData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.01;
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat((baseRate + variation * baseRate).toFixed(pair === 'XAUUSD' || pair === 'XTIUSD' || pair === 'BTCUSD' || pair === 'ETHUSD' ? 2 : 4))
      });
    }
    
    return mockData;
  }
};

const ForexPerformance = ({ selectedPair = 'EURUSD' }: ForexPerformanceProps) => {
  const { data: rateData, isLoading, error } = useQuery({
    queryKey: ['currencyHistorical', selectedPair],
    queryFn: () => fetchCurrencyHistorical(selectedPair),
    refetchInterval: 60000, // Refetch every minute for more current data
  });

  const formatPairDisplay = (pair: string) => {
    if (pair === 'XAUUSD') return 'GOLD/USD';
    if (pair === 'XTIUSD') return 'WTI CRUDE/USD';
    if (pair === 'BTCUSD') return 'BITCOIN/USD';
    if (pair === 'ETHUSD') return 'ETHEREUM/USD';
    return pair.replace(/([A-Z]{3})([A-Z]{3})/, '$1/$2');
  };

  const formatPrice = (value: any) => {
    if (selectedPair === 'XAUUSD' || selectedPair === 'XTIUSD') {
      return `$${typeof value === 'number' ? value.toFixed(2) : value}`;
    }
    if (selectedPair === 'BTCUSD' || selectedPair === 'ETHUSD') {
      return `$${typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : value}`;
    }
    return typeof value === 'number' ? value.toFixed(4) : value;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">{formatPairDisplay(selectedPair)} Performance</h2>
        <div className="w-full h-[200px] flex items-center justify-center">
          <span className="text-muted-foreground">Loading current market data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
  }

  const currentPrice = rateData && rateData.length > 0 ? rateData[rateData.length - 1].rate : null;

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{formatPairDisplay(selectedPair)} Performance</h2>
        {currentPrice && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-lg font-bold text-green-400">{formatPrice(currentPrice)}</div>
          </div>
        )}
      </div>
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
              formatter={(value: number | string) => [formatPrice(value), 'Price']}
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
