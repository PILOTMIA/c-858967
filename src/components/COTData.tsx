
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";

interface COTDataType {
  currency: string;
  commercialLong: number;
  commercialShort: number;
  nonCommercialLong: number;
  nonCommercialShort: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  recommendation: string;
}

const fetchCOTData = async (currency: string): Promise<COTDataType> => {
  // Mock COT data - in real implementation, this would fetch from CFTC API
  const mockData: Record<string, COTDataType> = {
    EUR: {
      currency: 'EUR',
      commercialLong: 125000,
      commercialShort: 98000,
      nonCommercialLong: 89000,
      nonCommercialShort: 112000,
      sentiment: 'BULLISH',
      recommendation: 'Commercial traders are net long EUR, suggesting institutional bullish bias against USD'
    },
    GBP: {
      currency: 'GBP',
      commercialLong: 87000,
      commercialShort: 145000,
      nonCommercialLong: 134000,
      nonCommercialShort: 76000,
      sentiment: 'BEARISH',
      recommendation: 'Commercial traders are net short GBP, suggesting institutional bearish bias against USD'
    },
    JPY: {
      currency: 'JPY',
      commercialLong: 156000,
      commercialShort: 89000,
      nonCommercialLong: 67000,
      nonCommercialShort: 134000,
      sentiment: 'BULLISH',
      recommendation: 'Commercial traders are heavily net long JPY, suggesting strong bullish sentiment against USD'
    },
    CHF: {
      currency: 'CHF',
      commercialLong: 78000,
      commercialShort: 92000,
      nonCommercialLong: 45000,
      nonCommercialShort: 67000,
      sentiment: 'NEUTRAL',
      recommendation: 'Mixed signals from commercial traders, neutral stance recommended'
    },
    AUD: {
      currency: 'AUD',
      commercialLong: 92000,
      commercialShort: 134000,
      nonCommercialLong: 123000,
      nonCommercialShort: 81000,
      sentiment: 'BEARISH',
      recommendation: 'Commercial traders are net short AUD, bearish bias against USD expected'
    },
    CAD: {
      currency: 'CAD',
      commercialLong: 112000,
      commercialShort: 87000,
      nonCommercialLong: 78000,
      nonCommercialShort: 103000,
      sentiment: 'BULLISH',
      recommendation: 'Commercial traders show bullish bias for CAD against USD'
    }
  };
  
  return mockData[currency] || mockData.EUR;
};

const COTData = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  
  const { data: cotData, isLoading } = useQuery({
    queryKey: ['cotData', selectedCurrency],
    queryFn: () => fetchCOTData(selectedCurrency),
    refetchInterval: 3600000, // Refetch every hour
  });

  const currencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD'];

  const getNetPosition = (long: number, short: number) => {
    return long - short;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'text-green-500';
      case 'BEARISH':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'BEARISH':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">COT Data Analysis</h2>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map(currency => (
              <SelectItem key={currency} value={currency}>
                {currency}/USD
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Commercial Traders (Smart Money)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Long Positions:</span>
                  <span className="font-bold text-green-600">
                    {cotData?.commercialLong.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Short Positions:</span>
                  <span className="font-bold text-red-600">
                    {cotData?.commercialShort.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Net Position:</span>
                  <span className={`font-bold ${
                    getNetPosition(cotData?.commercialLong || 0, cotData?.commercialShort || 0) > 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getNetPosition(cotData?.commercialLong || 0, cotData?.commercialShort || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Non-Commercial Traders (Speculators)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Long Positions:</span>
                  <span className="font-bold text-green-600">
                    {cotData?.nonCommercialLong.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Short Positions:</span>
                  <span className="font-bold text-red-600">
                    {cotData?.nonCommercialShort.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Net Position:</span>
                  <span className={`font-bold ${
                    getNetPosition(cotData?.nonCommercialLong || 0, cotData?.nonCommercialShort || 0) > 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getNetPosition(cotData?.nonCommercialLong || 0, cotData?.nonCommercialShort || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Market Sentiment:</h3>
              {getSentimentIcon(cotData?.sentiment || '')}
              <span className={`font-bold ${getSentimentColor(cotData?.sentiment || '')}`}>
                {cotData?.sentiment}
              </span>
            </div>
            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              {cotData?.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default COTData;
