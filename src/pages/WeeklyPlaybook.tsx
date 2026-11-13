import WeeklyPlaybook from "@/components/WeeklyPlaybook";
import PageHeader from "@/components/PageHeader";
import COTFreshnessBadge from "@/components/COTFreshnessBadge";
import DataTrustBadge from "@/components/DataTrustBadge";

const WeeklyPlaybookPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="hq-page">
        <PageHeader eyebrow="Tactical decision board" title="Weekly Playbook" subtitle="Top institutional squeezes, live sentiment, market-moving reports and 20 months of price rhythm." actions={<div className="flex flex-wrap gap-2"><DataTrustBadge /><COTFreshnessBadge /></div>} />
        <WeeklyPlaybook />
      </div>
    </div>
  );
};

export default WeeklyPlaybookPage;
