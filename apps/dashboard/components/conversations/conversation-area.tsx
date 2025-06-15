'use client';

import { useChatActions } from '@/hooks/use-chat-actions';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useEffect, useState } from 'react';

import { ConversationRole, ParsedUser } from '@getgrowly/core';
import { ChatPanelContainer } from '@getgrowly/suite';

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
  );
}
