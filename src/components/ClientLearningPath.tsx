
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Download, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface LearningStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const learningSteps: LearningStep[] = [
  {
    id: 1,
    title: "Market Fundamentals",
    description: "Understand forex basics, currency pairs, and market structure",
    completed: false
  },
  {
    id: 2,
    title: "Technical Analysis",
    description: "Master chart patterns, indicators, and price action",
    completed: false
  },
  {
    id: 3,
    title: "Risk Management",
    description: "Learn position sizing, stop losses, and portfolio protection",
    completed: false
  },
  {
    id: 4,
    title: "Psychology & Mindset",
    description: "Develop discipline, patience, and emotional control",
    completed: false
  },
  {
    id: 5,
    title: "Advanced Strategies",
    description: "Implement professional trading systems and automation",
    completed: false
  }
];

const ClientLearningPath = () => {
  const [steps, setSteps] = useState(learningSteps);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleStep = (id: number) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const handleStartLearning = () => {
    // Find the first incomplete step
    const nextStep = steps.find(step => !step.completed);
    
    if (nextStep) {
      toast({
        title: `Starting: ${nextStep.title}`,
        description: nextStep.description,
      });
      
      // Mark the step as started/completed
      toggleStep(nextStep.id);
    } else {
      toast({
        title: "Congratulations!",
        description: "You've completed all learning steps! Continue with advanced materials.",
      });
    }
  };

  const generatePDF = () => {
    // Create PDF content
    const pdfContent = `
FOREX TRADING LEARNING PATH
Men In Action LLC - Trading Education Guide

Your Learning Journey Progress: ${Math.round((steps.filter(step => step.completed).length / steps.length) * 100)}%

LEARNING STEPS:

${steps.map(step => `
${step.completed ? '✓' : '○'} ${step.title}
   ${step.description}
`).join('\n')}

NEXT STEPS:
1. Complete each learning module in order
2. Practice with demo accounts before live trading
3. Join our community for ongoing support
4. Contact us for personalized guidance

Contact Information:
Phone: 559.997.6387
Email: opmeninactionllc@gmail.com

© 2024 Men In Action LLC
Professional Trading Education & Analysis
    `.trim();

    // Create and download PDF-like text file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Forex-Learning-Path-Guide.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Guide Downloaded!",
      description: "Your learning path guide has been downloaded successfully.",
    });
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Your Learning Journey</h3>
        <div className="text-blue-400 text-sm font-semibold">
          {completedSteps}/{steps.length} Complete
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {steps.map((step) => (
          <div 
            key={step.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-900 border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors"
            onClick={() => toggleStep(step.id)}
          >
            {step.completed ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${step.completed ? 'text-green-400' : 'text-white'}`}>
                {step.title}
              </h4>
              <p className="text-gray-400 text-xs mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleStartLearning}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Start Learning
        </Button>
        <Button 
          onClick={generatePDF}
          variant="outline" 
          className="border-gray-600 text-gray-300 hover:bg-gray-700 text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          PDF Guide
        </Button>
      </div>
    </div>
  );
};

export default ClientLearningPath;
