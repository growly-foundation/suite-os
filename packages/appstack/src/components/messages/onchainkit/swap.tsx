import { Token } from '@coinbase/onchainkit/token';
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToast,
  SwapToggleButton,
} from '@coinbase/onchainkit/swap';
import { ChatMessage } from '@/components/widgets/types';

export const buildOnchainKitSwapMessage = (
  swappableTokens: Token[],
  fromToken: Token,
  toToken: Token
): ChatMessage['message'] => {
  return {
    type: 'onchainkit:swap',
    content: (
      <Swap className="w-full" headerLeftContent={''} title={''}>
        {' '}
        <SwapAmountInput
          label="Sell"
          swappableTokens={swappableTokens}
          token={fromToken}
          type="from"
        />{' '}
        <SwapToggleButton />
        <SwapAmountInput
          label="Buy"
          swappableTokens={swappableTokens}
          token={toToken}
          type="to"
        />{' '}
        <SwapButton />
        <SwapMessage />
        <SwapToast />
      </Swap>
    ),
  };
};
