import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import moment from 'moment';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { Identity } from '../identity';
import { Badge } from '../ui/badge';

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
      <Identity
        address={user.entities.walletAddress}
        name={persona.nameService().name}
        hasCheckmark={persona.getHumanCheckmark()}
        avatarSize={35}
        showAddress={!persona.nameService().name}
        truncateLength={{ startLength: 10, endLength: 4 }}
        nameClassName="font-medium text-sm"
        addressClassName="font-medium text-sm"
        spacing="normal"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
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
