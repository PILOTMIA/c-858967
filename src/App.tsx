
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import MarketAnalysis from "./pages/MarketAnalysis";
import COTAnalysis from "./pages/COTAnalysis";
import Education from "./pages/Education";
import Community from "./pages/Community";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";
import CentralBankRates from "./pages/CentralBankRates";
import EconomicRadar from "./pages/EconomicRadar";
import AppNavigation from "./components/AppNavigation";
import TradingViewBanner from "./components/TradingViewBanner";
import TermsAgreementModal from "./components/TermsAgreementModal";
import FirstTimeUserTutorial from "./components/FirstTimeUserTutorial";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <TradingViewBanner />
            <div className="pt-[46px]">
              <TermsAgreementModal />
              <FirstTimeUserTutorial />
              <AppNavigation />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                <Route path="/market-analysis" element={<PageTransition><MarketAnalysis /></PageTransition>} />
                <Route path="/cot-analysis" element={<PageTransition><COTAnalysis /></PageTransition>} />
                <Route path="/economic-radar" element={<PageTransition><EconomicRadar /></PageTransition>} />
                <Route path="/education" element={<PageTransition><Education /></PageTransition>} />
                <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
                <Route path="/tools" element={<PageTransition><Tools /></PageTransition>} />
                <Route path="/central-bank-rates" element={<PageTransition><CentralBankRates /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
