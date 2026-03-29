import KnowledgeBase from "@/components/KnowledgeBase";
import ForexList from "@/components/ForexList";
import ClientLearningPath from "@/components/ClientLearningPath";
import FreeIndicatorDownload from "@/components/FreeIndicatorDownload";
import TradingQuizGame from "@/components/TradingQuizGame";
import TelegramChannelFeed from "@/components/TelegramChannelFeed";
import EconomicEducation from "@/components/EconomicEducation";
import { GraduationCap, BookOpen, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Education = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">Education</h1>
        <p className="text-muted-foreground text-base sm:text-lg font-light max-w-xl mx-auto">
          Learn forex trading from the ground up — organized by skill level
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-8">
        <TelegramChannelFeed />

        <Tabs defaultValue="beginner" className="space-y-8">
          <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/30 rounded-full p-1">
            <TabsTrigger value="beginner" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full gap-1.5 text-xs sm:text-sm transition-all">
              <GraduationCap className="h-4 w-4 hidden sm:block" /> Beginner
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full gap-1.5 text-xs sm:text-sm transition-all">
              <BookOpen className="h-4 w-4 hidden sm:block" /> Intermediate
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full gap-1.5 text-xs sm:text-sm transition-all">
              <Trophy className="h-4 w-4 hidden sm:block" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="beginner" className="space-y-8">
            <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
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

          <TabsContent value="intermediate" className="space-y-8">
            <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Intermediate — Market Analysis
              </h2>
              <p className="text-sm text-muted-foreground">
                Understand economic indicators, fundamental analysis, and how central bank decisions move markets.
              </p>
            </div>
            <EconomicEducation />
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground text-center">Test Your Knowledge</h3>
              <p className="text-sm text-muted-foreground text-center">Interactive quiz based on Dr. Elder's "Trading for a Living"</p>
              <TradingQuizGame />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-8">
            <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
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
          <a href="https://www.midasfx.com/?ib=1127736" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity duration-500">
            <img src="https://my.midasfx.com/themes/midasfx/img/b/468x60.png" alt="MidasFX Trading" className="rounded-xl max-w-[468px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Education;
