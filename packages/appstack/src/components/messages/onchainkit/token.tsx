import { OnchainKitTokenMessage } from '@/components/widgets/types';
import { Token, TokenChip } from '@coinbase/onchainkit/token';

export const buildOnchainKitTokenChipMessage = ({ token }: OnchainKitTokenMessage['content']) => {
  return <TokenChip className="bg-white shadow-none" isPressable={false} token={token} />;
};
