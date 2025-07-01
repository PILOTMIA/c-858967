import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X } from 'lucide-react';
import ClientSignup from './ClientSignup';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm here to help answer your trading questions. Ask me about forex trading, market analysis, or our services!",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [showVipPrompt, setShowVipPrompt] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const tradingKnowledge = {
    'forex': `Forex (Foreign Exchange) is the global market for trading currencies. Key points:
    
• It's the largest financial market with $6+ trillion daily volume
• Markets are open 24/5 across different time zones
• Major pairs include EUR/USD, GBP/USD, USD/JPY
• Success requires proper risk management and education`,

    'risk management': `Risk Management is crucial for trading success:
    
• Never risk more than 1-2% of your account per trade
• Use stop losses on every trade
• Don't over-leverage your positions
• Keep a trading journal to track performance
• Have a clear trading plan before entering trades`,

    'technical analysis': `Technical Analysis involves studying price charts:
    
• Support and resistance levels are key
• Moving averages show trend direction
• RSI and MACD are popular indicators
• Japanese candlestick patterns provide entry signals
• Always combine multiple confirmations`,

    'fundamental analysis': `Fundamental Analysis looks at economic factors:
    
• Economic indicators (GDP, inflation, employment)
• Central bank policies and interest rates
• Political events and market sentiment
• News releases can cause major price moves
• Long-term trends driven by economic health`,

    'trading psychology': `Trading Psychology is often overlooked but critical:
    
• Control emotions like fear and greed
• Stick to your trading plan consistently
• Don't chase losses with bigger positions
• Take breaks after big wins or losses
• Develop patience and discipline`,

    'signals': `Our trading signals provide:
    
• Entry and exit points for trades
• Risk management guidelines
• Market analysis and reasoning
• Real-time notifications via Telegram
• High probability setups from experienced traders`,

    'default': `I can help you with:
    
📊 Forex Trading Basics
📈 Technical & Fundamental Analysis  
💰 Risk Management Strategies
🧠 Trading Psychology
📱 Our Signal Services
🎯 Market Education

What would you like to know more about?`
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('forex') || lowerMessage.includes('currency')) 
      return tradingKnowledge['forex'];
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('management') || lowerMessage.includes('money')) 
      return tradingKnowledge['risk management'];
    
    if (lowerMessage.includes('technical') || lowerMessage.includes('chart') || lowerMessage.includes('indicator')) 
      return tradingKnowledge['technical analysis'];
    
    if (lowerMessage.includes('fundamental') || lowerMessage.includes('news') || lowerMessage.includes('economic')) 
      return tradingKnowledge['fundamental analysis'];
    
    if (lowerMessage.includes('psychology') || lowerMessage.includes('emotion') || lowerMessage.includes('discipline')) 
      return tradingKnowledge['trading psychology'];
    
    if (lowerMessage.includes('signal') || lowerMessage.includes('telegram') || lowerMessage.includes('vip')) 
      return tradingKnowledge['signals'];
    
    return tradingKnowledge['default'];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || showVipPrompt) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestionCount(prev => prev + 1);

    setTimeout(() => {
      if (questionCount >= 4) {
        // Show VIP prompt after 5 questions
        const vipMessage: Message = {
          id: Date.now() + 1,
          text: "You've asked 5 questions! 🎉 For unlimited access to expert analysis, premium signals, and personalized trading guidance, join our VIP Telegram channel. Click below to get started!",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, vipMessage]);
        setShowVipPrompt(true);
      } else {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: generateBotResponse(inputMessage),
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 1000);

    setInputMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
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
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Trading Assistant
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            Questions: {questionCount}/5
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div
                  className={`p-2 rounded text-sm ${
                    message.isBot
                      ? 'bg-blue-900/30 text-blue-100'
                      : 'bg-gray-700 text-white ml-4'
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-right text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {showVipPrompt ? (
            <div className="space-y-2">
              <ClientSignup />
              <Button 
                onClick={() => {
                  setQuestionCount(0);
                  setShowVipPrompt(false);
                  setMessages([{
                    id: Date.now(),
                    text: "Welcome back! You have 5 more questions. How can I help you?",
                    isBot: true,
                    timestamp: new Date()
                  }]);
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Continue with 5 more questions
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about trading..."
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button onClick={handleSendMessage} size="sm" disabled={showVipPrompt || !inputMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBot;
