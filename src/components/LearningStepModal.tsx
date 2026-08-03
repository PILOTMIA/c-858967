
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen } from "lucide-react";

interface LearningStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface LearningStepModalProps {
  step: LearningStep | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkComplete: (stepId: number) => void;
}

const getStepContent = (step: LearningStep) => {
  const content = {
    1: {
      details: "Learn the fundamental concepts of forex trading including currency pairs, pips, spreads, and market sessions. Understand how the forex market operates 24/5 and the key factors that influence currency prices.",
      keyPoints: [
        "Understanding major, minor, and exotic currency pairs",
        "How to read forex quotes and calculate pip values",
        "Market sessions: London, New York, Tokyo, Sydney",
        "Economic factors affecting currency movements"
      ]
    },
    2: {
      details: "Master the art of reading charts and identifying patterns. Learn about support and resistance levels, trend lines, and popular technical indicators to make informed trading decisions.",
      keyPoints: [
        "Candlestick patterns and chart types",
        "Support and resistance identification",
        "Moving averages, RSI, MACD indicators",
        "Price action trading strategies"
      ]
    },
    3: {
      details: "Develop proper risk management techniques to protect your trading capital. Learn position sizing, stop-loss placement, and portfolio management strategies.",
      keyPoints: [
        "Position sizing and risk per trade calculations",
        "Stop-loss and take-profit strategies",
        "Risk-reward ratios and expectancy",
        "Portfolio diversification techniques"
      ]
    },
    4: {
      details: "Build the mental discipline required for successful trading. Learn to control emotions, develop patience, and maintain consistency in your trading approach.",
      keyPoints: [
        "Overcoming fear and greed in trading",
        "Developing a trading routine and discipline",
        "Managing winning and losing streaks",
        "Building confidence through proper preparation"
      ]
    },
    5: {
      details: "Implement advanced trading strategies and learn about automation tools. Explore algorithmic trading, advanced chart patterns, and professional trading techniques.",
      keyPoints: [
        "Advanced chart patterns and formations",
        "Algorithmic and automated trading systems",
        "Multi-timeframe analysis techniques",
        "Professional risk management systems"
      ]
    }
  };

  return content[step.id as keyof typeof content] || { details: step.description, keyPoints: [] };
};

const LearningStepModal = ({ step, isOpen, onClose, onMarkComplete }: LearningStepModalProps) => {
  if (!step) return null;

  const stepContent = getStepContent(step);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            {stepContent.details}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-foreground mb-3">Key Learning Points:</h4>
          <ul className="space-y-2">
            {stepContent.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-muted-foreground">
                <span className="text-blue-400 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            {step.completed ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Completed</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Ready to start</span>
            )}
          </div>
          
          <div className="flex gap-2">
            {!step.completed && (
              <Button 
                onClick={() => onMarkComplete(step.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark as Complete
              </Button>
            )}
            <Button 
              onClick={onClose}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearningStepModal;
