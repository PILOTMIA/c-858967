
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

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
  currentPrice: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  strength: number;
  fibLevel: string;
}

const fetchHeatMapData = async (): Promise<HeatMapData[]> => {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'];
  return pairs.map(pair => {
    const basePrice = Math.random() * 2 + 0.5;
    const high = basePrice + Math.random() * 0.02;
    const low = basePrice - Math.random() * 0.02;
    const close = basePrice + (Math.random() - 0.5) * 0.01;
    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const r2 = pivot + (high - low);
    const r3 = high + 2 * (pivot - low);
    const s1 = 2 * pivot - high;
    const s2 = pivot - (high - low);
    const s3 = low - 2 * (high - pivot);
    const currentPrice = close;
    const distanceFromPivot = Math.abs(currentPrice - pivot);
    const strength = Math.min(100, (distanceFromPivot / pivot) * 10000);
    let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
    if (currentPrice > pivot) signal = 'BUY';
    if (currentPrice < pivot) signal = 'SELL';
    const fibLevels = ['23.6%', '38.2%', '50%', '61.8%', '78.6%'];
    const fibLevel = fibLevels[Math.floor(Math.random() * fibLevels.length)];
    return {
      pair,
      pivotPoints: { pivot, r1, r2, r3, s1, s2, s3 },
      currentPrice,
      signal,
      strength,
      fibLevel
    };
  });
};

const ForexHeatMap = () => {
  const { data: heatMapData, isLoading } = useQuery({
    queryKey: ['forexHeatMap'],
    queryFn: fetchHeatMapData,
    refetchInterval: 30000,
  });

  const getHeatColor = (strength: number, signal: string) => {
    const intensity = Math.min(strength / 100, 1);
    if (signal === 'BUY') return `rgba(34, 197, 94, ${intensity})`;
    if (signal === 'SELL') return `rgba(239, 68, 68, ${intensity})`;
    return `rgba(156, 163, 175, 0.3)`;
  };

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Currency Heat Map - Pivot Point Signals</h1>

      <div className="mb-6 p-4 bg-white bg-opacity-10 rounded">
        <h2 className="text-xl font-semibold mb-2">Current Time</h2>
        <p>{formatTime(time)}</p>
        <p className="text-sm mt-1">Time is auto-synced to your location.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>)
        ) : (
          heatMapData?.map(data => (
            <div
              key={data.pair}
              className="p-4 rounded-lg border text-center"
              style={{ backgroundColor: getHeatColor(data.strength, data.signal) }}
            >
              <h3 className="font-bold text-lg">{data.pair}</h3>
              <p className="text-sm">Price: {data.currentPrice.toFixed(4)}</p>
              <p className="text-sm">Pivot: {data.pivotPoints.pivot.toFixed(4)}</p>
              <p className="text-sm">Fib: {data.fibLevel}</p>
              <div className={`text-xs font-bold mt-2 px-2 py-1 rounded ${
                data.signal === 'BUY' ? 'bg-green-500 text-white' :
                data.signal === 'SELL' ? 'bg-red-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {data.signal}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        action="https://formsubmit.co/OPMENINACTIONLLC@GMAIL.COM"
        method="POST"
        className="bg-white bg-opacity-10 p-4 rounded mb-8"
      >
        <h2 className="text-lg font-bold mb-2">Join Our Newsletter</h2>
        <input type="email" name="email" required placeholder="Enter your email" className="p-2 rounded text-black w-full" />
        <input type="hidden" name="_captcha" value="false" />
        <p className="text-xs mt-2">By subscribing, you agree to receive marketing emails from Men In Action LLC. Your information is kept private and never sold.</p>
        <button type="submit" className="mt-2 bg-green-600 text-white px-4 py-2 rounded">Subscribe</button>
      </form>

      <div className="mb-4">
        <a href="https://t.me/meninactionvip" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join the VIP Telegram</a>
      </div>

      <div className="mb-8">
        <a href="https://www.amazon.com/Technical-Analysis-Journal-Forex-Manual/dp/B0D2KCG97N/ref=sr_1_1?sr=8-1" target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
          Buy the Book: Technical Analysis Journal Forex Manual
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <iframe src="https://www.forexfactory.com/calendar" title="Forex Calendar" className="w-full h-96 bg-white rounded"></iframe>
        <iframe src="https://tradingeconomics.com/calendar" title="Trading Economics" className="w-full h-96 bg-white rounded"></iframe>
      </div>
    </div>
  );
};

export default ForexHeatMap;
