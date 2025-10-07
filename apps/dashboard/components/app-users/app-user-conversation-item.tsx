import moment from 'moment';

import { ParsedMessage, ParsedUser } from '@getgrowly/core';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { Identity } from '../identity';

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
            address={user.wallet_address! as `0x${string}`}
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
