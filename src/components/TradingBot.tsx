import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, MessageCircle, BookOpen } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const TradingBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI trading mentor based on 'Trading for a Living' principles. Ask me about the Triple Screen system, risk management, or market psychology.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const elderTradingKnowledge = {
    'triple screen': `The Triple Screen Trading System by Dr. Elder:
    
Screen 1: Market Tide (Weekly) - Use trend-following indicators like MACD-Histogram
Screen 2: Market Wave (Daily) - Use oscillators like Force Index when trend is established  
Screen 3: Market Ripple (Intraday) - Enter in direction of weekly trend when daily gives signal

Never trade against the weekly trend!`,

    'risk management': `Dr. Elder's Risk Management Rules:
    
• 2% Rule: Never risk more than 2% of account on any single trade
• 6% Rule: Never have more than 6% of account at risk across all open positions
• Account Equity Rule: Risk only 25% of previous month's profit on aggressive trades
• The goal is to stay in the game long enough to win

"Good traders manage risk. Great traders manage risk religiously."`,

    'psychology': `Trading Psychology from Elder:
    
• Fear and Greed are your enemies
• Keep a trading diary - track both wins AND emotional state
• Never add to losing positions (averaging down kills accounts)
• Take partial profits to stay rational
• The market doesn't care about your mortgage payment

"The market is a huge crowd of people. Every tick represents the balance of fear and greed."`,

    'force index': `Force Index by Dr. Elder:
    
Formula: (Close - Previous Close) × Volume
• Confirms breakouts when volume surges
• Divergences signal trend weakness
• Use 2-period for timing, 13-period for trend
• Best used with Triple Screen system

Rising Force Index = Bulls in control
Falling Force Index = Bears in control`,

    'macd': `MACD-Histogram (Elder's preferred indicator):
    
• Shows momentum of momentum
• Buy when histogram stops falling and starts rising
• Sell when histogram stops rising and starts falling
• Divergences between price and histogram are powerful signals
• Use on weekly charts for Triple Screen System

"MACD-Histogram is like a speedometer for trends."`,

    'money management': `Money Management Principles:
    
• Optimal F: Never risk your full optimal percentage
• Compounding: Increase position size as account grows
• Drawdown Control: Reduce size after losses
• Profit Taking: Bank some profits regularly
• Emergency Fund: Keep cash reserves

"Money management separates winners from losers more than any other factor."`,

    'default': `I can help you with Dr. Elder's concepts:
    
📊 Triple Screen Trading System
💰 Risk & Money Management 
🧠 Trading Psychology
📈 Force Index & MACD
⚡ Market Entry/Exit Timing
📚 Trading Discipline

Ask me about any of these topics or specific trading situations!`
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for Elder's specific concepts
    if (lowerMessage.includes('triple screen') || lowerMessage.includes('three screen')) 
      return elderTradingKnowledge['triple screen'];
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('management') || lowerMessage.includes('2%')) 
      return elderTradingKnowledge['risk management'];
    
    if (lowerMessage.includes('psychology') || lowerMessage.includes('emotion') || lowerMessage.includes('fear') || lowerMessage.includes('greed')) 
      return elderTradingKnowledge['psychology'];
    
    if (lowerMessage.includes('force index') || lowerMessage.includes('force')) 
      return elderTradingKnowledge['force index'];
    
    if (lowerMessage.includes('macd') || lowerMessage.includes('histogram')) 
      return elderTradingKnowledge['macd'];
    
    if (lowerMessage.includes('money') || lowerMessage.includes('position size') || lowerMessage.includes('compounding')) 
      return elderTradingKnowledge['money management'];
    
    // Market-specific responses (keeping some original ones)
    if (lowerMessage.includes('eur') || lowerMessage.includes('euro')) 
      return 'For EUR/USD: Apply Triple Screen - check weekly trend first, then daily signals. Never trade against the weekly direction. Current resistance around 1.0880.';
    
    if (lowerMessage.includes('gold') || lowerMessage.includes('xau')) 
      return 'Gold analysis: Use Force Index to confirm volume behind moves. Check for divergences between price and MACD-Histogram. Key support at $2,050.';
    
    return elderTradingKnowledge['default'];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: generateBotResponse(inputMessage),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setInputMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-4"
        >
          <BookOpen className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              Trading Mentor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded text-sm ${
                  message.isBot
                    ? 'bg-blue-900/30 text-blue-100'
                    : 'bg-gray-700 text-white ml-4'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about Elder's methods..."
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingBot;
