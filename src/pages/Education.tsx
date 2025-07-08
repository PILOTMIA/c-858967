
import KnowledgeBase from "@/components/KnowledgeBase";
import ForexList from "@/components/ForexList";
import ClientLearningPath from "@/components/ClientLearningPath";
import FreeIndicatorDownload from "@/components/FreeIndicatorDownload";
import TradingQuizGame from "@/components/TradingQuizGame";

const Education = () => {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Education Center</h1>
          <p className="text-gray-300">Learn forex trading with our comprehensive resources</p>
        </div>

        {/* Trading Quiz Game */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🎮 Test Your Trading Knowledge</h2>
          <p className="text-gray-300 text-center mb-6">Interactive quiz based on Dr. Elder's "Trading for a Living"</p>
          <TradingQuizGame />
        </div>

        {/* Knowledge Base */}
        <KnowledgeBase />

        {/* Learning Path */}
        <ClientLearningPath />

        {/* Free Indicator Download */}
        <FreeIndicatorDownload />

        {/* Forex List */}
        <ForexList />
      </div>
    </div>
  );
};

export default Education;
