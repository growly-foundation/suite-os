import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

import { UniswapSwapMessageContent } from '@getgrowly/core';

const UniswapSwapMessage = ({
  fromToken,
  toToken,
  amount,
  link,
}: UniswapSwapMessageContent['content']) => {
  const { theme } = useTheme();
  return (
    <div style={{ backgroundColor: theme.background.default, color: theme.text.primary }}>
      <Button
        onClick={() => window.open(link, '_blank')}
        className="mt-2 flex items-center gap-2 font-bold hover:gas-bg-primary-hover">
        <ArrowRight /> Swap {parseFloat(amount.toString()).toFixed(3)} {fromToken.symbol} to{' '}
        {toToken.symbol} on Uniswap
      </Button>
    </div>
  );
};

export const buildUniswapSwapMessage = (content: UniswapSwapMessageContent['content']) => {
  return <UniswapSwapMessage {...content} />;
};
