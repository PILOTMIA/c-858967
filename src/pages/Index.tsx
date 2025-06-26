
import { useState } from "react";
import MarketStats from "@/components/MarketStats";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import ForexList from "@/components/ForexList";
import ForexHeatMap from "@/components/ForexHeatMap";
import FedWatchTool from "@/components/FedWatchTool";
import COTData from "@/components/COTData";
import ClientSignup from "@/components/ClientSignup";

const Index = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Men In Action LLC Forex Department</h1>
            <p className="text-muted-foreground">Welcome back to your trading platform</p>
          </div>
          <ClientSignup />
        </header>
        
        <MarketStats />
        
        <ForexHeatMap />
        
        <FedWatchTool />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>
        
        <COTData />
        
        <ForexList />
      </div>
    </div>
  );
};

export default Index;
