
import KnowledgeBase from "@/components/KnowledgeBase";
import ForexList from "@/components/ForexList";
import ClientLearningPath from "@/components/ClientLearningPath";

const Education = () => {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Education Center</h1>
          <p className="text-gray-300">Learn forex trading with our comprehensive resources</p>
        </div>

        {/* Knowledge Base */}
        <KnowledgeBase />

        {/* Learning Path */}
        <ClientLearningPath />

        {/* Forex List with Videos */}
        <ForexList />
      </div>
    </div>
  );
};

export default Education;
