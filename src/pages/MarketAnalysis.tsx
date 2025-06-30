
import ForexHeatMap from "@/components/ForexHeatMap";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import COTData from "@/components/COTData";
import FedWatchTool from "@/components/FedWatchTool";
import { useState } from "react";

const MarketAnalysis = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Market Analysis</h1>
          <p className="text-gray-300">Real-time forex market analysis and insights</p>
        </div>

        {/* Heat Map */}
        <ForexHeatMap />

        {/* Chart & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>

        {/* COT Data & Fed Watch */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <COTData />
          <FedWatchTool />
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
