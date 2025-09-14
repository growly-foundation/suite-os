import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { Address } from 'viem';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';
import { truncateAddress } from '@getgrowly/ui';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { Badge } from '../ui/badge';
import { TalentProtocolCheckmark } from '../user/talent-protocol-checkmark';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

export const AppUserConversationItem = ({
  user: { user, latestMessageDate, latestMessageContent, latestMessageSender },
  selectedUser,
  onSelectUser,
}: {
  user: UserWithLatestMessage;
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
}) => {
  const persona = consumePersona(user);
  const isSelected = selectedUser.id === user.id;
  if (!latestMessageContent) return null;
  const intentMessageParsed = JSON.parse(latestMessageContent) as unknown as ParsedMessage;

  return (
    <div
      key={user.id}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
      }`}
      onClick={() => onSelectUser(user)}>
      <AppUserAvatarWithStatus
        size={35}
        walletAddress={user.personaData.id as Address}
        name={user.name}
        online={user.chatSession.status}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm truncate flex items-center gap-2">
            {persona.nameService().name || truncateAddress(user.entities.walletAddress, 10, 4)}
            {persona.getHumanCheckmark() && <TalentProtocolCheckmark width={12} height={12} />}
          </p>
          {latestMessageDate && (
            <span className="text-xs text-muted-foreground">
              {moment(latestMessageDate).fromNow()}
            </span>
          )}
        </div>
        {intentMessageParsed && (
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-medium">{latestMessageSender}: </span>
            {renderPreviewMessageContent(intentMessageParsed)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {persona.dominantTrait() && (
            <Badge
              className={cn(
                getBadgeColor(persona.dominantTrait() || ''),
                'rounded-full',
                'text-xs'
              )}>
              {persona.dominantTrait()}
            </Badge>
          )}
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
