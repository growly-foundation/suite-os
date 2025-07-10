import { consumePersona } from '@/core/persona';
import { getBadgeColor } from '@/lib/color.utils';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { Address } from 'viem';

import { ParsedUser } from '@getgrowly/core';
import { RenderMessageContent } from '@getgrowly/suite';
import { WalletAddress } from '@getgrowly/ui';

import { UserWithLatestMessage } from '../agents/agent-conversations';
import { Badge } from '../ui/badge';
import { TalentProtocolCheckmark } from '../user/talent-protocol-checkmark';
import { AppUserAvatarWithStatus } from './app-user-avatar-with-status';

export const AppUserConversationItem = ({
  user: { user, latestMessageDate, latestMessageContent },
  selectedUser,
  onSelectUser,
}: {
  user: UserWithLatestMessage;
  selectedUser: ParsedUser;
  onSelectUser: (user: ParsedUser) => void;
}) => {
  const persona = consumePersona(user);
  return (
    <div
      key={user.id}
      className={`hover:bg-slate-50 border-b gap-3 p-3 py-4 ${selectedUser.id === user.id ? 'bg-slate-50' : ''} cursor-pointer`}
      onClick={() => onSelectUser(user)}>
      <div className={`flex items-center gap-3`}>
        <AppUserAvatarWithStatus
          walletAddress={user.onchainData.id as Address}
          name={user.name}
          online={user.chatSession.status}
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-medium text-xs truncate">
              {persona.nameService()?.name || 'Unknown User'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <WalletAddress
              truncate
              truncateLength={{ startLength: 10, endLength: 4 }}
              className="text-xs"
              address={user.onchainData.id}
            />
            {latestMessageDate && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {moment(latestMessageDate).fromNow()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {persona.getHumanCheckmark() && <TalentProtocolCheckmark width={16} height={16} />}
            {persona.dominantTrait() && (
              <Badge className={cn(getBadgeColor(persona.dominantTrait() || ''), 'rounded-full')}>
                {persona.dominantTrait()}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {latestMessageContent && (
        <div className="text-xs text-muted-foreground mt-1">
          {(() => {
            try {
              const parsedMessage = JSON.parse(latestMessageContent);
              return (
                <div className="text-xs text-muted-foreground">
                  <RenderMessageContent
                    message={{
                      ...parsedMessage,
                      content: parsedMessage.content.slice(0, 100) + '...',
                    }}
                  />
                </div>
              );
            } catch (error) {
              console.error('Failed to parse message content:', error);
              return (
                <div className="text-md mt-1 text-muted-foreground">Message can't be previewed</div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};
