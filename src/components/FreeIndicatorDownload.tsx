import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email("Please enter a valid email address").max(255, "Email is too long");

const FreeIndicatorDownload = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
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
      // Save email to database
      const { error } = await supabase
        .from('indicator_downloads')
        .insert({
          email: email.trim(),
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error saving email:', error);
      }

      // Open Google Drive share link for download
      const shareUrl = 'https://drive.google.com/file/d/15_5u0AovYVaPhDEWJyXuhF0ayi4BCVre/view?usp=sharing';
      window.open(shareUrl, '_blank');

      setIsDownloaded(true);
      
      toast({
        title: "Download Started!",
        description: "Your download has begun. Check your downloads folder for installation instructions.",
      });

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
    <Card className="rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 font-display-hero text-xl">
          <Download className="w-5 h-5 text-emerald-400" />
          Free Professional Indicator
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium">FREE</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl bg-muted/30 p-5 border border-border/20">
          <h4 className="font-semibold text-emerald-400 mb-2 text-sm">🎯 Premium Trading Indicator</h4>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            Get our exclusive professional indicator for MetaTrader 4. This powerful tool helps identify 
            optimal entry and exit points with advanced signal accuracy.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg bg-background/50 p-3 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-foreground font-medium text-sm">Features</span>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• Advanced signal detection</li>
                <li>• Multi-timeframe analysis</li>
                <li>• Custom alerts</li>
                <li>• Easy installation</li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-background/50 p-3 border border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium text-sm">Compatible With</span>
              </div>
              <ul className="text-muted-foreground text-xs space-y-1">
                <li>• MetaTrader 4 (MT4)</li>
                <li>• All currency pairs</li>
                <li>• All timeframes</li>
                <li>• Windows & Mac</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-amber-400 font-semibold text-sm">Installation Instructions</h5>
              <ol className="text-muted-foreground text-xs mt-1.5 space-y-1">
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
            <label className="block text-foreground text-sm font-medium mb-2">
              Enter your email to download:
            </label>
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isDownloaded}
              className="bg-background/50 border-border/30 text-foreground placeholder:text-muted-foreground rounded-xl"
              maxLength={255}
            />
          </div>
          
          <Button 
            onClick={handleDownload}
            disabled={isLoading || isDownloaded}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all"
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

        <p className="text-muted-foreground text-xs text-center">
          Your email will be stored securely and used only for sending you occasional trading tips.
        </p>
      </CardContent>
    </Card>
  );
};

export default FreeIndicatorDownload;
