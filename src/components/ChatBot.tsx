
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
      text: "Hello! I'm Dr. Alexander Elder, author of 'Trading for a Living'. I've spent decades studying markets and training traders. Ask me about the Triple Screen system, risk management, or how to develop the discipline needed for successful trading.",
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

  const elderKnowledge = {
    'triple screen': `The Triple Screen Trading System is my signature method:

**Screen 1 - Weekly Trend (Market Tide):**
• Use MACD-Histogram on weekly charts
• Identifies the long-term trend direction
• NEVER trade against this trend - it's like swimming against the tide

**Screen 2 - Daily Timing (Market Wave):**
• Use oscillators (Stochastic, Force Index) on daily charts
• Look for signals OPPOSITE to weekly trend for better entries
• This creates pullback opportunities in strong trends

**Screen 3 - Intraday Entry (Market Ripple):**
• Use breakout methods or momentum on hourly/5-minute charts
• Enter only in direction of weekly trend
• Set stops and targets before entering

Remember: "The trend is your friend, but pullbacks are your profit opportunities."`,

    'risk management': `Risk management is what separates professionals from gamblers:

**The 2% Rule:**
• Never risk more than 2% of your account on any single trade
• This keeps you alive during inevitable losing streaks
• Calculate position size BEFORE entering any trade

**The 6% Rule:**
• Never have more than 6% of your account at risk across ALL open positions
• If you hit this limit, close your weakest position

**Position Sizing Formula:**
Position Size = (Account × 2%) ÷ (Entry Price - Stop Loss Price)

"Good traders manage risk. Great traders manage risk religiously. The market will always be there, but your money won't if you don't protect it."`,

    'psychology': `Trading psychology is often more important than technical analysis:

**The Four Deadly Emotions:**
1. **Fear** - Makes you exit winners too early
2. **Greed** - Makes you hold losers too long  
3. **Hope** - Prevents you from cutting losses
4. **Regret** - Leads to revenge trading

**My Psychological Rules:**
• Keep a detailed trading diary - track both trades AND emotions
• Never add to losing positions (averaging down kills accounts)
• Take partial profits to stay rational
• Stop trading after 3 consecutive losses
• The market doesn't care about your mortgage payment

"The market is a huge crowd of people, and every tick represents the balance of fear and greed."`,

    'macd': `MACD-Histogram is my preferred trend-following indicator:

**What it shows:**
• The momentum of momentum
• Earlier signals than regular MACD
• Divergences that predict trend changes

**How to use it:**
• Buy when histogram stops falling and starts rising
• Sell when histogram stops rising and starts falling
• Look for divergences between price and histogram
• Use on weekly charts for Triple Screen System

**Why it's superior:**
• Filters out market noise
• Shows trend strength, not just direction
• Works in all time frames

"MACD-Histogram is like having a speedometer for market trends."`,

    'force index': `Force Index is my original indicator that measures buying and selling pressure:

**Formula:** (Close - Previous Close) × Volume

**What it reveals:**
• Whether bulls or bears are in control
• Confirms breakouts with volume
• Identifies trend weakness through divergences

**Two versions:**
• 2-period Force Index: For precise timing
• 13-period Force Index: For trend identification

**Trading signals:**
• Rising Force Index = Bulls in control
• Falling Force Index = Bears in control
• Divergences signal trend weakness

Use it with Triple Screen for powerful confirmation signals.`,

    'money management': `Money management is the difference between winning and losing traders:

**Key Principles:**
• Never risk your full "optimal F" percentage
• Increase position size only as account grows
• Reduce size immediately after losses
• Bank some profits regularly - pay yourself!
• Keep emergency cash reserves

**The Equity Curve Rule:**
• Risk only 25% of previous month's profit on aggressive trades
• When equity curve is rising, you can be more aggressive
• When it's falling, reduce risk immediately

"Money management and psychology are much more important than finding good trades. Most people can learn to find trades, but few can manage money and control their emotions."`,

    'discipline': `Discipline is what transforms knowledge into profit:

**My Daily Rules:**
1. Review your trading plan BEFORE market opens
2. Never enter a trade without knowing your exit
3. Write down the reason for every trade
4. Record your emotional state during trades
5. Review all trades at day's end - wins AND losses

**The Professional Mindset:**
• Trading is a business, treat it like one
• Focus on process, not individual trade outcomes
• Consistent small profits beat occasional big wins
• Losses are the cost of doing business

"Amateur traders focus on how much they can make. Professional traders focus on how much they can lose."`,

    'indicators': `I've developed several indicators, but remember - they're tools, not magic:

**My Favorites:**
• MACD-Histogram (momentum of momentum)
• Force Index (buying/selling pressure)
• Elder-ray (bull and bear power)
• Triple Screen combination

**Important principles:**
• No indicator works 100% of the time
• Combine multiple confirmations
• The weekly trend always trumps daily signals
• Volume confirms price movements

"Indicators are like a car's dashboard - useful information, but you still need to know how to drive."`,

    'market analysis': `Proper market analysis requires multiple perspectives:

**Three Essential Timeframes:**
• Weekly: For trend direction (never trade against this)
• Daily: For entry timing and signals
• Intraday: For precise entry and exit points

**What to analyze:**
1. **Trend:** Is it up, down, or sideways?
2. **Value:** Is the market overbought or oversold?
3. **Volume:** Are institutions participating?
4. **Momentum:** Is the trend accelerating or weakening?

**My analysis routine:**
• Start with weekly charts (the tide)
• Move to daily charts (the waves)  
• Finish with intraday charts (the ripples)

"The market's message is always clear - we just need to listen properly."`,

    'beginner advice': `If you're new to trading, here's how to start properly:

**Step 1: Education First**
• Read "Trading for a Living" thoroughly
• Practice with paper trading for at least 3 months
• Keep detailed records of every trade

**Step 2: Start Small**
• Begin with the minimum position size
• Risk only 1% per trade until profitable for 6 months
• Focus on NOT losing money, not making money

**Step 3: Develop Your Method**
• Master ONE approach before learning others
• Triple Screen is perfect for beginners
• Stick to major currency pairs initially

**Most Important:**
• Trading is a business, not gambling
• Expect to lose money while learning
• Most successful traders are profitable only 40-60% of the time

"The goal is not to be right all the time. The goal is to make money over time."`,

    'default': `As a professional trader and author, I can help you with:

📊 **Triple Screen Trading System** - My signature method
💰 **Risk & Money Management** - The keys to survival  
🧠 **Trading Psychology** - Controlling emotions
📈 **Technical Indicators** - MACD, Force Index, Elder-ray
⚡ **Market Analysis** - Multi-timeframe approach
📚 **Trading Discipline** - Professional habits
🎯 **Entry & Exit Strategies** - Precise timing
💡 **Beginner Guidance** - Starting your journey right

What specific aspect of trading would you like to discuss? Remember, successful trading is 10% finding good trades and 90% managing money and psychology.`
  };

  const generateElderResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for specific Elder concepts
    if (lowerMessage.includes('triple screen') || lowerMessage.includes('three screen') || lowerMessage.includes('system')) 
      return elderKnowledge['triple screen'];
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('management') || lowerMessage.includes('2%') || lowerMessage.includes('money')) 
      return elderKnowledge['risk management'];
    
    if (lowerMessage.includes('psychology') || lowerMessage.includes('emotion') || lowerMessage.includes('fear') || lowerMessage.includes('greed') || lowerMessage.includes('discipline')) 
      return elderKnowledge['psychology'];
    
    if (lowerMessage.includes('macd') || lowerMessage.includes('histogram')) 
      return elderKnowledge['macd'];
    
    if (lowerMessage.includes('force index') || lowerMessage.includes('force')) 
      return elderKnowledge['force index'];
    
    if (lowerMessage.includes('money management') || lowerMessage.includes('position size') || lowerMessage.includes('compounding')) 
      return elderKnowledge['money management'];
    
    if (lowerMessage.includes('discipline') || lowerMessage.includes('rules') || lowerMessage.includes('professional')) 
      return elderKnowledge['discipline'];
    
    if (lowerMessage.includes('indicator') || lowerMessage.includes('technical') || lowerMessage.includes('analysis')) 
      return elderKnowledge['indicators'];
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('chart') || lowerMessage.includes('timeframe')) 
      return elderKnowledge['market analysis'];
    
    if (lowerMessage.includes('beginner') || lowerMessage.includes('start') || lowerMessage.includes('new') || lowerMessage.includes('learn')) 
      return elderKnowledge['beginner advice'];
    
    // Specific market questions with Elder's perspective
    if (lowerMessage.includes('eur') || lowerMessage.includes('euro') || lowerMessage.includes('gbp') || lowerMessage.includes('pound')) 
      return 'For major pairs like EUR/USD or GBP/USD: Apply Triple Screen religiously. Start with weekly MACD-Histogram to identify the tide. Never fight it! Then use daily oscillators to find entry points. Remember, the trend is your friend, but timing is your profit.';
    
    if (lowerMessage.includes('gold') || lowerMessage.includes('xau') || lowerMessage.includes('metal')) 
      return 'Gold is a market driven by fear and greed more than most. Use Force Index to confirm volume behind moves - without volume, moves are suspect. Check weekly trend first, then daily timing. Set stops religiously - gold can gap violently.';
    
    if (lowerMessage.includes('stop loss') || lowerMessage.includes('exit')) 
      return 'Stops are your insurance policy - never trade without them! Set stops based on technical levels, not round numbers. My rule: Set stop, then calculate position size to risk only 2%. Move stops to breakeven after 1:1 profit. "Your first loss is your best loss."';
    
    return elderKnowledge['default'];
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
          text: "You've asked excellent questions! 🎉 As a professional trader, I believe in continuous learning. For unlimited access to my advanced strategies, detailed market analysis, and personalized guidance based on 30+ years of trading experience, join our VIP community. You'll get the same disciplined approach I teach to professional traders.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, vipMessage]);
        setShowVipPrompt(true);
      } else {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: generateElderResponse(inputMessage),
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 1500); // Slightly longer delay for more thoughtful responses

    setInputMessage('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-4 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="bg-gray-900 border-gray-700 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              Dr. Alexander Elder
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
            Author of "Trading for a Living" • Questions: {questionCount}/5
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div
                  className={`p-2 rounded text-sm ${
                    message.isBot
                      ? 'bg-blue-900/30 text-blue-100 border-l-2 border-blue-400'
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
                    text: "Welcome back! I'm ready to continue our trading discussion. What would you like to explore next?",
                    isBot: true,
                    timestamp: new Date()
                  }]);
                }}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Continue learning with Dr. Elder
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Dr. Elder about trading..."
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
