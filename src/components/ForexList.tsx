
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fetchForexData = async () => {
  // Using a free forex API (exchangerate-api.com)
  const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  
  // Major USD pairs
  const majorPairs = [
    { pair: 'EUR/USD', rate: 1 / data.rates.EUR, base: 'EUR', quote: 'USD' },
    { pair: 'GBP/USD', rate: 1 / data.rates.GBP, base: 'GBP', quote: 'USD' },
    { pair: 'USD/JPY', rate: data.rates.JPY, base: 'USD', quote: 'JPY' },
    { pair: 'USD/CHF', rate: data.rates.CHF, base: 'USD', quote: 'CHF' },
    { pair: 'AUD/USD', rate: 1 / data.rates.AUD, base: 'AUD', quote: 'USD' },
    { pair: 'USD/CAD', rate: data.rates.CAD, base: 'USD', quote: 'CAD' },
    { pair: 'NZD/USD', rate: 1 / data.rates.NZD, base: 'NZD', quote: 'USD' }
  ];

  // Add some mock change data since the free API doesn't provide historical data
  return majorPairs.map(pair => ({
    ...pair,
    change: (Math.random() - 0.5) * 2, // Random change between -1 and 1
    changePercent: ((Math.random() - 0.5) * 0.02), // Random percentage change
    volume: Math.random() * 100 + 50 // Mock volume
  }));
};

const ForexList = () => {
  const { data: forexPairs, isLoading } = useQuery({
    queryKey: ['forex'],
    queryFn: fetchForexData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="glass-card rounded-lg p-6 animate-pulse">Loading...</div>;
  }

  return (
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Major Forex Pairs</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Pair</th>
              <th className="pb-4">Rate</th>
              <th className="pb-4">Change</th>
              <th className="pb-4">Volume</th>
            </tr>
          </thead>
          <tbody>
            {forexPairs?.map((forex) => (
              <tr key={forex.pair} className="border-t border-secondary">
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
                      {forex.base}
                    </div>
                    <div>
                      <p className="font-medium">{forex.pair}</p>
                      <p className="text-sm text-muted-foreground">{forex.base}/{forex.quote}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">{forex.rate.toFixed(4)}</td>
                <td className="py-4">
                  <span
                    className={`flex items-center gap-1 ${
                      forex.changePercent >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {forex.changePercent >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(forex.changePercent * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="py-4">{forex.volume.toFixed(1)}B</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForexList;
