
import MarketStats from "@/components/MarketStats";
import ClientSignup from "@/components/ClientSignup";
import BrandingSection from "@/components/BrandingSection";
import ChatBot from "@/components/ChatBot";
import CustomerServiceChat from "@/components/CustomerServiceChat";
import BrokerRecommendations from "@/components/BrokerRecommendations";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Command Center Header */}
      <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-40 relative overflow-hidden">
        {/* Vector Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-full h-full max-w-4xl">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full">
              <defs>
                <linearGradient id="headerCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#22C55E', stopOpacity: 0.8}} />
                  <stop offset="50%" style={{stopColor: '#16A34A', stopOpacity: 0.6}} />
                  <stop offset="100%" style={{stopColor: '#15803D', stopOpacity: 0.4}} />
                </linearGradient>
                <linearGradient id="headerTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: '#9CA3AF'}} />
                  <stop offset="20%" style={{stopColor: '#22C55E'}} />
                  <stop offset="35%" style={{stopColor: '#9CA3AF'}} />
                  <stop offset="85%" style={{stopColor: '#22C55E'}} />
                  <stop offset="100%" style={{stopColor: '#22C55E'}} />
                </linearGradient>
              </defs>
              
              {/* Outer circle ring */}
              <circle cx="200" cy="150" r="80" fill="none" stroke="#6B7280" strokeWidth="8" opacity="0.6"/>
              
              {/* Green accent arcs */}
              <path d="M 140 90 A 80 80 0 0 1 260 90" fill="none" stroke="url(#headerCircleGradient)" strokeWidth="12" strokeLinecap="round"/>
              <path d="M 140 210 A 80 80 0 0 0 260 210" fill="none" stroke="url(#headerCircleGradient)" strokeWidth="12" strokeLinecap="round"/>
              
              {/* MIA letters in circle */}
              <g transform="translate(200, 150)">
                <rect x="-45" y="-25" width="12" height="50" fill="#6B7280"/>
                <rect x="-28" y="-25" width="12" height="50" fill="#6B7280"/>
                <rect x="-40" y="-20" width="25" height="8" fill="#6B7280"/>
                <rect x="-5" y="-25" width="12" height="50" fill="#22C55E"/>
                <rect x="18" y="-25" width="12" height="50" fill="#6B7280"/>
                <rect x="35" y="-25" width="12" height="50" fill="#6B7280"/>
                <rect x="23" y="-20" width="19" height="8" fill="#6B7280"/>
                <rect x="23" y="0" width="19" height="8" fill="#6B7280"/>
              </g>
              
              {/* Company text */}
              <text x="50" y="280" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="url(#headerTextGradient)">
                MEN IN ACTION LLC
              </text>
              
              {/* Decorative elements */}
              <circle cx="50" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
              <circle cx="750" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
              <circle cx="50" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
              <circle cx="750" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
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

        <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Hero Section with Vector Logo Background */}
        <div className="relative overflow-hidden text-center py-12 sm:py-16 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl border border-gray-700">
          {/* Vector Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-full h-full max-w-6xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full">
                <defs>
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#22C55E', stopOpacity: 0.8}} />
                    <stop offset="50%" style={{stopColor: '#16A34A', stopOpacity: 0.6}} />
                    <stop offset="100%" style={{stopColor: '#15803D', stopOpacity: 0.4}} />
                  </linearGradient>
                  <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#9CA3AF'}} />
                    <stop offset="20%" style={{stopColor: '#22C55E'}} />
                    <stop offset="35%" style={{stopColor: '#9CA3AF'}} />
                    <stop offset="85%" style={{stopColor: '#22C55E'}} />
                    <stop offset="100%" style={{stopColor: '#22C55E'}} />
                  </linearGradient>
                </defs>
                
                {/* Outer circle ring */}
                <circle cx="200" cy="150" r="80" fill="none" stroke="#6B7280" strokeWidth="8" opacity="0.6"/>
                
                {/* Green accent arcs */}
                <path d="M 140 90 A 80 80 0 0 1 260 90" fill="none" stroke="url(#circleGradient)" strokeWidth="12" strokeLinecap="round"/>
                <path d="M 140 210 A 80 80 0 0 0 260 210" fill="none" stroke="url(#circleGradient)" strokeWidth="12" strokeLinecap="round"/>
                
                {/* MIA letters in circle */}
                <g transform="translate(200, 150)">
                  <rect x="-45" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="-28" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="-40" y="-20" width="25" height="8" fill="#6B7280"/>
                  <rect x="-5" y="-25" width="12" height="50" fill="#22C55E"/>
                  <rect x="18" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="35" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="23" y="-20" width="19" height="8" fill="#6B7280"/>
                  <rect x="23" y="0" width="19" height="8" fill="#6B7280"/>
                </g>
                
                {/* Company text */}
                <text x="50" y="280" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="url(#textGradient)">
                  MEN IN ACTION LLC
                </text>
                
                {/* Decorative elements */}
                <circle cx="50" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="750" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="50" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="750" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
              </svg>
            </div>
          </div>
          
          {/* Content over logo */}
          <div className="relative z-10 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Welcome to Your Trading Hub</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Professional forex analysis, education, and community all in one place. 
              Transform your trading journey with expert guidance and real-time market insights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <button 
              onClick={() => navigate('/education')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors shadow-lg text-sm sm:text-base"
            >
              Start Learning Today
            </button>
            <a 
              href="https://www.youtube.com/@ForexToday/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold transition-colors border border-gray-600 inline-block text-center text-sm sm:text-base"
            >
              View Live Analysis
            </a>
          </div>
        </div>

        {/* Market Stats */}
        <MarketStats />

        {/* Branding Section */}
        <BrandingSection />

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div 
            onClick={() => navigate('/market-analysis')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📊</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Market Analysis</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Real-time charts, heat maps, and professional analysis from our expert team</p>
          </div>
          
          <div 
            onClick={() => navigate('/cot-analysis')}
            className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 sm:p-6 rounded-lg hover:from-purple-800 hover:to-purple-700 transition-all duration-300 cursor-pointer border border-purple-700 shadow-lg"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎯</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">COT Analysis</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Follow the smart money with Commitment of Traders data and institutional positioning</p>
          </div>
          
          <div 
            onClick={() => navigate('/education')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📚</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Education Center</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Learn forex trading with comprehensive guides and video tutorials</p>
          </div>
          
          <div 
            onClick={() => navigate('/community')}
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 cursor-pointer border border-gray-700 shadow-lg"
          >
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">👥</div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">Community</h3>
            <p className="text-gray-300 text-xs sm:text-sm">Join our exclusive trading community and get premium signals</p>
          </div>
        </div>

        {/* Broker Recommendations */}
        <BrokerRecommendations />

        {/* VIP Signal Access */}
        <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 p-6 sm:p-8 rounded-xl text-center border border-green-700 shadow-xl">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎯</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">VIP Signal Access</h2>
          <p className="text-green-100 mb-4 sm:mb-6 text-base sm:text-lg">
            Get premium trading signals and expert analysis delivered directly to you
          </p>
          <ClientSignup />
        </div>

        {/* MidasFX Banner - Professional Placement */}
        <div className="flex justify-center my-8">
          <a 
            href="https://www.midasfx.com/?ib=1127736" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX Trading - Premium Forex Broker" 
              className="rounded-lg border-2 border-gray-700 shadow-lg hover:shadow-xl hover:border-primary/50"
            />
          </a>
        </div>

        {/* Modern Professional Footer */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 rounded-xl border border-gray-700 shadow-2xl">
          {/* Vector Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15">
            <div className="w-full h-full max-w-5xl">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" className="w-full h-full">
                <defs>
                  <linearGradient id="footerCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#22C55E', stopOpacity: 0.8}} />
                    <stop offset="50%" style={{stopColor: '#16A34A', stopOpacity: 0.6}} />
                    <stop offset="100%" style={{stopColor: '#15803D', stopOpacity: 0.4}} />
                  </linearGradient>
                  <linearGradient id="footerTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#9CA3AF'}} />
                    <stop offset="20%" style={{stopColor: '#22C55E'}} />
                    <stop offset="35%" style={{stopColor: '#9CA3AF'}} />
                    <stop offset="85%" style={{stopColor: '#22C55E'}} />
                    <stop offset="100%" style={{stopColor: '#22C55E'}} />
                  </linearGradient>
                </defs>
                
                {/* Outer circle ring */}
                <circle cx="200" cy="150" r="80" fill="none" stroke="#6B7280" strokeWidth="8" opacity="0.6"/>
                
                {/* Green accent arcs */}
                <path d="M 140 90 A 80 80 0 0 1 260 90" fill="none" stroke="url(#footerCircleGradient)" strokeWidth="12" strokeLinecap="round"/>
                <path d="M 140 210 A 80 80 0 0 0 260 210" fill="none" stroke="url(#footerCircleGradient)" strokeWidth="12" strokeLinecap="round"/>
                
                {/* MIA letters in circle */}
                <g transform="translate(200, 150)">
                  <rect x="-45" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="-28" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="-40" y="-20" width="25" height="8" fill="#6B7280"/>
                  <rect x="-5" y="-25" width="12" height="50" fill="#22C55E"/>
                  <rect x="18" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="35" y="-25" width="12" height="50" fill="#6B7280"/>
                  <rect x="23" y="-20" width="19" height="8" fill="#6B7280"/>
                  <rect x="23" y="0" width="19" height="8" fill="#6B7280"/>
                </g>
                
                {/* Company text */}
                <text x="50" y="280" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="bold" fill="url(#footerTextGradient)">
                  MEN IN ACTION LLC
                </text>
                
                {/* Decorative elements */}
                <circle cx="50" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="750" cy="50" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="50" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
                <circle cx="750" cy="350" r="3" fill="#22C55E" opacity="0.6"/>
              </svg>
            </div>
          </div>
          
          {/* Content over logo */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-6 border border-green-500/30">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              Men In Action LLC
            </h3>
            <p className="text-gray-300 text-lg mb-4">Professional Trading Education & Analysis</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>© 2024 • Empowering Traders Worldwide</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
      <CustomerServiceChat />
    </div>
  );
};

export default Index;
