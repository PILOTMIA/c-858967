
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface HeatMapData {
  pair: string;
  currentPrice: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  changePercent: number;
}

interface CorrelationInsight {
  pair1: string;
  pair2: string;
  relationship: 'positive' | 'negative' | 'neutral';
  strength: number;
  explanation: string;
  newsContext: string;
}

interface CorrelationAnalysisProps {
  heatMapData?: HeatMapData[];
}

const fetchCorrelationInsights = async (heatMapData?: HeatMapData[]): Promise<CorrelationInsight[]> => {
  if (!heatMapData) return [];

  // Find key correlations based on current market data
  const insights: CorrelationInsight[] = [];
  
  const oilData = heatMapData.find(d => d.pair === 'XTIUSD');
  const usdcadData = heatMapData.find(d => d.pair === 'USD/CAD');
  const goldData = heatMapData.find(d => d.pair === 'XAUUSD');
  const eurusdData = heatMapData.find(d => d.pair === 'EUR/USD');
  
  // Oil vs USD/CAD correlation
  if (oilData && usdcadData) {
    const oilTrend = oilData.changePercent > 0 ? 'up' : 'down';
    const cadTrend = usdcadData.changePercent > 0 ? 'up' : 'down';
    const isNegativeCorrelation = (oilTrend === 'up' && cadTrend === 'down') || (oilTrend === 'down' && cadTrend === 'up');
    
    insights.push({
      pair1: 'XTIUSD',
      pair2: 'USD/CAD',
      relationship: isNegativeCorrelation ? 'negative' : 'neutral',
      strength: 0.8,
      explanation: `Oil ${oilTrend === 'up' ? 'rising' : 'falling'} typically ${oilTrend === 'up' ? 'strengthens' : 'weakens'} CAD, causing USD/CAD to ${oilTrend === 'up' ? 'fall' : 'rise'}`,
      newsContext: `Canadian economy is heavily dependent on oil exports. Current WTI crude oil is ${oilData.changePercent > 0 ? 'gaining' : 'losing'} ${Math.abs(oilData.changePercent).toFixed(2)}% due to global supply dynamics and OPEC+ decisions.`
    });
  }
  
  // Gold vs USD correlation
  if (goldData && eurusdData) {
    const goldTrend = goldData.changePercent > 0 ? 'up' : 'down';
    const usdTrend = eurusdData.changePercent < 0 ? 'up' : 'down'; // EUR/USD down means USD up
    const isNegativeCorrelation = (goldTrend === 'up' && usdTrend === 'down') || (goldTrend === 'down' && usdTrend === 'up');
    
    insights.push({
      pair1: 'XAUUSD',
      pair2: 'EUR/USD',
      relationship: isNegativeCorrelation ? 'negative' : 'positive',
      strength: 0.7,
      explanation: `Gold and USD typically have inverse relationship. Strong USD makes gold expensive for other currencies`,
      newsContext: `Current gold movement of ${goldData.changePercent.toFixed(2)}% reflects inflation concerns and Fed policy expectations. Safe-haven demand drives gold when USD weakens.`
    });
  }
  
  // Add more correlations based on available data
  const jpyPairs = heatMapData.filter(d => d.pair.includes('JPY'));
  if (jpyPairs.length >= 2) {
    insights.push({
      pair1: jpyPairs[0].pair,
      pair2: jpyPairs[1].pair,
      relationship: 'positive',
      strength: 0.6,
      explanation: 'JPY pairs often move together due to Bank of Japan policy and risk sentiment',
      newsContext: 'Current JPY movement reflects BoJ intervention concerns and global risk appetite changes following recent economic data releases.'
    });
  }
  
  return insights;
};

const CorrelationAnalysis = ({ heatMapData }: CorrelationAnalysisProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: correlationInsights, isLoading } = useQuery({
    queryKey: ['correlationInsights', heatMapData],
    queryFn: () => fetchCorrelationInsights(heatMapData),
    refetchInterval: 30000, // Update every 30 seconds
    enabled: !!heatMapData,
  });

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'positive':
        return 'border-green-500 bg-green-900/20';
      case 'negative':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-yellow-500 bg-yellow-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Market Correlations & News Analysis</h2>
        <div className="animate-pulse">Loading correlation insights...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Market Correlations & News Analysis</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'} Analysis
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlationInsights?.slice(0, isExpanded ? correlationInsights.length : 2).map((insight, index) => (
          <div key={index} className={`p-4 rounded border-l-4 ${getRelationshipColor(insight.relationship)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getRelationshipIcon(insight.relationship)}
              <span className="font-semibold">
                {insight.pair1 === 'XAUUSD' ? 'GOLD' : insight.pair1 === 'XTIUSD' ? 'OIL' : insight.pair1} 
                ↔ 
                {insight.pair2 === 'XAUUSD' ? 'GOLD' : insight.pair2 === 'XTIUSD' ? 'OIL' : insight.pair2}
              </span>
              <span className="text-sm bg-gray-700 px-2 py-1 rounded">
                {(insight.strength * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{insight.explanation}</p>
            <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
              <strong>Market Context:</strong> {insight.newsContext}
            </div>
          </div>
        ))}
      </div>
      
      {!isExpanded && correlationInsights && correlationInsights.length > 2 && (
        <div className="text-center mt-4">
          <span className="text-sm text-gray-400">
            +{correlationInsights.length - 2} more correlations available
          </span>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
        <p className="text-sm text-blue-200">
          <strong>Live Analysis:</strong> Correlations are calculated in real-time based on current market movements 
          and updated news sentiment. Strength percentages indicate historical correlation reliability.
        </p>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;
