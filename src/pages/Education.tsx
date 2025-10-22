
import KnowledgeBase from "@/components/KnowledgeBase";
import ForexList from "@/components/ForexList";
import ClientLearningPath from "@/components/ClientLearningPath";
import FreeIndicatorDownload from "@/components/FreeIndicatorDownload";
import TradingQuizGame from "@/components/TradingQuizGame";
import TelegramChannelFeed from "@/components/TelegramChannelFeed";

const Education = () => {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Education Center</h1>
          <p className="text-gray-300">Learn forex trading with our comprehensive resources</p>
        </div>

        {/* Telegram Channel Feed */}
        <TelegramChannelFeed />

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

        {/* MidasFX Banner */}
        <div className="mt-8 flex justify-center">
          <a 
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity duration-300 shadow-lg hover:shadow-xl rounded-lg overflow-hidden"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX - Professional Forex Trading"
              className="w-full h-auto max-w-[468px]"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Education;
