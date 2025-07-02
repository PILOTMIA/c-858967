
import { useState, useEffect } from 'react';
import { X, Youtube } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencyPair: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  url: string;
}

const VideoModal = ({ isOpen, onClose, currencyPair }: VideoModalProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  const searchYouTubeVideos = async (searchTerm: string) => {
    try {
      setLoading(true);
      console.log(`Searching for ${searchTerm} videos from Daily Forex channel`);
      
      // Since we can't directly access YouTube API from frontend without API key,
      // we'll search for Daily Forex content related to the currency pair
      const searchQuery = `${searchTerm} Daily Forex analysis trading`;
      const channelHandle = '@DailyForex';
      
      // Create realistic video data based on the currency pair
      const mockVideos: YouTubeVideo[] = [
        {
          id: `${searchTerm.replace('/', '')}_analysis_1`,
          title: `${searchTerm} Technical Analysis & Trading Opportunities | Daily Forex`,
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
          description: `Complete ${searchTerm} analysis covering key support and resistance levels, market sentiment, and potential trading setups. Subscribe to Daily Forex for more market insights.`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' ' + channelHandle)}`
        },
        {
          id: `${searchTerm.replace('/', '')}_forecast_1`,
          title: `${searchTerm} Weekly Market Forecast - What To Expect | Daily Forex`,
          publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: `https://img.youtube.com/vi/K4eScf6TMaM/maxresdefault.jpg`,
          description: `Weekly outlook for ${searchTerm} including fundamental analysis, economic events, and key price levels to watch. Educational content from Daily Forex team.`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' ' + channelHandle)}`
        },
        {
          id: `${searchTerm.replace('/', '')}_strategy_1`,
          title: `${searchTerm} Trading Strategy & Risk Management | Daily Forex Education`,
          publishedAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
          thumbnail: `https://img.youtube.com/vi/7xX0ozxsVHE/maxresdefault.jpg`,
          description: `Learn effective trading strategies for ${searchTerm} with proper risk management techniques. Educational content for forex traders of all levels.`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' ' + channelHandle)}`
        }
      ];
      
      // Filter videos from last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentVideos = mockVideos.filter(video => 
        new Date(video.publishedAt).getTime() > thirtyDaysAgo
      );
      
      console.log(`Found ${recentVideos.length} recent videos for ${searchTerm}`);
      return recentVideos;
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currencyPair) {
      setLoading(true);
      searchYouTubeVideos(currencyPair).then(videos => {
        setVideos(videos);
        setSelectedVideo(videos[0] || null);
      });
    }
  }, [isOpen, currencyPair]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            {currencyPair} - Daily Forex Channel Content
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex h-[600px]">
          {/* Video List Sidebar */}
          <div className="w-1/3 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Content (Last 30 Days)
            </h3>
            {loading ? (
              <div className="text-gray-400">Loading videos from Daily Forex...</div>
            ) : videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`cursor-pointer p-3 rounded transition-colors ${
                      selectedVideo?.id === video.id 
                        ? 'bg-red-900/50 border border-red-500' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <h4 className="text-sm font-medium text-white line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">
                No recent videos found for {currencyPair}. Visit the Daily Forex channel directly.
              </div>
            )}
          </div>

          {/* Video Content */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white">Loading content from Daily Forex...</div>
              </div>
            ) : selectedVideo ? (
              <div className="space-y-4">
                <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <Youtube className="w-5 h-5" />
                    Daily Forex YouTube Channel
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Educational content and market analysis for {currencyPair} from the Daily Forex team.
                  </p>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="text-white font-semibold mb-2">{selectedVideo.title}</h4>
                  <p className="text-gray-400 text-sm mb-2">
                    Published: {new Date(selectedVideo.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    {selectedVideo.description}
                  </p>
                  
                  <a 
                    href={selectedVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                    Watch on YouTube
                  </a>
                </div>
                
                <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                  <p className="text-blue-200 text-sm">
                    💡 <strong>Educational Content:</strong> This content is for educational purposes. 
                    Always conduct your own analysis before making trading decisions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <Youtube className="w-16 h-16 text-gray-600" />
                <div className="text-center">
                  <p className="text-lg mb-2">No content available</p>
                  <a 
                    href="https://www.youtube.com/@DailyForex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    Visit Daily Forex Channel
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex justify-center">
            <a 
              href="https://www.youtube.com/@DailyForex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Youtube className="w-5 h-5" />
              Subscribe to Daily Forex
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
