'use client';

import { Button } from '@/components/ui/button';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import { MoreVertical, Phone, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ConversationRole, ParsedUser } from '@getgrowly/core';
import { ChatPanelContainer } from '@getgrowly/suite';

import { AppUserAvatarWithStatus } from '../app-users/app-user-avatar-with-status';

interface ConversationAreaProps {
  selectedUser: ParsedUser;
}

export function ConversationArea({ selectedUser }: ConversationAreaProps) {
  const [isScrollingToBottom, setIsScrollingToBottom] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const {
    fetchCurrentConversationMessages,
    currentConversationMessages,
    selectedAgent,
    conversationStatus,
  } = useDashboardState();
  const { sendAdminMessage } = useChatActions();

  useEffect(() => {
    const fetchMessages = async () => {
      // TODO: Real-time update the conversation with the user. (Consider replacing with XMTP)
      await fetchCurrentConversationMessages();
      setIsScrollingToBottom(true);
    };
    fetchMessages();
  }, [fetchCurrentConversationMessages, selectedAgent, selectedUser]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <AppUserAvatarWithStatus user={selectedUser} />
          <div>
            <p className="font-medium">{selectedUser.ensName}</p>
            <p className="text-xs text-muted-foreground">
              {selectedUser.online ? 'Online now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ChatPanelContainer
        user={selectedUser}
        view={{
          messages: currentConversationMessages,
          agent: selectedAgent,
          user: selectedUser,
          isLoadingMessages: conversationStatus === 'loading',
          isAgentThinking: conversationStatus === 'agent-thinking',
          isScrollingToBottom: isScrollingToBottom,
          viewAs: ConversationRole.Admin,
        }}
        input={{
          sendMessageHandler: () =>
            sendAdminMessage(inputValue, () => {
              setInputValue('');
              setIsScrollingToBottom(true);
            }),
          isSending: conversationStatus === 'sending',
          inputValue: inputValue,
          setInputValue: setInputValue,
          isAgentThinking: conversationStatus === 'agent-thinking',
        }}
      />
    </div>
  );
}
