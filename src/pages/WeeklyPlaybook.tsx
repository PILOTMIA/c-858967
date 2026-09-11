import WeeklyPlaybook from "@/components/WeeklyPlaybook";

const WeeklyPlaybookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">
          Weekly Playbook
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl mx-auto">
          Top institutional squeezes, live news sentiment, market-moving reports, and 20 months of price rhythm in one weekly decision board.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <WeeklyPlaybook />
      </div>
    </div>
  );
};

export default WeeklyPlaybookPage;
