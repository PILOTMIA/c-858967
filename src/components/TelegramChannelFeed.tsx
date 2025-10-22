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
      
      // Using RSS2JSON service to fetch public Telegram channel feed
      const channelUsername = "MIAFOREX1";
      const rssUrl = `https://t.me/s/${channelUsername}`;
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        // Filter posts from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentPosts = data.items
          .filter((item: TelegramPost) => {
            const postDate = new Date(item.pubDate);
            return postDate >= thirtyDaysAgo;
          })
          .slice(0, 5); // Show up to 5 recent posts
        
        setPosts(recentPosts);
      } else {
        setError("Unable to load channel posts");
      }
    } catch (err) {
      console.error("Error fetching Telegram posts:", err);
      setError("Failed to load posts");
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

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Latest from MIAFOREX Telegram Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.open('https://t.me/MIAFOREX1', '_blank')}
            className="w-full"
          >
            Visit Channel Directly
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
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
