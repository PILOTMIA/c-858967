
import RealTimeData from "@/components/RealTimeData";
import SentimentWidget from "@/components/SentimentWidget";
import TradingBot from "@/components/TradingBot";

const Tools = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading Tools</h1>
          <p className="text-gray-300">Advanced tools to enhance your trading experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RealTimeData />
          <SentimentWidget />
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Market Sessions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">London</span>
              <span className="text-green-400">OPEN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">New York</span>
              <span className="text-green-400">OPEN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Tokyo</span>
              <span className="text-gray-500">CLOSED</span>
            </div>
          </div>
        </div>
      </div>

      <TradingBot />
    </div>
  );
};

export default Tools;
