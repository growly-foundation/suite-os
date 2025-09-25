import { useWalletData } from '@/hooks/use-wallet-data';
import { getTraitColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import { PersonaTrait } from '@/types/persona';
import moment from 'moment';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { Identity } from '../identity';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export const AppUserConversationItem = ({
  user: { user, latestMessageDate, latestMessageContent, latestMessageSender },
  selectedUser,
  onSelectUser,
}: {
  user: UserWithLatestMessage;
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
}) => {
  const isSelected = selectedUser.id === user.id;

  // Hooks must be called before any early returns
  const { personaAnalysis, isLoading } = useWalletData(user);
  const dominantTrait = personaAnalysis?.dominantTrait || 'Newbie';

  if (!latestMessageContent) return null;
  const intentMessageParsed = JSON.parse(latestMessageContent) as unknown as ParsedMessage;

  return (
    <div
      key={user.id}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelectUser(user)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Identity
            address={user.entities.walletAddress}
            avatarSize={25}
            showAddress={false}
            truncateLength={{ startLength: 10, endLength: 4 }}
            nameClassName="font-medium text-sm"
            addressClassName="font-medium text-sm"
            spacing="normal"
          />
          {latestMessageDate && (
            <span className="text-xs text-muted-foreground">
              {moment(latestMessageDate).fromNow()}
            </span>
          )}
        </div>
        <div className="mt-3">
          {intentMessageParsed && (
            <p className="text-xs text-muted-foreground truncate">
              <span className="font-medium">{latestMessageSender}: </span>
              {renderPreviewMessageContent(intentMessageParsed)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {isLoading ? (
              <Skeleton className="h-4 w-[50px] rounded-full" />
            ) : (
              dominantTrait && (
                <Badge
                  className={cn(
                    getTraitColor(dominantTrait as PersonaTrait),
                    'rounded-full',
                    'text-xs'
                  )}>
                  {dominantTrait}
                </Badge>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderPreviewMessageContent = (message: ParsedMessage) => {
  if (message.type === 'text') {
    return message.content;
  }
  if (message.type === 'text:recommendation') {
    return Object.keys(message.content).join(', ');
  }
  if (message.type === 'system:error') {
    return message.content;
  }
  if (message.type === 'uniswap:swap') {
    return message.content.fromToken.symbol + ' to ' + message.content.toToken.symbol;
  }
  return 'Unknown message content';
};
