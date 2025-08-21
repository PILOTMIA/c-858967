
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MarketAnalysis from "./pages/MarketAnalysis";
import Education from "./pages/Education";
import Community from "./pages/Community";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";
import CentralBankRates from "./pages/CentralBankRates";
import AppNavigation from "./components/AppNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppNavigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market-analysis" element={<MarketAnalysis />} />
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
