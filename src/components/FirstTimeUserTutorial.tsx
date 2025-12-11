import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X, TrendingUp, BookOpen, BarChart3, Users, ExternalLink, Home, Compass, GraduationCap, MessageSquare, Wrench } from "lucide-react";
import { toast } from "sonner";

const FirstTimeUserTutorial = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial and terms are agreed
    const hasSeenTut = localStorage.getItem('hasSeenTutorial');
    const termsAgreed = localStorage.getItem('termsAgreed');
    
    if (termsAgreed && !hasSeenTut) {
      // Small delay to let the terms modal close first
      setTimeout(() => setIsOpen(true), 500);
    } else if (hasSeenTut) {
      setHasSeenTutorial(true);
    }
  }, []);

  const navigateToPage = (path: string, pageName: string) => {
    navigate(path);
    setIsOpen(false);
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
    toast.success(`Navigating to ${pageName}`, {
      description: "Explore the features and come back anytime!"
    });
  };

  const tutorialSteps = [
    {
      title: "Welcome to MIA Market Intelligence Hub",
      icon: <Home className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Your complete trading command center for professional forex analysis and education.
          </p>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-medium mb-3">🎯 What You'll Discover:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time market analysis and institutional COT data</li>
                <li>• <strong className="text-primary">NEW:</strong> Personalized profile with trading preferences</li>
                <li>• <strong className="text-primary">NEW:</strong> Live charts and seasonality analysis</li>
                <li>• <strong className="text-primary">NEW:</strong> Chart pattern recognition by trading style</li>
                <li>• Central bank decisions and economic forecasts</li>
                <li>• Professional trading education and strategies</li>
              </ul>
            </CardContent>
          </Card>
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium">
              💡 Create your profile to unlock personalized chart patterns and trading insights!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "📊 Market Analysis - Your Trading Edge",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Access professional-grade market intelligence updated in real-time.
          </p>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-semibold mb-3">Key Features:</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Live Forex Rates</strong> - Real-time currency pair movements and performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Market Sentiment</strong> - AI-powered analysis of current market conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Central Bank Rates</strong> - Latest interest rate decisions and forecasts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Economic Calendar</strong> - Upcoming news events that move markets</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Button 
            onClick={() => navigateToPage('/market-analysis', 'Market Analysis')} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Compass className="h-4 w-4 mr-2" />
            Explore Market Analysis
          </Button>
        </div>
      )
    },
    {
      title: "📈 COT Analysis - Follow the Smart Money",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Track institutional positioning and follow the smart money into profitable trades.
          </p>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-semibold mb-3">What is COT Data?</p>
              <p className="text-muted-foreground text-sm mb-4">
                The Commitment of Traders (COT) report reveals what large institutional traders, hedge funds, and commercial traders are doing with their positions. This is the "smart money" that often predicts major market moves.
              </p>
              <p className="text-foreground font-semibold mb-3">Why It Matters:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span>Identify market sentiment shifts before they happen</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span>Find potential reversal points with institutional positioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span>Confirm your trading bias with professional trader data</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <div className="bg-success/10 p-3 rounded-lg border border-success/20">
            <p className="text-sm text-success font-medium">
              🎯 Updated weekly with the latest CFTC data - check every Monday!
            </p>
          </div>
          <Button 
            onClick={() => navigateToPage('/cot-analysis', 'COT Analysis')} 
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View COT Analysis
          </Button>
        </div>
      )
    },
    {
      title: "🎓 Education Hub - Master Your Craft",
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            From beginner to professional - comprehensive trading education at your fingertips.
          </p>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-semibold mb-3">Learning Paths Include:</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">Forex Fundamentals</p>
                    <p className="text-xs text-muted-foreground">Master currency pairs, pips, and market basics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">Technical Analysis</p>
                    <p className="text-xs text-muted-foreground">Chart patterns, indicators, and trading strategies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">Risk Management</p>
                    <p className="text-xs text-muted-foreground">Protect your capital and maximize returns</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button 
            onClick={() => navigateToPage('/education', 'Education Hub')} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Start Learning
          </Button>
        </div>
      )
    },
    {
      title: "📊 NEW: Live Charts & Seasonality",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Access live TradingView charts and analyze seasonal patterns for all currency pairs.
          </p>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-semibold mb-3">Charts Page Features:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Live Charts</strong> - TradingView integration with all major pairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Seasonality Radar</strong> - Analyze seasonal trends for any COT pair</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span><strong className="text-foreground">Performance Tracking</strong> - Monitor your favorite pairs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Button 
            onClick={() => navigateToPage('/charts', 'Live Charts')} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Live Charts
          </Button>
        </div>
      )
    },
    {
      title: "👤 NEW: Your Trading Profile",
      icon: <Users className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Personalize your experience with custom trading preferences and chart patterns.
          </p>
          <Card className="bg-card border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground font-semibold mb-3">Profile Customization:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span><strong className="text-foreground">Trading Style</strong> - Aggressive or Conservative patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span><strong className="text-foreground">Favorite Pairs</strong> - Track your preferred currency pairs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-2" />
                  <span><strong className="text-foreground">Chart Patterns</strong> - See patterns matching your style</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Button 
            onClick={() => navigateToPage('/profile', 'Your Profile')} 
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
          >
            <Users className="h-4 w-4 mr-2" />
            Set Up Profile
          </Button>
        </div>
      )
    },
    {
      title: "🤝 Community & Tools",
      icon: <Wrench className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base">
            Connect with traders worldwide and access professional trading tools.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Trading Community</h4>
                    <p className="text-sm text-muted-foreground">Connect with fellow traders, share insights, and learn strategies.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigateToPage('/community', 'Community')} 
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
                  variant="outline"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Community
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <Wrench className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Trading Tools</h4>
                    <p className="text-sm text-muted-foreground">Position calculators, lot size tools, and correlation analysis.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigateToPage('/tools', 'Trading Tools')} 
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
                  variant="outline"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Explore Tools
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "🚀 Ready to Start Trading?",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground text-base font-medium">
            Choose your preferred broker and start trading with confidence:
          </p>
          
          <div className="space-y-3">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <span className="text-lg">🇺🇸</span>
                  US Clients - Recommended
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="font-bold text-lg text-primary mb-1">MidasFX</p>
                  <p className="text-xs text-muted-foreground">US regulated broker with competitive spreads and professional tools</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-primary hover:bg-primary/90" 
                    asChild
                  >
                    <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer">
                      Open Live Account <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1" 
                    asChild
                  >
                    <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer">
                      Try Demo
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/20 to-success/5 border-success/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-foreground flex items-center gap-2">
                  <span className="text-lg">🌍</span>
                  Global Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="font-bold text-lg text-success mb-1">TradersWay</p>
                  <p className="text-xs text-muted-foreground">International broker with flexible trading conditions worldwide</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-success text-success hover:bg-success/10" 
                  asChild
                >
                  <a href="https://tradersway.com/" target="_blank" rel="noopener noreferrer">
                    Open Account <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Pro Tip for Beginners
              </p>
              <p className="text-xs text-muted-foreground">
                Start with a demo account to practice risk-free trading using our market analysis and COT data. Build confidence before going live!
              </p>
            </CardContent>
          </Card>

          <div className="pt-2">
            <Button 
              onClick={() => navigateToPage('/', 'Home')} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Home className="h-4 w-4 mr-2" />
              Start Exploring MIA Hub
            </Button>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
    setIsOpen(false);
  };

  const skipTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
    setIsOpen(false);
  };

  if (hasSeenTutorial || !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-background border-border" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              Getting Started Tutorial ({currentStep + 1}/{tutorialSteps.length})
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={skipTutorial}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            <div className="flex items-center gap-3 mb-4">
              {tutorialSteps[currentStep].icon}
              <h3 className="text-xl font-bold text-foreground">
                {tutorialSteps[currentStep].title}
              </h3>
            </div>
            <div className="text-muted-foreground">
              {tutorialSteps[currentStep].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button variant="ghost" onClick={skipTutorial} className="text-muted-foreground">
              Skip Tutorial
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button onClick={closeTutorial} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Home className="h-4 w-4 mr-2" />
                Finish Tour
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeUserTutorial;