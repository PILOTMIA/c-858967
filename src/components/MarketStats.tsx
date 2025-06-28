
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MarketData {
  usdIndex: {
    value: number;
    change: number;
    changePercent: number;
  };
  volume: {
    value: string;
    change: number;
  };
  eurUsd: {
    value: number;
    change: number;
    changePercent: number;
  };
}

const fetchMarketData = async (): Promise<MarketData> => {
  try {
    // Using free Yahoo Finance API alternative
    const symbols = ['DX-Y.NYB', 'EURUSD=X']; // USD Index and EUR/USD
    const promises = symbols.map(symbol => 
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`)
        .then(res => res.json())
    );
    
    const results = await Promise.all(promises);
    
    const usdIndexData = results[0]?.chart?.result?.[0];
    const eurUsdData = results[1]?.chart?.result?.[0];
    
    const usdPrice = usdIndexData?.meta?.regularMarketPrice || 103.45;
    const usdPrevClose = usdIndexData?.meta?.previousClose || 103.13;
    const eurPrice = eurUsdData?.meta?.regularMarketPrice || 1.0542;
    const eurPrevClose = eurUsdData?.meta?.previousClose || 1.0558;
    
    return {
      usdIndex: {
        value: usdPrice,
        change: usdPrice - usdPrevClose,
        changePercent: ((usdPrice - usdPrevClose) / usdPrevClose) * 100
      },
      volume: {
        value: '$6.8T',
        change: 2.1
      },
      eurUsd: {
        value: eurPrice,
        change: eurPrice - eurPrevClose,
        changePercent: ((eurPrice - eurPrevClose) / eurPrevClose) * 100
      }
    };
  } catch (error) {
    console.log('Using fallback market data');
    return {
      usdIndex: { value: 103.45, change: 0.32, changePercent: 0.32 },
      volume: { value: '$6.8T', change: 2.1 },
      eurUsd: { value: 1.0542, change: -0.0016, changePercent: -0.15 }
    };
  }
};

const MarketStats = () => {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['marketStats'],
    queryFn: fetchMarketData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">USD Index</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{marketData?.usdIndex.value.toFixed(2)}</p>
        <span className={`text-sm flex items-center gap-1 ${
          marketData?.usdIndex.changePercent >= 0 ? 'text-success' : 'text-warning'
        }`}>
          {marketData?.usdIndex.changePercent >= 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {Math.abs(marketData?.usdIndex.changePercent || 0).toFixed(2)}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Daily Volume</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">{marketData?.volume.value}</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {marketData?.volume.change}%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">EUR/USD</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">{marketData?.eurUsd.value.toFixed(4)}</p>
        <span className={`text-sm flex items-center gap-1 ${
          marketData?.eurUsd.changePercent >= 0 ? 'text-success' : 'text-warning'
        }`}>
          {marketData?.eurUsd.changePercent >= 0 ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {Math.abs(marketData?.eurUsd.changePercent || 0).toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
