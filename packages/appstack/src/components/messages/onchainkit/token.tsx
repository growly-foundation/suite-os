import { Token, TokenChip } from '@coinbase/onchainkit/token';
import { ChatMessage } from '@/components/widgets/types';

export const buildOnchainKitTokenChipMessage = (token: Token): ChatMessage['message'] => {
  return {
    type: 'onchainkit:token',
    content: <TokenChip className="bg-white shadow-none" isPressable={false} token={token} />,
  };
};
