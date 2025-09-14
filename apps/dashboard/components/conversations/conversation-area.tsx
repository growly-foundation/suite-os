'use client';

import { OnlineStatusIndicator } from '@/components/ui/online-status-indicator';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useEffect, useState } from 'react';

import { ConversationRole, ParsedUser } from '@getgrowly/core';
import { ChatPanelContainer } from '@getgrowly/suite';

interface ConversationAreaProps {
  selectedUser: ParsedUser;
  onSendMessage: (content: string) => void;
  onSendAgentResponse?: (content: string) => void;
  onMarkAsRead: () => void;
  isConnected: boolean;
  typingUsers: Set<string>;
}

export function ConversationArea({
  selectedUser,
  onSendMessage,
  onSendAgentResponse,
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
      {/* Connection status and test buttons */}
      <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <OnlineStatusIndicator userId={selectedUser.id} />
        </div>
        {onSendAgentResponse && (
          <button
            onClick={() => onSendAgentResponse('This is a test agent response')}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Send Test Agent Response
          </button>
        )}
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
