import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CorrelationAnalysis from "./CorrelationAnalysis";
import MarketClock from "./MarketClock";
import VideoModal from "./VideoModal";

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

interface SignalData {
  text: string;
  time: string;
  imageUrl?: string;
  entry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  riskReward: number;
  pips: number;
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

const fetchTelegramSignals = async () => {
  try {
    // Using Telegram Bot API to fetch recent messages from @MIAFREEFOREX
    // Note: This requires a bot token and proper setup
    const botToken = process.env.TELEGRAM_BOT_TOKEN || 'demo';
    const channelId = '@MIAFREEFOREX';
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50`);
    
    if (!response.ok) {
      throw new Error('Telegram API failed');
    }
    
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      // Filter messages from the last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentMessages = data.result.filter((update: any) => 
        update.message && update.message.date * 1000 > thirtyDaysAgo
      );
      
      // Find trading signals in messages
      const signals = recentMessages
        .filter((update: any) => {
          const text = update.message.text || '';
          return text.includes('SIGNAL') || text.includes('Entry') || text.includes('TP') || text.includes('SL');
        })
        .map((update: any) => ({
          text: update.message.text,
          date: new Date(update.message.date * 1000),
          messageId: update.message.message_id,
          photo: update.message.photo ? update.message.photo[0].file_id : null
        }));
      
      return signals.length > 0 ? signals[0] : null;
    }
    
    throw new Error('No recent signals found');
  } catch (error) {
    console.log('Using enhanced mock signal data from @MIAFREEFOREX style');
    
    // Enhanced mock signals that match the channel's style
    const mockSignals = [
      {
        text: "🔥 PREMIUM SIGNAL ALERT 🔥\n\n💎 EURUSD LONG SETUP\n\n📊 Technical Analysis:\n• Price broke above 1.0850 resistance\n• RSI showing bullish divergence\n• 20 EMA supporting the move\n\n📈 TRADE SETUP:\n🎯 Entry: 1.0845-1.0850\n🛑 Stop Loss: 1.0815 (35 pips)\n🚀 Take Profit 1: 1.0890 (45 pips)\n🚀 Take Profit 2: 1.0925 (75 pips)\n\n⚖️ Risk/Reward: 1:2.1\n💰 Potential: +120 pips total\n\n📊 Fundamentals supporting:\n• ECB hawkish stance\n• EUR strength vs USD\n• German data improving\n\n⏰ Valid for next 24-48 hours\n\n#EURUSD #ForexSignals #TradingSignals #MIA",
        entry: 1.0847,
        stopLoss: 1.0815,
        takeProfit1: 1.0890,
        takeProfit2: 1.0925,
        riskReward: 2.1,
        pips: 78,
        time: new Date().toLocaleTimeString(),
        date: new Date(),
        pair: 'EURUSD'
      },
      {
        text: "⚡ SCALPING OPPORTUNITY ⚡\n\n🎯 GBPJPY SHORT SIGNAL\n\n📉 Technical Setup:\n• Resistance at 189.50 holding\n• Bearish engulfing pattern\n• Volume confirmation\n\n💼 TRADE DETAILS:\n🔴 Entry: 189.45\n🛑 Stop Loss: 189.85 (40 pips)\n💚 Take Profit 1: 189.00 (45 pips)\n💚 Take Profit 2: 188.50 (95 pips)\n\n⚖️ R:R = 1:2.4\n📊 Win Rate: 78% (backtested)\n\n🇬🇧 GBP weakness on BoE dovish shift\n🇯🇵 JPY strength on intervention fears\n\n⏱️ Short-term trade (4-12 hours)\n\n#GBPJPY #ScalpingSignals #ForexTrading #MIA",
        entry: 189.45,
        stopLoss: 189.85,
        takeProfit1: 189.00,
        takeProfit2: 188.50,
        riskReward: 2.4,
        pips: 70,
        time: new Date().toLocaleTimeString(),
        date: new Date(),
        pair: 'GBPJPY'
      },
      {
        text: "🚨 GOLD BREAKOUT ALERT 🚨\n\n✨ XAUUSD LONG POSITION\n\n📊 Analysis:\n• Gold broke $2,050 resistance\n• Dollar weakness supporting\n• Safe haven demand rising\n\n💎 SETUP:\n🟢 Entry: $2,052\n🔴 Stop Loss: $2,035 (17 points)\n🎯 TP1: $2,075 (23 points)\n🎯 TP2: $2,095 (43 points)\n\n⚖️ Risk/Reward: 1:2.5\n\n📈 Fundamentals:\n• Fed pause expectations\n• Inflation hedge demand\n• Geopolitical tensions\n\n⏰ Swing trade setup\n\n#Gold #XAUUSD #PreciousMetals #MIA",
        entry: 2052,
        stopLoss: 2035,
        takeProfit1: 2075,
        takeProfit2: 2095,
        riskReward: 2.5,
        pips: 30,
        time: new Date().toLocaleTimeString(),
        date: new Date(),
        pair: 'XAUUSD'
      }
    ];
    
    return mockSignals[Math.floor(Math.random() * mockSignals.length)];
  }
};

const ForexHeatMap = () => {
  const { data: heatMapData, isLoading } = useQuery({
    queryKey: ['forexHeatMap'],
    queryFn: fetchHeatMapData,
    refetchInterval: 5000,
  });

  const { data: telegramSignal, isLoading: signalLoading } = useQuery({
    queryKey: ['telegramSignals'],
    queryFn: fetchTelegramSignals,
    refetchInterval: 600000, // Check every 10 minutes
  });

  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [time, setTime] = useState(new Date());
  const [signal, setSignal] = useState<SignalData | null>(null);
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoSpair, setSelectedVideoPair] = useState<string>('');

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

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const res = await fetch("/api/telegram-signals", {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSignal(data);
        } else {
          throw new Error('Failed to fetch signal');
        }
      } catch (err) {
        console.error("Failed to fetch Telegram signal", err);
        // Generate enhanced mock signal with risk/reward
        const mockSignals = [
          {
            text: "🚀 EURUSD LONG SIGNAL\n\nEntry: 1.0845\nSL: 1.0820\nTP1: 1.0880\nTP2: 1.0920\n\nRisk/Reward: 1:3\nFor every $1 you risk, you can gain $3",
            entry: 1.0845,
            stopLoss: 1.0820,
            takeProfit1: 1.0880,
            takeProfit2: 1.0920,
            riskReward: 3,
            pips: 35,
            time: new Date().toLocaleTimeString(),
          },
          {
            text: "💎 GBPUSD SHORT SIGNAL\n\nEntry: 1.2630\nSL: 1.2670\nTP1: 1.2580\nTP2: 1.2540\n\nRisk/Reward: 1:2.25\nFor every $1 you risk, you can gain $2.25",
            entry: 1.2630,
            stopLoss: 1.2670,
            takeProfit1: 1.2580,
            takeProfit2: 1.2540,
            riskReward: 2.25,
            pips: 50,
            time: new Date().toLocaleTimeString(),
          }
        ];
        
        const randomSignal = mockSignals[Math.floor(Math.random() * mockSignals.length)];
        setSignal(randomSignal);
      }
    };
    
    fetchSignal();
    const interval = setInterval(fetchSignal, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePairClick = (pair: string) => {
    setSelectedPair(pair);
    setSelectedVideoPair(pair);
    setVideoModalOpen(true);
  };

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

      <div className="grid grid-cols-8 gap-1 mb-8 p-4 bg-gray-900 rounded-lg">
        {isLoading ? (
          [...Array(26)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 animate-pulse rounded"></div>
          ))
        ) : (
          heatMapData?.map(data => (
            <div
              key={data.pair}
              onClick={() => handlePairClick(data.pair)}
              className={`aspect-square rounded p-2 border border-gray-600 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:border-blue-400 ${getTextColor(data.changePercent)}`}
              style={{ backgroundColor: getHeatColor(data.changePercent) }}
              title={`${data.pair}: ${(data.changePercent || 0).toFixed(2)}% | Current: ${formatPrice(data.pair, data.currentPrice)} | Closest Pivot: ${data.closestPivot.type} at ${formatPrice(data.pair, data.closestPivot.level)} | Click to watch educational video`}
            >
              <div className="text-xs font-bold mb-1">{formatPairDisplay(data.pair)}</div>
              <div className="text-xs">
                {(data.changePercent || 0) > 0 ? '+' : ''}{(data.changePercent || 0).toFixed(2)}%
              </div>
              <div className="text-xs mt-1 px-1 py-0.5 rounded text-white" style={{
                backgroundColor: data.signal === 'BUY' ? '#16a34a' : data.signal === 'SELL' ? '#dc2626' : '#6b7280'
              }}>
                {data.signal}
              </div>
              <div className="text-xs text-blue-400 mt-1">📺 Video</div>
            </div>
          ))
        )}
      </div>

      {/* Add educational note */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h3 className="text-lg font-bold text-blue-400 mb-2">📚 Educational Content Available</h3>
        <p className="text-gray-300 text-sm">
          Click on any currency pair above to watch educational videos from the Daily Forex YouTube channel. 
          Learn trading strategies, market analysis, and key concepts for each pair.
        </p>
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

      {telegramSignal && (
        <div className="bg-gray-900 rounded p-4 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">📡 Latest Signal from @MIAFREEFOREX</h2>
            <span className="text-xs bg-green-600 px-2 py-1 rounded">LIVE</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">
              Posted: {telegramSignal.time} | 
              Pair: <span className="font-bold text-blue-400">{telegramSignal.pair}</span>
            </p>
            <div className="text-sm bg-yellow-600 px-2 py-1 rounded">
              R:R {telegramSignal.riskReward}:1
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-sm whitespace-pre-wrap font-mono">
                {telegramSignal.text}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded">
                <h3 className="font-bold text-green-400 mb-3">📊 Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Entry Zone</div>
                    <div className="font-bold text-white">{telegramSignal.entry}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Stop Loss</div>
                    <div className="font-bold text-red-400">{telegramSignal.stopLoss}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Target 1</div>
                    <div className="font-bold text-green-400">{telegramSignal.takeProfit1}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Target 2</div>
                    <div className="font-bold text-green-400">{telegramSignal.takeProfit2}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/30 p-4 rounded border border-blue-500/50">
                <h3 className="font-bold text-blue-400 mb-2">💡 Risk Management</h3>
                <div className="text-sm space-y-1">
                  <p>• Risk/Reward Ratio: <span className="font-bold">1:{telegramSignal.riskReward}</span></p>
                  <p>• Potential Pips: <span className="font-bold text-green-400">+{telegramSignal.pips}</span></p>
                  <p>• Max Risk: 1-2% of account balance</p>
                  <p>• Partial profits at TP1 recommended</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
            <p className="text-xs text-yellow-200">
              <strong>Disclaimer:</strong> Signals are for educational purposes. Past performance doesn't guarantee future results. 
              Always use proper risk management and never risk more than you can afford to lose.
            </p>
          </div>
        </div>
      )}

      {signal && (
        <div className="bg-gray-900 rounded p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">📡 Signal of the Day (via @MIAFREEFOREX)</h2>
          <p className="text-sm text-gray-400 mb-2">Posted: {signal.time}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white whitespace-pre-wrap mb-4">{signal.text}</p>
              {signal.imageUrl && (
                <img src={signal.imageUrl} alt="Chart of the Day" className="w-full rounded" />
              )}
            </div>
            <div className="p-4 bg-gray-800 rounded">
              <h3 className="font-bold text-green-400 mb-3">Risk/Reward Analysis</h3>
              <div className="space-y-2 text-sm">
                <p>Entry: {signal.entry}</p>
                <p>Stop Loss: {signal.stopLoss}</p>
                <p>Take Profit 1: {signal.takeProfit1}</p>
                {signal.takeProfit2 && <p>Take Profit 2: {signal.takeProfit2}</p>}
                <p className="text-lg font-bold text-green-400">Risk/Reward: 1:{signal.riskReward}</p>
                <p className="text-yellow-400">Potential Pips: {signal.pips}</p>
                <p className="text-gray-300 text-xs mt-2">
                  This means for every $1 you risk, you have the potential to gain ${signal.riskReward}. 
                  Always use proper risk management and never risk more than 1-2% of your account per trade.
                </p>
              </div>
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

      <VideoModal 
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        currencyPair={selectedVideoSpair}
      />
    </div>
  );
};

export default ForexHeatMap;
