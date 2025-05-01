import { Token } from '@coinbase/onchainkit/token';
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToast,
  SwapToggleButton,
} from '@coinbase/onchainkit/swap';
import { OnchainKitSwapMessage } from '@/components/widgets/types';

export const buildOnchainKitSwapMessage = ({
  fromToken,
  swappableTokens,
  toToken,
}: OnchainKitSwapMessage['content']) => {
  return (
    <Swap className="w-full" headerLeftContent={''} title={''}>
      <SwapAmountInput
        label="Sell"
        swappableTokens={swappableTokens}
        token={fromToken}
        type="from"
      />
      <SwapToggleButton />
      <SwapAmountInput label="Buy" swappableTokens={swappableTokens} token={toToken} type="to" />
      <SwapButton />
      <SwapMessage />
      <SwapToast />
    </Swap>
  );
};
