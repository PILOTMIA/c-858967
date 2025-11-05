
import RealTimeData from "@/components/RealTimeData";
import SentimentWidget from "@/components/SentimentWidget";
import TradingBot from "@/components/TradingBot";
import NewsSentimentAnalysis from "@/components/NewsSentimentAnalysis";
import CentralBankRates from "@/components/CentralBankRates";
import MarketClock from "@/components/MarketClock";
import MarketStats from "@/components/MarketStats";

const Tools = () => {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Tools</h1>
          <p className="text-gray-300">Advanced tools to enhance your trading experience</p>
        </div>

        {/* Market Clock & Sessions */}
        <MarketClock />

        {/* Live Market Stats */}
        <MarketStats />

        {/* News Sentiment Analysis */}
        <NewsSentimentAnalysis />

        {/* Central Bank Interest Rate Forecaster */}
        <CentralBankRates />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeData />
          <SentimentWidget />
        </div>
      </div>

      <TradingBot />
    </div>
  );
};

export default Tools;
