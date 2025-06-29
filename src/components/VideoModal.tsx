
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencyPair: string;
}

const VideoModal = ({ isOpen, onClose, currencyPair }: VideoModalProps) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // YouTube video mappings for Daily Forex channel content
  const getVideoForPair = (pair: string) => {
    const videoMappings: { [key: string]: { id: string; title: string } } = {
      'EUR/USD': { 
        id: 'dQw4w9WgXcQ', // Replace with actual Daily Forex video IDs
        title: 'EUR/USD Analysis - Daily Forex Tutorial'
      },
      'GBP/USD': { 
        id: 'dQw4w9WgXcQ', 
        title: 'GBP/USD Trading Strategy - Daily Forex'
      },
      'USD/JPY': { 
        id: 'dQw4w9WgXcQ', 
        title: 'USD/JPY Market Analysis - Daily Forex'
      },
      'USD/CHF': { 
        id: 'dQw4w9WgXcQ', 
        title: 'USD/CHF Trading Guide - Daily Forex'
      },
      'AUD/USD': { 
        id: 'dQw4w9WgXcQ', 
        title: 'AUD/USD Analysis - Daily Forex'
      },
      'USD/CAD': { 
        id: 'dQw4w9WgXcQ', 
        title: 'USD/CAD Trading - Daily Forex'
      },
      'XAUUSD': { 
        id: 'dQw4w9WgXcQ', 
        title: 'Gold Trading Analysis - Daily Forex'
      },
      'XTIUSD': { 
        id: 'dQw4w9WgXcQ', 
        title: 'Oil Trading Strategy - Daily Forex'
      }
    };

    return videoMappings[pair] || { 
      id: 'dQw4w9WgXcQ', 
      title: `${pair} Analysis - Daily Forex Tutorial`
    };
  };

  useEffect(() => {
    if (isOpen && currencyPair) {
      setLoading(true);
      const video = getVideoForPair(currencyPair);
      setVideoData(video);
      setLoading(false);
    }
  }, [isOpen, currencyPair]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            📚 {currencyPair} Educational Content
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Loading video...</div>
            </div>
          ) : videoData ? (
            <div className="space-y-4">
              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  🎯 From Daily Forex Channel
                </h3>
                <p className="text-gray-300 text-sm">
                  Watch this educational content to deepen your understanding of {currencyPair} trading strategies and market analysis.
                </p>
              </div>
              
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoData.id}?rel=0`}
                  title={videoData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="text-white font-semibold mb-2">{videoData.title}</h4>
                <p className="text-gray-400 text-sm">
                  Educational content from Daily Forex YouTube channel. 
                  Learn key concepts, strategies, and market insights for {currencyPair}.
                </p>
              </div>
              
              <div className="bg-yellow-900/20 p-4 rounded border border-yellow-500/30">
                <p className="text-yellow-200 text-sm">
                  💡 <strong>Pro Tip:</strong> Take notes while watching and apply these concepts 
                  to your own trading analysis. Knowledge + Practice = Success!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              No video available for this currency pair.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
