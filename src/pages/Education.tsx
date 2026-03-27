import { useState } from "react";
import KnowledgeBase from "@/components/KnowledgeBase";
import ForexList from "@/components/ForexList";
import ClientLearningPath from "@/components/ClientLearningPath";
import FreeIndicatorDownload from "@/components/FreeIndicatorDownload";
import TradingQuizGame from "@/components/TradingQuizGame";
import TelegramChannelFeed from "@/components/TelegramChannelFeed";
import EconomicEducation from "@/components/EconomicEducation";
import { BookOpen, GraduationCap, Trophy, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Education = () => {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Education Center</h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Learn forex trading from the ground up — organized by skill level so you always know what to study next.
          </p>
        </div>

        {/* Telegram Feed */}
        <TelegramChannelFeed />

        {/* Skill Level Tabs */}
        <Tabs defaultValue="beginner" className="space-y-6">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-muted">
            <TabsTrigger value="beginner" className="data-[state=active]:bg-green-600 data-[state=active]:text-white gap-1.5 text-xs sm:text-sm">
              <GraduationCap className="h-4 w-4 hidden sm:block" /> Beginner
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 hidden sm:block" /> Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-1.5 text-xs sm:text-sm">
              <Trophy className="h-4 w-4 hidden sm:block" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beginner" className="space-y-6">
            <div className="p-4 bg-green-900/10 border border-green-700/30 rounded-lg">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-400" />
                Beginner — Foundations
              </h2>
              <p className="text-sm text-muted-foreground">
                Start here if you're new to forex. Learn the basics of currency pairs, market structure, and trading terminology.
              </p>
            </div>
            <KnowledgeBase />
            <ForexList />
            <ClientLearningPath />
          </TabsContent>

          <TabsContent value="intermediate" className="space-y-6">
            <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded-lg">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Intermediate — Market Analysis
              </h2>
              <p className="text-sm text-muted-foreground">
                Understand economic indicators, fundamental analysis, and how central bank decisions move markets.
              </p>
            </div>
            <EconomicEducation />
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground text-center">🎮 Test Your Knowledge</h3>
              <p className="text-sm text-muted-foreground text-center">Interactive quiz based on Dr. Elder's "Trading for a Living"</p>
              <TradingQuizGame />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="p-4 bg-purple-900/10 border border-purple-700/30 rounded-lg">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-400" />
                Advanced — Professional Tools
              </h2>
              <p className="text-sm text-muted-foreground">
                Professional-grade tools, custom indicators, and advanced techniques used by institutional traders.
              </p>
            </div>
            <FreeIndicatorDownload />
          </TabsContent>
        </Tabs>

        {/* MidasFX Banner */}
        <div className="flex justify-center pt-4">
          <a 
            href="https://www.midasfx.com/?ib=1127736"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <img 
              src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" 
              alt="MidasFX - Professional Forex Trading"
              className="rounded-lg border border-border max-w-[468px]"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Education;
