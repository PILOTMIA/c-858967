import WeeklyPlaybook from "@/components/WeeklyPlaybook";

const WeeklyPlaybookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-12 pb-8 text-center">
        <h1 className="font-display-hero text-4xl sm:text-5xl font-bold text-foreground mb-3">
          Weekly Playbook
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl mx-auto">
          Where each market is likely headed based on the latest COT positioning — and which day of the week it
          historically moves, from 20 months of daily price data.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <WeeklyPlaybook />
      </div>
    </div>
  );
};

export default WeeklyPlaybookPage;
