'use client';

import { useDashboardState } from '@/hooks/use-dashboard';
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
  const {
    fetchCurrentConversationMessages,
    currentConversationMessages,
    selectedAgent,
    conversationStatus,
  } = useDashboardState();

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

  useEffect(() => {
    const fetchMessages = async () => {
      // TODO: Real-time update the conversation with the user. (Consider replacing with XMTP)
      await fetchCurrentConversationMessages();
      setIsScrollingToBottom(true);
    };
    fetchMessages();
  }, [fetchCurrentConversationMessages, selectedAgent, selectedUser]);

  return (
    <div className="flex flex-col h-full">
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
