'use client';

import { Button } from '@/components/ui/button';
import { useChatActions } from '@/hooks/use-chat-actions';
import { cn } from '@/lib/utils';

interface SmartRecommendationChipsProps {
  recommendations: Record<string, string>; // keyword -> full_text_message
}

export const buildRecommendationChips = (recommendations: Record<string, string>) => {
  return <SmartRecommendationChips recommendations={recommendations} />;
};

const SmartRecommendationChips = ({ recommendations }: SmartRecommendationChipsProps) => {
  const { sendUserMessage } = useChatActions();

  const handleRecommendationClick = (fullMessage: string) => {
    sendUserMessage(fullMessage);
  };

  if (!recommendations || Object.keys(recommendations).length === 0) {
    return null;
  }

  const recommendationEntries = Object.entries(recommendations).slice(0, 5);

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {recommendationEntries.map(([keyword, fullMessage], index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleRecommendationClick(fullMessage)}
          className={cn(
            'text-xs h-8 px-3 rounded-full transition-all duration-200',
            'border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300',
            'dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-600',
            'hover:scale-105 active:scale-95'
          )}>
          {keyword}
        </Button>
      ))}
    </div>
  );
};
