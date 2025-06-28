
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, MessageCircle } from 'lucide-react';

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
      text: "Hello! I'm your AI trading assistant. Ask me about forex analysis, market conditions, or trading strategies.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const predefinedResponses = {
    'market': 'Current market sentiment shows mixed signals. EUR/USD is showing bullish momentum while JPY pairs are experiencing volatility due to BoJ intervention concerns.',
    'eurusd': 'EUR/USD is currently testing key resistance levels. Watch for a breakout above 1.0880 for continued bullish momentum.',
    'gold': 'Gold is in a strong uptrend, benefiting from USD weakness and inflation hedging demand. Key support at $2,050.',
    'risk': 'Remember to never risk more than 1-2% of your account per trade. Use proper stop losses and position sizing.',
    'strategy': 'Focus on major currency pairs during London and NY sessions for best liquidity. Use pivot points for entry/exit levels.',
    'default': 'I can help with market analysis, trading strategies, and risk management. Try asking about specific currency pairs or market conditions.'
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('eur') || lowerMessage.includes('euro')) return predefinedResponses.eurusd;
    if (lowerMessage.includes('gold') || lowerMessage.includes('xau')) return predefinedResponses.gold;
    if (lowerMessage.includes('market') || lowerMessage.includes('sentiment')) return predefinedResponses.market;
    if (lowerMessage.includes('risk') || lowerMessage.includes('management')) return predefinedResponses.risk;
    if (lowerMessage.includes('strategy') || lowerMessage.includes('how')) return predefinedResponses.strategy;
    
    return predefinedResponses.default;
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
          <MessageCircle className="w-6 h-6" />
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
              Trading Assistant
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
              placeholder="Ask about forex trading..."
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
