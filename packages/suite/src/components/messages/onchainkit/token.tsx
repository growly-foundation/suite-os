import { OnchainKitTokenMessageContent } from '@growly/core';
import { TokenChip } from '@coinbase/onchainkit/token';

export const buildOnchainKitTokenChipMessage = (
  { token }: OnchainKitTokenMessageContent['content'],
  time: string
) => {
  return (
    <div>
      <TokenChip className="bg-white shadow-none" isPressable={false} token={token} />
      <br />
      <span className="text-xs opacity-50">{time}</span>
    </div>
  );
};
