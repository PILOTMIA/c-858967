import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TelegramPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
}

const TelegramChannelFeed = () => {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelegramPosts();
  }, []);

  const fetchTelegramPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple approaches to fetch Telegram posts
      const channelUsername = "MIAFREEFOREX";
      
      // First try: Direct Telegram preview embed (limited but works)
      // Since RSS feeds are unreliable, we'll show a rich preview instead
      
      // For now, set error to show the channel showcase
      // In a full backend implementation, you could use Telegram Bot API
      setError("showcase"); // Special flag to show channel showcase
      
    } catch (err) {
      console.error("Error fetching Telegram posts:", err);
      setError("showcase");
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Latest from MIAFOREX Telegram Channel
          </CardTitle>
          <CardDescription>Loading recent posts...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error === "showcase") {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">MIA FREE FOREX Telegram Channel</CardTitle>
              <CardDescription className="text-sm mt-1">
                Real-time trading signals, market analysis & education
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-2 text-foreground">📊 What You'll Get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Daily forex market analysis and insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Live trading signals from experienced analysts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Educational content and trading strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Market news and economic calendar updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Community support with @MIA bot assistance</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-3">
                Join thousands of traders getting daily insights and signals completely free!
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('https://t.me/MIAFREEFOREX', '_blank')}
                  className="flex-1"
                  size="lg"
                >
                  Join Channel
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => window.open('https://t.me/MIAFOREX1', '_blank')}
                  variant="outline"
                  size="lg"
                >
                  Premium Channel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Latest from MIAFOREX Telegram Channel
        </CardTitle>
        <CardDescription>
          Recent trading insights and market updates from the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No recent posts available</p>
        ) : (
          posts.map((post, index) => (
            <div 
              key={index} 
              className="pb-6 border-b border-border last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.pubDate)}
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                <p className="text-foreground line-clamp-4">
                  {stripHtml(post.description || post.content)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(post.link, '_blank')}
              >
                Read Full Post
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          ))
        )}
        
        <div className="pt-4 border-t border-border">
          <Button 
            onClick={() => window.open('https://t.me/MIAFOREX1', '_blank')}
            className="w-full"
            variant="default"
          >
            Join MIAFOREX Telegram Channel
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelegramChannelFeed;
