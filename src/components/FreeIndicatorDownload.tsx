import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.string().email("Please enter a valid email address").max(255, "Email is too long");

const FreeIndicatorDownload = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    // Validate email using zod schema
    const emailValidation = emailSchema.safeParse(email.trim());
    
    if (!emailValidation.success) {
      toast({
        title: "Email Required",
        description: emailValidation.error.errors[0]?.message || "Please enter a valid email address to download the indicator.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Open Google Drive share link for download
      const shareUrl = 'https://drive.google.com/file/d/15_5u0AovYVaPhDEWJyXuhF0ayi4BCVre/view?usp=sharing';
      window.open(shareUrl, '_blank');

      setIsDownloaded(true);
      
      toast({
        title: "Download Started!",
        description: "Your download has begun. Check your downloads folder and your email for installation instructions.",
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setIsDownloaded(false);
        setEmail('');
      }, 5000);

    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-600/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-green-400" />
          Free Professional Indicator
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">FREE</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
          <h4 className="font-bold text-green-400 mb-2">🎯 Premium Trading Indicator</h4>
          <p className="text-gray-300 text-sm mb-3">
            Get our exclusive professional indicator for MetaTrader 4. This powerful tool helps identify 
            optimal entry and exit points with advanced signal accuracy.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white font-semibold text-sm">Features</span>
              </div>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>• Advanced signal detection</li>
                <li>• Multi-timeframe analysis</li>
                <li>• Custom alerts</li>
                <li>• Easy installation</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold text-sm">Compatible With</span>
              </div>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>• MetaTrader 4 (MT4)</li>
                <li>• All currency pairs</li>
                <li>• All timeframes</li>
                <li>• Windows & Mac</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-600/50 p-3 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-yellow-400 font-semibold text-sm">Installation Instructions</h5>
              <ol className="text-gray-300 text-xs mt-1 space-y-1">
                <li>1. Download the .ex4 file to your computer</li>
                <li>2. Copy file to: MetaTrader 4 → MQL4 → Indicators folder</li>
                <li>3. Restart MetaTrader 4</li>
                <li>4. Find indicator in Navigator → Custom Indicators</li>
                <li>5. Drag and drop onto your chart</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Enter your email to download:
            </label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isDownloaded}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              maxLength={255}
            />
          </div>
          
          <Button 
            onClick={handleDownload}
            disabled={isLoading || isDownloaded}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isDownloaded ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Download Complete!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Free Indicator
              </>
            )}
          </Button>
        </div>

        <p className="text-gray-400 text-xs text-center">
          Your email will be stored securely and used only for sending you the download link and occasional trading tips.
        </p>
      </CardContent>
    </Card>
  );
};

export default FreeIndicatorDownload;
