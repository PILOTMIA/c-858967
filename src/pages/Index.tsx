
import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import BrandingSection from "@/components/BrandingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Command Center Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Trading Command Center</h1>
              <p className="text-gray-300 text-sm">Men In Action LLC - Live Market Analysis & Education</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-green-400 text-sm font-mono">
                LIVE • {new Date().toLocaleTimeString()}
              </div>
              <ClientSignup />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to Your Trading Hub</h2>
          <p className="text-gray-300 text-lg mb-6">Professional forex analysis, education, and community all in one place</p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Start Learning
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              View Analysis
            </button>
          </div>
        </div>

        {/* Market Stats */}
        <MarketStats />

        {/* Branding Section */}
        <BrandingSection />

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <h3 className="text-xl font-bold text-white mb-2">📊 Market Analysis</h3>
            <p className="text-gray-300 text-sm">Real-time charts, heat maps, and professional analysis</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <h3 className="text-xl font-bold text-white mb-2">📚 Education Center</h3>
            <p className="text-gray-300 text-sm">Learn forex trading with videos and comprehensive guides</p>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <h3 className="text-xl font-bold text-white mb-2">👥 Community</h3>
            <p className="text-gray-300 text-sm">Join our trading community and get premium signals</p>
          </div>
        </div>

        {/* VIP Signal Access */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-2">🎯 VIP Signal Access</h2>
          <p className="text-gray-200 mb-4">Get premium trading signals and expert analysis</p>
          <ClientSignup />
        </div>
      </div>
    </div>
  );
};

export default Index;
