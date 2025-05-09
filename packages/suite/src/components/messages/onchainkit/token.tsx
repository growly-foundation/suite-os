import { OnchainKitTokenMessageContent } from '@growly/core';
import { TokenChip } from '@coinbase/onchainkit/token';

export const buildOnchainKitTokenChipMessage = ({
  token,
}: OnchainKitTokenMessageContent['content']) => {
  return <TokenChip className="bg-white shadow-none" isPressable={false} token={token} />;
};
