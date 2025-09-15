'use client';

import { useDashboardState } from '@/hooks/use-dashboard';
import { useConversationMessagesQuery } from '@/hooks/use-dashboard-queries';
import { useEffect, useState } from 'react';

import { ConversationRole, ParsedUser } from '@getgrowly/core';
import { ChatPanelContainer } from '@getgrowly/suite';

interface ConversationAreaProps {
  selectedUser: ParsedUser;
  onSendMessage: (content: string) => void;
  onMarkAsRead: () => void;
  isConnected: boolean;
  typingUsers: Set<string>;
}

export function ConversationArea({
  selectedUser,
  onSendMessage,
  onMarkAsRead,
  isConnected,
  typingUsers,
}: ConversationAreaProps) {
  const [isScrollingToBottom, setIsScrollingToBottom] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { selectedAgent, conversationStatus } = useDashboardState();

  // Use React Query for conversation messages
  const {
    data: currentConversationMessages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useConversationMessagesQuery(
    selectedAgent?.id,
    selectedUser.id,
    !!selectedAgent?.id && !!selectedUser.id
  );

  // Mark messages as read when component mounts or user changes
  useEffect(() => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
  }, [selectedUser, onMarkAsRead]);

  // Show connection status
  useEffect(() => {
    if (isConnected) {
      console.log('✅ Real-time connection established');
    } else {
      console.log('❌ Real-time connection lost');
    }
  }, [isConnected]);

  // Show typing users
  useEffect(() => {
    if (typingUsers.size > 0) {
      console.log('Users typing:', Array.from(typingUsers));
    }
  }, [typingUsers]);

  // Auto-scroll to bottom when messages load or user changes
  useEffect(() => {
    if (currentConversationMessages.length > 0) {
      setIsScrollingToBottom(true);
    }
  }, [currentConversationMessages, selectedUser]);

  // Handle real-time message updates
  useEffect(() => {
    // Refetch messages when agent or user changes
    if (selectedAgent?.id && selectedUser.id) {
      refetchMessages();
    }
  }, [selectedAgent, selectedUser, refetchMessages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatPanelContainer
        user={selectedUser}
        view={{
          messages: currentConversationMessages,
          agent: selectedAgent,
          user: selectedUser,
          isLoadingMessages: isLoadingMessages || conversationStatus === 'loading',
          isAgentThinking: conversationStatus === 'agent-thinking',
          isScrollingToBottom: isScrollingToBottom,
          viewAs: ConversationRole.Admin,
        }}
        input={{
          sendMessageHandler: async () => {
            await onSendMessage(inputValue);
            setInputValue('');
            setIsScrollingToBottom(true);
          },
          isSending: conversationStatus === 'sending',
          inputValue: inputValue,
          setInputValue: setInputValue,
          isAgentThinking: conversationStatus === 'agent-thinking',
        }}
      />
    </div>
  );
}
