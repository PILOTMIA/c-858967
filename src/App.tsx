
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MarketAnalysis from "./pages/MarketAnalysis";
import COTAnalysis from "./pages/COTAnalysis";
import Education from "./pages/Education";
import Community from "./pages/Community";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";
import CentralBankRates from "./pages/CentralBankRates";
import AppNavigation from "./components/AppNavigation";
import TermsAgreementModal from "./components/TermsAgreementModal";
import FirstTimeUserTutorial from "./components/FirstTimeUserTutorial";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TermsAgreementModal />
        <FirstTimeUserTutorial />
        <AppNavigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/cot-analysis" element={<COTAnalysis />} />
          <Route path="/education" element={<Education />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/central-bank-rates" element={<CentralBankRates />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
