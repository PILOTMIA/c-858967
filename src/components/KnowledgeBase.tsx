
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, Shield, Brain, BarChart3 } from 'lucide-react';

const KnowledgeBase = () => {
  const [activeTab, setActiveTab] = useState('triple-screen');

  const knowledgeData = {
    'triple-screen': {
      title: 'Triple Screen Trading System',
      icon: <BarChart3 className="w-5 h-5" />,
      content: `
        <div class="space-y-4">
          <h3 class="text-lg font-bold text-green-400">The Three Screens</h3>
          
          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-blue-400">Screen 1: Market Tide (Weekly)</h4>
            <p class="text-sm text-gray-300 mt-2">
              • Use MACD-Histogram to identify long-term trend<br/>
              • Only trade in direction of weekly trend<br/>
              • This is your "tide" - never swim against it
            </p>
          </div>

          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-blue-400">Screen 2: Market Wave (Daily)</h4>
            <p class="text-sm text-gray-300 mt-2">
              • Use oscillators (Stochastic, Williams %R)<br/>
              • Look for signals OPPOSITE to weekly trend<br/>
              • This creates better entry points
            </p>
          </div>

          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-blue-400">Screen 3: Market Ripple (Intraday)</h4>
            <p class="text-sm text-gray-300 mt-2">
              • Use breakout methods or momentum indicators<br/>
              • Enter in direction of weekly trend<br/>
              • Set stop-losses and profit targets
            </p>
          </div>
        </div>
      `
    },
    'risk-management': {
      title: 'Risk Management Rules',
      icon: <Shield className="w-5 h-5" />,
      content: `
        <div class="space-y-4">
          <div class="bg-red-900/30 border border-red-500/50 p-4 rounded">
            <h4 class="font-bold text-red-400">The 2% Rule</h4>
            <p class="text-sm text-gray-300 mt-2">
              Never risk more than 2% of your account equity on any single trade.
              This keeps you alive during losing streaks.
            </p>
          </div>

          <div class="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded">
            <h4 class="font-bold text-yellow-400">The 6% Rule</h4>
            <p class="text-sm text-gray-300 mt-2">
              Never have more than 6% of your account at risk across all open positions.
              Close weakest positions if you hit this limit.
            </p>
          </div>

          <div class="bg-green-900/30 border border-green-500/50 p-4 rounded">
            <h4 class="font-bold text-green-400">Position Sizing Formula</h4>
            <p class="text-sm text-gray-300 mt-2">
              Position Size = (Account × 2%) ÷ (Entry Price - Stop Loss Price)<br/>
              Always know your risk BEFORE entering a trade.
            </p>
          </div>
        </div>
      `
    },
    'psychology': {
      title: 'Trading Psychology',
      icon: <Brain className="w-5 h-5" />,
      content: `
        <div class="space-y-4">
          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-purple-400">The Deadly Emotions</h4>
            <ul class="text-sm text-gray-300 mt-2 space-y-1">
              <li>• <strong>Fear:</strong> Makes you exit winners too early</li>
              <li>• <strong>Greed:</strong> Makes you hold losers too long</li>
              <li>• <strong>Hope:</strong> Prevents cutting losses</li>
              <li>• <strong>Regret:</strong> Leads to revenge trading</li>
            </ul>
          </div>

          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-purple-400">Discipline Rules</h4>
            <ul class="text-sm text-gray-300 mt-2 space-y-1">
              <li>• Keep a detailed trading diary</li>
              <li>• Never add to losing positions</li>
              <li>• Take partial profits on winners</li>
              <li>• Stop trading after 3 consecutive losses</li>
              <li>• Review every trade - win or lose</li>
            </ul>
          </div>
        </div>
      `
    },
    'indicators': {
      title: 'Key Indicators',
      icon: <TrendingUp className="w-5 h-5" />,
      content: `
        <div class="space-y-4">
          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-cyan-400">MACD-Histogram</h4>
            <p class="text-sm text-gray-300 mt-2">
              Shows the momentum of momentum. Best trend-following indicator for Triple Screen System.
              Buy when histogram stops falling and starts rising.
            </p>
          </div>

          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-cyan-400">Force Index</h4>
            <p class="text-sm text-gray-300 mt-2">
              Formula: (Close - Previous Close) × Volume<br/>
              Confirms breakouts and identifies divergences. Use 2-period for timing, 13-period for trend.
            </p>
          </div>

          <div class="bg-gray-800 p-4 rounded">
            <h4 class="font-bold text-cyan-400">Elder-Ray (Bull & Bear Power)</h4>
            <p class="text-sm text-gray-300 mt-2">
              Bull Power = High - EMA<br/>
              Bear Power = Low - EMA<br/>
              Shows the maximum power of bulls and bears.
            </p>
          </div>
        </div>
      `
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Trading Knowledge Base
          <span className="text-sm text-gray-400 font-normal">Based on "Trading for a Living"</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            {Object.entries(knowledgeData).map(([key, data]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                {data.icon}
                <span className="hidden sm:inline">{data.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(knowledgeData).map(([key, data]) => (
            <TabsContent key={key} value={key} className="mt-4">
              <div 
                dangerouslySetInnerHTML={{ __html: data.content }}
                className="text-gray-300"
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBase;
