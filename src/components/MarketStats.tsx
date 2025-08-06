
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
  // Simulate real-time market data with slight variations
  const baseUsd = 103.45;
  const baseEur = 1.0542;
  const variation = (Math.random() - 0.5) * 0.02; // Small random variation
  
  const usdPrice = baseUsd + variation;
  const eurPrice = baseEur + (variation * 0.001);
  
  // Calculate realistic daily changes
  const usdChange = (Math.random() - 0.5) * 0.8; // Up to ±0.8
  const eurChange = (Math.random() - 0.5) * 0.004; // Up to ±0.004
  
  return {
    usdIndex: {
      value: usdPrice,
      change: usdChange,
      changePercent: (usdChange / (usdPrice - usdChange)) * 100
    },
    volume: {
      value: '$6.8T',
      change: 2.1 + (Math.random() - 0.5) * 0.5 // Slight variation
    },
    eurUsd: {
      value: eurPrice,
      change: eurChange,
      changePercent: (eurChange / (eurPrice - eurChange)) * 100
    }
  };
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
