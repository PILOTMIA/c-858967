
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CurrencySelectorProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
}

const CurrencySelector = ({ selectedPair, onPairChange }: CurrencySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currencyPairs = [
    { symbol: 'EURUSD', display: 'EUR/USD' },
    { symbol: 'GBPUSD', display: 'GBP/USD' },
    { symbol: 'USDJPY', display: 'USD/JPY' },
    { symbol: 'USDCHF', display: 'USD/CHF' },
    { symbol: 'AUDUSD', display: 'AUD/USD' },
    { symbol: 'USDCAD', display: 'USD/CAD' },
    { symbol: 'EURGBP', display: 'EUR/GBP' },
    { symbol: 'EURJPY', display: 'EUR/JPY' },
    { symbol: 'GBPJPY', display: 'GBP/JPY' },
    { symbol: 'AUDJPY', display: 'AUD/JPY' },
    { symbol: 'XAUUSD', display: 'GOLD' },
    { symbol: 'XTIUSD', display: 'WTI CRUDE' },
  ];

  const handlePairSelect = (symbol: string) => {
    onPairChange(symbol);
    setIsOpen(false);
  };

  const currentPair = currencyPairs.find(pair => pair.symbol === selectedPair);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
      >
        <span>{currentPair?.display || 'EUR/USD'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 min-w-full max-h-60 overflow-y-auto">
          {currencyPairs.map((pair) => (
            <button
              key={pair.symbol}
              onClick={() => handlePairSelect(pair.symbol)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                selectedPair === pair.symbol ? 'bg-gray-700 text-white' : 'text-gray-200'
              }`}
            >
              {pair.display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
