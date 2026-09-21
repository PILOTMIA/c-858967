import WeeklyPlaybook from "@/components/WeeklyPlaybook";
import PageHeader from "@/components/PageHeader";
import COTFreshnessBadge from "@/components/COTFreshnessBadge";

const WeeklyPlaybookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="hq-page">
        <PageHeader eyebrow="Tactical decision board" title="Weekly Playbook" subtitle="Top institutional squeezes, live sentiment, market-moving reports and 20 months of price rhythm." actions={<COTFreshnessBadge />} />
        <WeeklyPlaybook />
      </div>
    </div>
  );
};

export default WeeklyPlaybookPage;
