
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Brain, TrendingUp, Shield, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'psychology' | 'risk' | 'technical' | 'system';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "According to Dr. Elder's 2% Rule, what's the maximum you should risk on any single trade?",
    options: ["1% of account", "2% of account", "5% of account", "10% of account"],
    correctAnswer: 1,
    explanation: "The 2% Rule states you should never risk more than 2% of your account equity on any single trade. This keeps you alive during losing streaks.",
    category: 'risk',
    difficulty: 'beginner',
    points: 10
  },
  {
    id: 2,
    question: "What is the first screen in Elder's Triple Screen Trading System?",
    options: ["Daily chart with oscillators", "Weekly chart with trend indicators", "Hourly chart with momentum", "5-minute chart with volume"],
    correctAnswer: 1,
    explanation: "Screen 1 uses the weekly chart with trend-following indicators like MACD-Histogram to identify the market tide. Never trade against this weekly trend!",
    category: 'system',
    difficulty: 'intermediate',
    points: 15
  },
  {
    id: 3,
    question: "Which emotion is most dangerous when you're in a losing trade?",
    options: ["Fear", "Hope", "Greed", "Anger"],
    correctAnswer: 1,
    explanation: "Hope is the most dangerous emotion in losing trades. It prevents you from cutting losses and leads to account destruction. Cut losses quickly!",
    category: 'psychology',
    difficulty: 'beginner',
    points: 10
  },
  {
    id: 4,
    question: "What does the Force Index measure?",
    options: ["Price momentum only", "Volume momentum only", "Price change × Volume", "Moving average convergence"],
    correctAnswer: 2,
    explanation: "Force Index = (Close - Previous Close) × Volume. It shows the amount of power used to move prices and confirms breakouts with volume.",
    category: 'technical',
    difficulty: 'intermediate',
    points: 15
  },
  {
    id: 5,
    question: "According to Elder, what should you do when MACD-Histogram stops falling and starts rising?",
    options: ["Sell immediately", "Wait for confirmation", "Consider buying", "Ignore the signal"],
    correctAnswer: 2,
    explanation: "When MACD-Histogram stops falling and starts rising, it shows momentum is improving - a potential buy signal in the direction of the trend.",
    category: 'technical',
    difficulty: 'advanced',
    points: 20
  },
  {
    id: 6,
    question: "What's the maximum total risk Elder recommends across ALL open positions?",
    options: ["2% of account", "6% of account", "10% of account", "15% of account"],
    correctAnswer: 1,
    explanation: "The 6% Rule: Never have more than 6% of your account at risk across all open positions. Close your weakest positions if you hit this limit.",
    category: 'risk',
    difficulty: 'intermediate',
    points: 15
  },
  {
    id: 7,
    question: "In Triple Screen, what should Screen 2 (daily) look for?",
    options: ["Signals in same direction as weekly", "Signals opposite to weekly trend", "Breakout patterns", "Volume spikes"],
    correctAnswer: 1,
    explanation: "Screen 2 uses oscillators to find signals OPPOSITE to the weekly trend direction, creating better entry opportunities when the daily pulls back.",
    category: 'system',
    difficulty: 'advanced',
    points: 20
  },
  {
    id: 8,
    question: "What's the biggest mistake amateur traders make with winning trades?",
    options: ["Hold too long", "Exit too early", "Add more positions", "Ignore stop losses"],
    correctAnswer: 1,
    explanation: "Fear makes amateurs exit winners too early. Elder recommends taking partial profits and letting the rest run to maximize gains.",
    category: 'psychology',
    difficulty: 'beginner',
    points: 10
  }
];

const TradingQuizGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(quizQuestions.length).fill(false));
  const { toast } = useToast();

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const question = quizQuestions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    setShowExplanation(true);
    
    if (isCorrect) {
      setScore(prev => prev + question.points);
      setStreak(prev => prev + 1);
      setBestStreak(prev => Math.max(prev, streak + 1));
      toast({
        title: "Correct! 🎉",
        description: `+${question.points} points! Streak: ${streak + 1}`,
      });
    } else {
      setStreak(0);
      toast({
        title: "Not quite right 📚",
        description: "Learn from the explanation and keep going!",
        variant: "destructive"
      });
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setGameComplete(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowExplanation(false);
    setGameComplete(false);
    setStreak(0);
    setAnsweredQuestions(new Array(quizQuestions.length).fill(false));
  };

  const getScoreLevel = () => {
    const percentage = (score / (quizQuestions.reduce((sum, q) => sum + q.points, 0))) * 100;
    if (percentage >= 90) return { level: "Trading Master", icon: <Trophy className="w-6 h-6 text-yellow-400" />, color: "text-yellow-400" };
    if (percentage >= 75) return { level: "Professional Trader", icon: <Target className="w-6 h-6 text-blue-400" />, color: "text-blue-400" };
    if (percentage >= 60) return { level: "Developing Trader", icon: <TrendingUp className="w-6 h-6 text-green-400" />, color: "text-green-400" };
    return { level: "Learning Trader", icon: <Brain className="w-6 h-6 text-purple-400" />, color: "text-purple-400" };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'psychology': return <Brain className="w-4 h-4" />;
      case 'risk': return <Shield className="w-4 h-4" />;
      case 'technical': return <TrendingUp className="w-4 h-4" />;
      case 'system': return <Target className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  if (gameComplete) {
    const scoreLevel = getScoreLevel();
    return (
      <Card className="bg-gray-900 border-gray-700 max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            {scoreLevel.icon}
            Trading Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${scoreLevel.color} mb-2`}>
              {score} Points
            </div>
            <div className={`text-xl ${scoreLevel.color} mb-4`}>
              {scoreLevel.level}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-2xl font-bold text-blue-400">{bestStreak}</div>
                <div className="text-sm text-gray-400">Best Streak</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((score / (quizQuestions.reduce((sum, q) => sum + q.points, 0))) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="font-bold text-white mb-2">Dr. Elder's Trading Wisdom</h4>
            <p className="text-gray-300 text-sm italic">
              "The goal of a successful trader is to make the best trades. Money is secondary."
            </p>
          </div>

          <Button onClick={restartGame} className="w-full bg-blue-600 hover:bg-blue-700">
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <Card className="bg-gray-900 border-gray-700 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Trading for a Living Quiz
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-blue-400">Score: {score}</div>
            <div className="text-green-400">Streak: {streak}</div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-400">
          <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
          <div className="flex items-center gap-1">
            {getCategoryIcon(question.category)}
            <span className="capitalize">{question.category}</span>
            <span className="ml-2 bg-blue-600 px-2 py-1 rounded text-xs">
              {question.points} pts
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-white font-semibold mb-4">{question.question}</h3>
          
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedAnswer === index
                    ? showExplanation
                      ? index === question.correctAnswer
                        ? 'bg-green-900 border-green-600 text-green-100'
                        : 'bg-red-900 border-red-600 text-red-100'
                      : 'bg-blue-900 border-blue-600 text-blue-100'
                    : showExplanation && index === question.correctAnswer
                    ? 'bg-green-900 border-green-600 text-green-100'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="font-semibold mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className="bg-blue-900/30 border border-blue-600/50 p-4 rounded">
            <h4 className="font-bold text-blue-400 mb-2">Explanation</h4>
            <p className="text-gray-300 text-sm">{question.explanation}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!showExplanation ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingQuizGame;
