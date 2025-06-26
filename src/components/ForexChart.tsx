
import { useState } from 'react';
import TradingViewWidget from 'react-tradingview-widget';
import CurrencySelector from './CurrencySelector';

interface ForexChartProps {
  onPairChange?: (pair: string) => void;
}

const ForexChart = ({ onPairChange }: ForexChartProps) => {
  const [selectedPair, setSelectedPair] = useState('EURUSD');

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    if (onPairChange) {
      onPairChange(pair);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Live Forex Chart</h2>
        <CurrencySelector 
          selectedPair={selectedPair}
          onPairChange={handlePairChange}
        />
      </div>
      <div className="h-[400px] w-full">
        <TradingViewWidget
          symbol={`FX:${selectedPair}`}
          theme="dark"
          locale="en"
          autosize
          hide_side_toolbar={false}
          allow_symbol_change={true}
          interval="D"
          toolbar_bg="#141413"
          enable_publishing={false}
          hide_top_toolbar={false}
          save_image={false}
          container_id={`tradingview_forex_chart_${selectedPair}`}
        />
      </div>
    </div>
  );
};

export default ForexChart;
