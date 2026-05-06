import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Calendar, Clock, Globe, Newspaper, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchMarketNews, type MarketNewsArticle } from '@/services/MarketNewsService';

const getSentimentIcon = (sentiment: string) => {
  if (sentiment === 'BULLISH' || sentiment === 'bullish') return <TrendingUp className="h-5 w-5 text-success" />;
  if (sentiment === 'BEARISH' || sentiment === 'bearish') return <TrendingDown className="h-5 w-5 text-destructive" />;
  return <AlertCircle className="h-5 w-5 text-warning" />;
};

const getSentimentColor = (sentiment: string) => {
  if (sentiment === 'BULLISH' || sentiment === 'bullish') return 'border-success/40 bg-success/15 text-success';
  if (sentiment === 'BEARISH' || sentiment === 'bearish') return 'border-destructive/40 bg-destructive/15 text-destructive';
  return 'border-warning/40 bg-warning/15 text-warning';
};

const NewsArticleRow = ({ article }: { article: MarketNewsArticle }) => (
  <article className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/60">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <Badge className={`${getSentimentColor(article.sentiment)} text-sm`}>{article.sentiment.toUpperCase()}</Badge>
      <Badge variant="outline" className="border-border text-sm text-foreground">{article.impact} Impact</Badge>
      <Badge variant="outline" className="border-border text-sm text-foreground">{article.category}</Badge>
    </div>
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
      {article.title}
    </a>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.analysis || article.description}</p>
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-foreground hover:text-primary">
        <Globe className="h-4 w-4" />
        {article.domain || article.source}
      </a>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        {new Date(article.publishedAt).toLocaleString()}
      </span>
      <span className="font-medium text-foreground">Confidence {article.confidence}%</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      {article.pairs.map((pair) => (
        <Badge key={pair} variant="outline" className="border-border text-sm font-mono text-foreground">{pair}</Badge>
      ))}
    </div>
  </article>
);

const NewsSentimentAnalysis = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['marketNewsLive'],
    queryFn: fetchMarketNews,
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
  });

  if (error) {
    return (
      <Card className="border-border bg-card text-card-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">Failed to load live news sentiment. The page will retry automatically.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const articles = data?.articles || [];
  const visibleArticles = isExpanded ? articles : articles.slice(0, 6);

  return (
    <Card className="border-border bg-card text-card-foreground">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-foreground">
              <Newspaper className="h-5 w-5 text-primary" />
              Market News Sentiment — Live
            </CardTitle>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Live market headlines with source links, refreshed automatically and scheduled for 2:00 PM and 3:00 PM Arizona checks.
            </p>
           </div>
           {dataUpdatedAt > 0 && (
             <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
               <Clock className="h-3 w-3" />
               Last updated: {new Date(dataUpdatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
             </div>
           )}
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 rounded-lg bg-muted" />
            <div className="h-40 rounded-lg bg-muted" />
          </div>
        ) : (
          <>
            <div className={`rounded-lg border p-5 ${getSentimentColor(data?.overall || 'NEUTRAL')}`}>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {getSentimentIcon(data?.overall || 'NEUTRAL')}
                  <span className="text-xl font-bold text-foreground">Overall: {data?.overall}</span>
                </div>
                <span className="text-2xl font-bold text-foreground">{Math.round((data?.score || 0) * 100)}%</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{data?.summary}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Source: {data?.source === 'gdelt_live' ? 'GDELT live news API' : 'Verified fallback'} • Last fetched {data?.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : 'now'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(data?.majorPairs || {}).map(([pair, pairData]) => (
                <div key={pair} className={`rounded-lg border p-4 ${getSentimentColor(pairData.sentiment)}`}>
                  <div className="text-center">
                    <div className="mb-2 font-mono text-lg font-bold text-foreground">{pair}</div>
                    <div className="mb-2 flex items-center justify-center gap-2">
                      {getSentimentIcon(pairData.sentiment)}
                      <span className="text-sm font-semibold text-foreground">{pairData.sentiment}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{pairData.mentions} live mentions</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-foreground">Latest Market Headlines</h4>
                {articles.length > 6 && (
                  <button onClick={() => setIsExpanded(!isExpanded)} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    {isExpanded ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>
              {visibleArticles.map((article) => <NewsArticleRow key={article.id} article={article} />)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsSentimentAnalysis;
