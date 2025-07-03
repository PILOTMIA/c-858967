
import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import BrandingSection from "@/components/BrandingSection";
import ChatBot from "@/components/ChatBot";
import TermsAgreementModal from "@/components/TermsAgreementModal";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TermsAgreementModal />
      
      {/* Command Center Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/de01d78a-6a09-4e50-9bf9-dca6ec9d1924.png" 
                alt="Men In Action LLC" 
                className="h-24 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Trading Command Center</h1>
                <p className="text-gray-300 text-sm">Men In Action LLC - Live Market Analysis & Education</p>
              </div>
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
        {/* Hero Section with Logo */}
        <div className="text-center py-12 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl border border-gray-700">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/de01d78a-6a09-4e50-9bf9-dca6ec9d1924.png" 
              alt="Men In Action LLC" 
              className="h-80 w-auto max-w-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to Your Trading Hub</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Professional forex analysis, education, and community all in one place. 
            Transform your trading journey with expert guidance and real-time market insights.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/education')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Start Learning Today
            </button>
            <button 
              onClick={() => navigate('/market-analysis')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors border border-gray-600"
            >
              View Live Analysis
            </button>
          </div>
        </div>

        {/* Market Stats */}
        <MarketStats />

        {/* Branding Section */}
        <BrandingSection />

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate('/market-analysis')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Market Analysis</h3>
            <p className="text-gray-300 text-sm">Real-time charts, heat maps, and professional analysis from our expert team</p>
          </div>
          
          <div 
            onClick={() => navigate('/education')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Education Center</h3>
            <p className="text-gray-300 text-sm">Learn forex trading with comprehensive guides and video tutorials</p>
          </div>
          
          <div 
            onClick={() => navigate('/community')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Community</h3>
            <p className="text-gray-300 text-sm">Join our exclusive trading community and get premium signals</p>
          </div>
        </div>

        {/* VIP Signal Access */}
        <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 p-8 rounded-xl text-center border border-green-700 shadow-xl">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-3xl font-bold text-white mb-4">VIP Signal Access</h2>
          <p className="text-green-100 mb-6 text-lg">
            Get premium trading signals and expert analysis delivered directly to you
          </p>
          <ClientSignup />
        </div>

        {/* Professional Footer */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/de01d78a-6a09-4e50-9bf9-dca6ec9d1924.png" 
              alt="Men In Action LLC" 
              className="h-20 w-auto opacity-75"
            />
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Men In Action LLC. Professional Trading Education & Analysis.
          </p>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Index;
