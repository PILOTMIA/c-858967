import { useState } from "react";
import MarketStats from "@/components/MarketStats";
import ForexChart from "@/components/ForexChart";
import ForexPerformance from "@/components/ForexPerformance";
import ForexList from "@/components/ForexList";
import ForexHeatMap from "@/components/ForexHeatMap";
import FedWatchTool from "@/components/FedWatchTool";
import COTData from "@/components/COTData";
import ClientSignup from "@/components/ClientSignup";
import TradingBot from "@/components/TradingBot";
import KnowledgeBase from "@/components/KnowledgeBase";
import RealTimeData from "@/components/RealTimeData";
import BrandingSection from "@/components/BrandingSection";
import SentimentWidget from "@/components/SentimentWidget";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ClientLearningPath from "@/components/ClientLearningPath";

const Index = () => {
  const [selectedCurrencyPair, setSelectedCurrencyPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedCurrencyPair(pair);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Command Center Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Command Center</h1>
              <p className="text-gray-300 text-sm">Men In Action LLC - Live Market Analysis & Education</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-green-400 text-sm font-mono">
                LIVE • {new Date().toLocaleTimeString()}
              </div>
              <ClientSignup />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Top Priority Section - Market Stats & Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketStats />
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-white mb-2">🎯 VIP Signal Access</h2>
            <p className="text-gray-300 text-sm mb-3">Get premium signals & analysis</p>
            <ClientSignup />
          </div>
        </div>

        {/* Branding Section */}
        <BrandingSection />

        {/* Heat Map & Fed Watch - Core Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <ForexHeatMap />
          </div>
          <div className="space-y-6">
            <FedWatchTool />
            <RealTimeData />
            <SentimentWidget />
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
        </div>

        {/* Knowledge Base Section */}
        <KnowledgeBase />

        {/* Chart & Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ForexChart onPairChange={handlePairChange} />
          </div>
          <div>
            <ForexPerformance selectedPair={selectedCurrencyPair} />
          </div>
        </div>

        {/* Testimonials and Learning Path */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TestimonialsCarousel />
          <ClientLearningPath />
        </div>

        {/* COT Data & Market List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <COTData />
          <ForexList />
        </div>
      </div>

      {/* Trading Bot */}
      <TradingBot />
    </div>
  );
};

export default Index;
