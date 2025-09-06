'use client';

import { Button } from '@/components/ui/button';
import { useChatActions } from '@/hooks/use-chat-actions';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';

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
    <div className="gas-flex gas-flex-wrap gas-gap-2 gas-mt-3">
      {recommendationEntries.map(([keyword, fullMessage], index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleRecommendationClick(fullMessage)}
          className={cn(
            'gas-text-xs gas-h-8 gas-px-3 rounded-full gas-transition-all gas-duration-200',
            'gas-border-primary gas-text-primary hover:gas-bg-primary/10 hover:gas-border-primary hover:gas-text-primary',
            'hover:gas-scale-105 active:gas-scale-95',
            text.base
          )}>
          {keyword}
        </Button>
      ))}
    </div>
  );
};
