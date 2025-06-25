
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FedData {
  currentRate: number;
  nextMeetingDate: string;
  probabilities: {
    rateCut: number;
    rateHold: number;
    rateHike: number;
  };
  sentiment: 'DOVISH' | 'HAWKISH' | 'NEUTRAL';
  nextRateChange: number;
}

const fetchFedData = async (): Promise<FedData> => {
  // Mock data - in real implementation, this would fetch from Fed API or CME data
  return {
    currentRate: 5.25,
    nextMeetingDate: "2024-12-18",
    probabilities: {
      rateCut: 75.2,
      rateHold: 20.1,
      rateHike: 4.7
    },
    sentiment: 'DOVISH',
    nextRateChange: -0.25
  };
};

const FedWatchTool = () => {
  const { data: fedData, isLoading } = useQuery({
    queryKey: ['fedWatch'],
    queryFn: fetchFedData,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">FED Watch Tool</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'DOVISH':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'HAWKISH':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">FED Watch Tool</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Current Fed Funds Rate</h3>
          <div className="text-3xl font-bold text-blue-500">
            {fedData?.currentRate}%
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              Fed Sentiment
              {getSentimentIcon(fedData?.sentiment || '')}
            </h4>
            <span className={`px-3 py-1 rounded-full text-sm ${
              fedData?.sentiment === 'DOVISH' ? 'bg-red-100 text-red-800' :
              fedData?.sentiment === 'HAWKISH' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {fedData?.sentiment}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Next Meeting Probabilities</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Rate Cut</span>
                <span className="text-sm font-bold text-red-500">
                  {fedData?.probabilities.rateCut}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${fedData?.probabilities.rateCut}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Rate Hold</span>
                <span className="text-sm font-bold text-gray-500">
                  {fedData?.probabilities.rateHold}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full" 
                  style={{ width: `${fedData?.probabilities.rateHold}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Rate Hike</span>
                <span className="text-sm font-bold text-green-500">
                  {fedData?.probabilities.rateHike}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${fedData?.probabilities.rateHike}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Next Meeting: {fedData?.nextMeetingDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FedWatchTool;
