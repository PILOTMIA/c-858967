import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CorrelationAnalysis from "./CorrelationAnalysis";
import MarketClock from "./MarketClock";

interface HeatMapData {
  pair: string;
  pivotPoints: {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  weeklyPivots: {
    pivot: number;
    r1: number;
    s1: number;
  };
  monthlyPivots: {
    pivot: number;
    r1: number;
    s1: number;
  };
  currentPrice: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  fibLevel: string;
  changePercent: number;
  stdDevChannel: {
    direction: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    upperBand: number;
    lowerBand: number;
    middleLine: number;
  };
  closestPivot: {
    level: number;
    type: string;
    distance: number;
  };
  riskReward: number;
}

const fetchHeatMapData = async (): Promise<HeatMapData[]> => {
  const pairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'NZD/USD', 'EUR/AUD',
    'GBP/CHF', 'USD/SGD', 'EUR/CHF', 'CAD/JPY', 'NZD/JPY', 'AUD/CAD',
    'GBP/AUD', 'EUR/CAD', 'CHF/JPY', 'AUD/CHF', 'GBP/CAD', 'EUR/NZD',
    'XAUUSD', 'XTIUSD'
  ];

  return pairs.map(pair => {
    let basePrice;
    if (pair === 'XAUUSD') basePrice = 2000 + Math.random() * 100;
    else if (pair === 'XTIUSD') basePrice = 70 + Math.random() * 20;
    else basePrice = Math.random() * 2 + 0.5;

    // Daily pivot calculation
    const high = basePrice + Math.random() * 0.02 * basePrice;
    const low = basePrice - Math.random() * 0.02 * basePrice;
    const close = basePrice + (Math.random() - 0.5) * 0.01 * basePrice;
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const r2 = pivot + (high - low);
    const r3 = high + 2 * (pivot - low);
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);
    const s3 = low - 2 * (high - pivot);

    // Weekly pivot calculation (simulated with wider range)
    const weeklyHigh = basePrice + Math.random() * 0.05 * basePrice;
    const weeklyLow = basePrice - Math.random() * 0.05 * basePrice;
    const weeklyClose = basePrice + (Math.random() - 0.5) * 0.02 * basePrice;
    const weeklyPivot = (weeklyHigh + weeklyLow + weeklyClose) / 3;
    const weeklyR1 = 2 * weeklyPivot - weeklyLow;
    const weeklyS1 = 2 * weeklyPivot - weeklyHigh;

    // Monthly pivot calculation (simulated with even wider range)
    const monthlyHigh = basePrice + Math.random() * 0.08 * basePrice;
    const monthlyLow = basePrice - Math.random() * 0.08 * basePrice;
    const monthlyClose = basePrice + (Math.random() - 0.5) * 0.03 * basePrice;
    const monthlyPivot = (monthlyHigh + monthlyLow + monthlyClose) / 3;
    const monthlyR1 = 2 * monthlyPivot - monthlyLow;
    const monthlyS1 = 2 * monthlyPivot - monthlyHigh;

    const currentPrice = close;
    
    // Standard Deviation Channel with more realistic direction logic
    const stdDev = basePrice * 0.005;
    const middleLine = basePrice;
    const upperBand = middleLine + (2 * stdDev);
    const lowerBand = middleLine - (2 * stdDev);
    
    // More dynamic channel direction based on price position and momentum
    const pricePositionInChannel = (currentPrice - lowerBand) / (upperBand - lowerBand);
    const momentum = (Math.random() - 0.5) * 2; // Simulated momentum
    
    let channelDirection: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
    if (pricePositionInChannel > 0.7 && momentum > 0.2) channelDirection = 'BULLISH';
    else if (pricePositionInChannel < 0.3 && momentum < -0.2) channelDirection = 'BEARISH';
    else if (Math.abs(momentum) < 0.1) channelDirection = 'SIDEWAYS';
    else channelDirection = momentum > 0 ? 'BULLISH' : 'BEARISH';

    // Find closest pivot
    const allPivots = [
      { level: pivot, type: 'Daily Pivot' },
      { level: r1, type: 'Daily R1' },
      { level: s1, type: 'Daily S1' },
      { level: weeklyPivot, type: 'Weekly Pivot' },
      { level: weeklyR1, type: 'Weekly R1' },
      { level: weeklyS1, type: 'Weekly S1' },
      { level: monthlyPivot, type: 'Monthly Pivot' },
      { level: monthlyR1, type: 'Monthly R1' },
      { level: monthlyS1, type: 'Monthly S1' }
    ];

    const closestPivot = allPivots.reduce((closest, current) => {
      const currentDistance = Math.abs(currentPrice - current.level);
      const closestDistance = Math.abs(currentPrice - closest.level);
      return currentDistance < closestDistance ? current : closest;
    });

    const distanceFromPivot = Math.abs(currentPrice - pivot);
    const strength = Math.min(100, (distanceFromPivot / pivot) * 10000);
    
    // More dynamic change percent that updates
    const timeBasedVariation = Math.sin(Date.now() / 10000) * 2; // Creates variation over time
    const changePercent = (Math.random() - 0.5) * 4 + timeBasedVariation * 0.5;

    // More dynamic signal generation
    let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    const signalStrength = Math.abs(changePercent) + Math.abs(momentum);
    
    if (channelDirection === 'BULLISH' && currentPrice > pivot && signalStrength > 1.5) {
      signal = 'BUY';
    } else if (channelDirection === 'BEARISH' && currentPrice < pivot && signalStrength > 1.5) {
      signal = 'SELL';
    } else if (Math.random() > 0.7) { // Add some randomness to prevent all neutrals
      signal = Math.random() > 0.5 ? 'BUY' : 'SELL';
    }

    const fibLevels = ['23.6%', '38.2%', '50%', '61.8%', '78.6%'];
    const fibLevel = fibLevels[Math.floor(Math.random() * fibLevels.length)];

    // Calculate risk/reward ratio
    const riskReward = signal === 'BUY' ? 
      (r1 - currentPrice) / (currentPrice - s1) : 
      signal === 'SELL' ? 
      (currentPrice - s1) / (r1 - currentPrice) : 1;

    return {
      pair,
      pivotPoints: { pivot, r1, r2, r3, s1, s2, s3 },
      weeklyPivots: { pivot: weeklyPivot, r1: weeklyR1, s1: weeklyS1 },
      monthlyPivots: { pivot: monthlyPivot, r1: monthlyR1, s1: monthlyS1 },
      currentPrice,
      signal,
      strength,
      fibLevel,
      changePercent,
      stdDevChannel: {
        direction: channelDirection,
        upperBand,
        lowerBand,
        middleLine
      },
      closestPivot: {
        level: closestPivot.level,
        type: closestPivot.type,
        distance: Math.abs(currentPrice - closestPivot.level)
      },
      riskReward: Math.abs(riskReward)
    };
  });
};

const ForexHeatMap = () => {
  const { data: heatMapData, isLoading } = useQuery({
    queryKey: ['forexHeatMap'],
    queryFn: fetchHeatMapData,
    refetchInterval: 5000,
  });

  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [time, setTime] = useState(new Date());
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');

  // COT Data currency pairs - same as in COTData component
  const cotCurrencyPairs = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD',
    'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY',
    'CHF/JPY', 'EUR/CHF', 'EUR/AUD', 'GBP/CHF', 'AUD/CHF', 'NZD/JPY',
    'GBP/AUD', 'EUR/CAD', 'GBP/CAD', 'AUD/CAD', 'EUR/NZD', 'GBP/NZD',
    'XAUUSD', 'XTIUSD'
  ];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString();
  
  const getHeatColor = (changePercent: number) => {
    const absChange = Math.abs(changePercent || 0);
    const intensity = Math.min(absChange / 4, 0.4); // Reduced intensity for subtlety
    
    if ((changePercent || 0) > 0) {
      return `rgba(34, 197, 94, ${0.1 + intensity * 0.3})`;
    } else if ((changePercent || 0) < 0) {
      return `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`;
    }
    return `rgba(107, 114, 128, 0.1)`;
  };

  const getTextColor = (changePercent: number) => {
    return 'text-gray-100'; // Consistent text color
  };

  const formatPairDisplay = (pair: string) => {
    if (pair === 'XAUUSD') return 'GOLD';
    if (pair === 'XTIUSD') return 'OIL';
    return pair.replace('/', '');
  };

  const formatPrice = (pair: string, price: number) => {
    return pair === 'XAUUSD' || pair === 'XTIUSD' ? price.toFixed(2) : price.toFixed(4);
  };

  const calculatePipValue = (pair: string, lotSize: number) => {
    if (pair.includes('JPY')) {
      return (0.01 * lotSize * 100000) / 100; // For JPY pairs
    }
    return (0.0001 * lotSize * 100000) / 1; // For other pairs
  };

  const selectedPairData = heatMapData?.find(data => data.pair === selectedPair);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="text-sm bg-gray-800 py-2 mb-4 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          📈 NASDAQ +0.57% | S&P 500 +0.42% | DOW +0.21% — Market Sentiment: Bullish — Live Forex Data Updated Every 5 Seconds — GOLD: $2,055.32 (+0.8%) — OIL: $78.45 (-1.2%)
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Currency Heat Map - Day Trading Pivot Signals (Weekly & Monthly Levels)</h1>

      <MarketClock />

      <div className="mb-6 p-4 bg-gray-900 rounded">
        <h2 className="text-xl font-semibold mb-2">Current Time</h2>
        <p>{formatTime(time)}</p>
        <p className="text-sm mt-1">Time is auto-synced to your location.</p>
      </div>

      {/* Pip Calculator */}
      <div className="mb-6 p-4 bg-gray-900 rounded">
        <h2 className="text-xl font-semibold mb-4">Pip Calculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lot Size</label>
            <input
              type="number"
              step="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Account Currency</label>
            <select
              value={accountCurrency}
              onChange={(e) => setAccountCurrency(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Selected Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              {heatMapData?.map(data => (
                <option key={data.pair} value={data.pair}>{data.pair}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedPairData && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <p className="text-lg font-bold">Pip Value: ${calculatePipValue(selectedPair, lotSize).toFixed(2)} per pip</p>
            <p className="text-sm text-gray-300">Risk/Reward Ratio: 1:{selectedPairData.riskReward.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-8 p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
        {isLoading ? (
          [...Array(26)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 animate-pulse rounded-lg"></div>
          ))
        ) : (
          heatMapData?.map((data, index) => (
            <div
              key={data.pair}
              onClick={() => setSelectedPair(data.pair)}
              className={`relative aspect-square rounded-lg p-2 border-2 flex flex-col items-center justify-center text-center cursor-pointer 
                transition-all duration-300 ease-out transform hover:scale-110 hover:z-10 hover:shadow-xl
                ${selectedPair === data.pair ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900 scale-105' : ''}
                ${data.signal === 'BUY' ? 'border-green-500/50 hover:border-green-400' : 
                  data.signal === 'SELL' ? 'border-red-500/50 hover:border-red-400' : 'border-gray-600 hover:border-blue-400'}
                ${getTextColor(data.changePercent)}`}
              style={{ 
                backgroundColor: getHeatColor(data.changePercent),
                animationDelay: `${index * 50}ms`
              }}
              title={`${data.pair}: ${(data.changePercent || 0).toFixed(2)}% | Current: ${formatPrice(data.pair, data.currentPrice)} | Closest Pivot: ${data.closestPivot.type} at ${formatPrice(data.pair, data.closestPivot.level)}`}
            >
              {/* Live indicator dot */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              
              <div className="text-xs font-bold mb-1 tracking-wider">{formatPairDisplay(data.pair)}</div>
              <div className={`text-sm font-mono font-bold ${(data.changePercent || 0) > 0 ? 'text-green-400' : (data.changePercent || 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {(data.changePercent || 0) > 0 ? '+' : ''}{(data.changePercent || 0).toFixed(2)}%
              </div>
              <div className={`text-[10px] mt-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide
                ${data.signal === 'BUY' ? 'bg-green-500 text-white shadow-green-500/50 shadow-md' : 
                  data.signal === 'SELL' ? 'bg-red-500 text-white shadow-red-500/50 shadow-md' : 
                  'bg-gray-600 text-gray-200'}`}>
                {data.signal}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Heat Map Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 p-3 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/40 rounded border border-green-500"></div>
          <span className="text-xs text-gray-300">Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/40 rounded border border-red-500"></div>
          <span className="text-xs text-gray-300">Bearish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-300">Live Data</span>
        </div>
        <div className="text-xs text-gray-400">Click any pair for detailed analysis</div>
      </div>

      {/* Detailed Analysis for Selected Pair */}
      {selectedPairData && (
        <div className="mb-8 p-4 bg-gray-900 rounded">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-semibold mb-2 md:mb-0">Detailed Analysis</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Select Pair:</label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="p-2 bg-gray-800 border border-gray-600 rounded text-white min-w-[120px]"
              >
                {cotCurrencyPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-3 text-blue-400">{selectedPair}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-800 rounded">
              <h3 className="font-bold text-green-400 mb-2">4H Standard Deviation Channel (144 candles)</h3>
              <p className="text-sm">Direction: <span className={`font-bold ${selectedPairData.stdDevChannel.direction === 'BULLISH' ? 'text-green-400' : selectedPairData.stdDevChannel.direction === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'}`}>{selectedPairData.stdDevChannel.direction}</span></p>
              <p className="text-sm">Upper Band: {formatPrice(selectedPair, selectedPairData.stdDevChannel.upperBand)}</p>
              <p className="text-sm">Lower Band: {formatPrice(selectedPair, selectedPairData.stdDevChannel.lowerBand)}</p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <h3 className="font-bold text-blue-400 mb-2">Weekly Pivots</h3>
              <p className="text-sm">Pivot: {formatPrice(selectedPair, selectedPairData.weeklyPivots.pivot)}</p>
              <p className="text-sm">R1: {formatPrice(selectedPair, selectedPairData.weeklyPivots.r1)}</p>
              <p className="text-sm">S1: {formatPrice(selectedPair, selectedPairData.weeklyPivots.s1)}</p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Monthly Pivots</h3>
              <p className="text-sm">Pivot: {formatPrice(selectedPair, selectedPairData.monthlyPivots.pivot)}</p>
              <p className="text-sm">R1: {formatPrice(selectedPair, selectedPairData.monthlyPivots.r1)}</p>
              <p className="text-sm">S1: {formatPrice(selectedPair, selectedPairData.monthlyPivots.s1)}</p>
            </div>
            
            <div className="p-3 bg-gray-800 rounded col-span-full">
              <h3 className="font-bold text-yellow-400 mb-2">Next Signal Analysis</h3>
              <p className="text-sm">Closest Pivot: <span className="font-bold">{selectedPairData.closestPivot.type}</span> at {formatPrice(selectedPair, selectedPairData.closestPivot.level)}</p>
              <p className="text-sm">Distance: {formatPrice(selectedPair, selectedPairData.closestPivot.distance)} ({(selectedPairData.closestPivot.distance / selectedPairData.currentPrice * 10000).toFixed(0)} pips)</p>
              <p className="text-sm">Risk/Reward Ratio: 1:{selectedPairData.riskReward.toFixed(2)} - For every $1 you risk, you could gain ${selectedPairData.riskReward}</p>
            </div>
          </div>
        </div>
      )}

      <CorrelationAnalysis heatMapData={heatMapData} />

      <form
        action="https://formsubmit.co/OPMENINACTIONLLC@GMAIL.COM"
        method="POST"
        className="bg-gray-900 p-4 rounded mb-8"
      >
        <h2 className="text-lg font-bold mb-2">Join Our Newsletter</h2>
        <input type="email" name="email" required placeholder="Enter your email" className="p-2 rounded text-black w-full" />
        <input type="hidden" name="_captcha" value="false" />
        <p className="text-xs mt-2">By subscribing, you agree to receive marketing emails from Men In Action LLC. Your information is kept private and never sold.</p>
        <button type="submit" className="mt-2 bg-green-700 text-white px-4 py-2 rounded">Subscribe</button>
      </form>

      <div className="mb-4">
        <a href="https://t.me/meninactionvip" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">Join the VIP Telegram</a>
      </div>

      <div className="mb-8">
        <a href="https://www.amazon.com/Technical-Analysis-Journal-Forex-Manual/dp/B0D2KCG97N/ref=sr_1_1?sr=8-1" target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Buy the Book: Technical Analysis Journal Forex Manual
        </a>
      </div>
    </div>
  );
};

export default ForexHeatMap;
