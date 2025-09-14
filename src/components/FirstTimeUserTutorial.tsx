import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, X, TrendingUp, BookOpen, BarChart3, Users, ExternalLink } from "lucide-react";

const FirstTimeUserTutorial = () => {
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

  const tutorialSteps = [
    {
      title: "Welcome to Men In Action Market Intelligence Hub",
      content: (
        <div className="space-y-4">
          <p className="text-foreground">
            This platform is designed to help both novice and experienced traders make informed decisions in the forex market.
          </p>
          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-primary font-medium">
              💡 Pro Tip: Bookmark this site and check it daily for the latest market insights!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Market Analysis - Your Trading Edge",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Real-time Market Data</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Live forex rates and market sentiment</li>
            <li>• Central bank news and rate decisions</li>
            <li>• COT (Commitment of Traders) analysis</li>
            <li>• Economic calendar and news events</li>
          </ul>
          <div className="bg-success/10 p-3 rounded-lg">
            <p className="text-sm text-success">Start here each morning to plan your trading day!</p>
          </div>
        </div>
      )
    },
    {
      title: "COT Analysis - Follow the Smart Money",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Commitment of Traders</span>
          </div>
          <p className="text-muted-foreground text-sm">
            COT data shows you what institutional traders (the smart money) are doing. This is crucial for:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Identifying market sentiment shifts</li>
            <li>• Finding potential reversal points</li>
            <li>• Confirming your trading bias</li>
          </ul>
          <div className="bg-warning/10 p-3 rounded-lg">
            <p className="text-sm text-warning">The COT section now has its own dedicated page - easy to find and analyze!</p>
          </div>
        </div>
      )
    },
    {
      title: "Education Hub - Learn & Improve",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Continuous Learning</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Access comprehensive trading education including:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Forex fundamentals and technical analysis</li>
            <li>• Risk management strategies</li>
            <li>• Trading psychology and mindset</li>
            <li>• Live market examples and case studies</li>
          </ul>
        </div>
      )
    },
    {
      title: "Community & Trading Tools",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Connect & Trade</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Community</h4>
              <p className="text-sm text-muted-foreground">Connect with other traders, share insights, and learn from experienced members.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Trading Tools</h4>
              <p className="text-sm text-muted-foreground">Access calculators, market timers, and analysis tools to enhance your trading.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start Trading?",
      content: (
        <div className="space-y-4">
          <p className="text-foreground font-medium">Choose your preferred broker to get started:</p>
          
          <div className="space-y-3">
            <Card className="bg-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">🇺🇸 US Clients (Recommended)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">MidasFX</p>
                    <p className="text-xs text-muted-foreground">Regulated US broker with competitive spreads</p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
                    <a href="https://midasfx.com/" target="_blank" rel="noopener noreferrer">
                      Open Account <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-success/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">🌍 Global Clients</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-success">TradersWay</p>
                    <p className="text-xs text-muted-foreground">International broker with flexible trading conditions</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" asChild>
                    <a href="https://tradersway.com/" target="_blank" rel="noopener noreferrer">
                      Open Account <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <p className="text-sm text-primary font-medium">
              🎯 Start with a demo account to practice risk-free trading with our analysis!
            </p>
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
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {tutorialSteps[currentStep].title}
            </h3>
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
              <Button onClick={closeTutorial} className="bg-primary hover:bg-primary/90">
                Start Trading!
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
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