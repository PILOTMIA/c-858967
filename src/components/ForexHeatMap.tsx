
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
    if (signal === 'BUY') {
      return `rgba(34, 197, 94, ${intensity})`;
    } else if (signal === 'SELL') {
      return `rgba(239, 68, 68, ${intensity})`;
    }
    return `rgba(156, 163, 175, 0.3)`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">Currency Heat Map</h2>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in bg-gradient-to-r from-blue-500 to-purple-600">
      <h2 className="text-xl font-semibold mb-4 text-white">Currency Heat Map - Pivot Point Signals</h2>

      <form
        action="https://formsubmit.co/opmeninactionllc@gmail.com"
        method="POST"
        className="mb-6 bg-white p-4 rounded-lg shadow"
      >
        <label className="block text-gray-700 font-medium mb-2">Enter Email to Unlock Geo Clock & Signals:</label>
        <input
          type="email"
          name="email"
          required
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <input type="hidden" name="_captcha" value="false" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Subscribe & Unlock
        </button>
      </form>

      <a
        href="https://www.amazon.com/Technical-Analysis-Journal-Forex-Manual/dp/B0D2KCG97N/ref=sr_1_1?sr=8-1"
        target="_blank"
        className="inline-block mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        rel="noopener noreferrer"
      >
        📘 Buy My Book on Amazon
      </a>

      {/* Forex Heat Map Grid */}
      <div className="grid grid-cols-3 gap-4">
        {heatMapData?.map((data) => (
          <div
            key={data.pair}
            className="p-4 rounded-lg border text-center text-white"
            style={{ backgroundColor: getHeatColor(data.strength, data.signal) }}
          >
            <h3 className="font-bold text-lg">{data.pair}</h3>
            <p className="text-sm">Price: {data.currentPrice.toFixed(4)}</p>
            <p className="text-sm">Pivot: {data.pivotPoints.pivot.toFixed(4)}</p>
            <p className="text-sm">Fib: {data.fibLevel}</p>
            <div
              className={`text-xs font-bold mt-2 px-2 py-1 rounded ${
                data.signal === 'BUY'
                  ? 'bg-green-500 text-white'
                  : data.signal === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              {data.signal}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForexHeatMap;
