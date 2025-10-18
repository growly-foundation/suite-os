'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fetchDocumentationArticles } from '@/services/documentation.service';
import { ArrowRight, BookOpen, ExternalLink, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface DocumentationArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  publishedAt?: string;
  isNew?: boolean;
}

interface DocumentationFeedProps {
  className?: string;
  maxArticles?: number;
  showHeader?: boolean;
}

export function DocumentationFeed({
  className,
  maxArticles = 4,
  showHeader = true,
}: DocumentationFeedProps) {
  const [articles, setArticles] = useState<DocumentationArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      try {
        const fetchedArticles = await fetchDocumentationArticles(maxArticles);
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error loading documentation articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [maxArticles]);

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewAll = () => {
    window.open('https://docs.getsuite.io/en/collections/14174088-integrations', '_blank');
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation & Guides
              </CardTitle>
              <CardDescription>Learn how to integrate and make the most of Suite</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleViewAll} className="gap-2">
              View All
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {articles.map(article => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article.url)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors group'
            )}>
            <div className="mt-1 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                {article.isNew && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {article.category}
                </Badge>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors inline-flex items-center gap-1">
                  Read more
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full mt-2" onClick={handleViewAll} size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View All Documentation
        </Button>
      </CardContent>
    </Card>
  );
}
