import { SERVER_API_URL } from '@/constants/config';
import { suiteCore } from '@/core/suite';
import axios from 'axios';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { AgentId, ConversationRole, MessageContent, TextMessageContent } from '@getgrowly/core';

import { useDashboardState } from './use-dashboard';
import { useRealtime } from './use-realtime';

interface AgentChatResponse {
  agent: string;
  tools: MessageContent[];
}

class ChatService {
  constructor() {}

  async chat(payload: {
    message: string;
    agentId: AgentId;
    userId: string;
    stepId: AgentId;
    isBeastMode?: boolean;
  }): Promise<{
    reply: AgentChatResponse;
  }> {
    try {
      const response = await axios.post(`${SERVER_API_URL}/chat`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export const chatService = new ChatService();

export const useChatActions = () => {
  const {
    admin,
    conversationStatus,
    selectedAgent,
    selectedAgentUser: selectedUser,
    setConversationStatus,
    addConversationMessage,
  } = useDashboardState();

  // Real-time messaging setup
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: sendRealtimeMessage,
    markAsRead: markAsReadRealtime,
    messages: realtimeMessages,
    typingUsers,
  } = useRealtime({
    serverUrl: SERVER_API_URL,
    userId: admin?.id || 'admin',
    autoConnect: true,
    onMessage: message => {
      // Add real-time message to conversation
      const messageContent = {
        type: 'text' as const,
        content: message.content,
      };

      addConversationMessage({
        id: message.id,
        conversation_id: message.conversationId,
        content: JSON.stringify(messageContent),
        sender: message.senderId as ConversationRole,
        sender_id: message.senderId,
        created_at: message.timestamp,
        embedding: null,
        type: messageContent.type,
      });
    },
  });

  // Join conversation when user is selected
  useEffect(() => {
    if (selectedAgent?.id && selectedUser?.id && isConnected) {
      const conversationId = `${selectedAgent.id}-${selectedUser.id}`;
      joinConversation(conversationId, admin?.id || 'admin');

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [selectedAgent?.id, selectedUser?.id, admin?.id]);

  const sendRemoteMessage = async (
    type: MessageContent['type'],
    message: MessageContent['content'],
    sender: ConversationRole,
    messageId?: string
  ) => {
    try {
      if (!selectedAgent?.id || !selectedUser?.id) {
        throw new Error('Agent or user not found');
      }
      const serializedContent = JSON.stringify({
        type,
        content: message,
      });
      const newMessage = await suiteCore.conversations.addMessageToConversation({
        agent_id: selectedAgent.id,
        user_id: selectedUser.id,
        message: serializedContent,
        sender,
        sender_id: admin?.id,
        existingEmbedding: undefined,
      });

      const deserializedMessage = {
        ...newMessage,
        ...JSON.parse(newMessage.content),
      };
      addConversationMessage(deserializedMessage);

      // Send real-time message if connected
      if (isConnected && messageId) {
        const conversationId = `${selectedAgent.id}-${selectedUser.id}`;
        sendRealtimeMessage(conversationId, message as string, messageId, admin?.id || 'admin');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const sendTextMessage = async (
    message: TextMessageContent['content'],
    sender: ConversationRole,
    messageId?: string
  ) => {
    await sendRemoteMessage('text', message, sender, messageId);
  };

  /**
   * Send a message on behalf of the admin.
   * @param input The content of the message
   */
  const sendAdminMessage = async (
    input: TextMessageContent['content'],
    onMessageSent: () => void
  ) => {
    if (conversationStatus === 'sending') return;
    if (!selectedAgent?.id || !selectedUser?.id) {
      toast.error('Failed to send message');
      return;
    }
    if (input.trim().length > 0) {
      setConversationStatus('sending');

      // Generate message ID for real-time tracking
      const messageId = uuidv4();

      await sendTextMessage(input, ConversationRole.Admin, messageId);
      setConversationStatus('idle');
      onMessageSent();
    }
  };

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(() => {
    if (selectedAgent?.id && selectedUser?.id && isConnected) {
      const conversationId = `${selectedAgent.id}-${selectedUser.id}`;
      markAsReadRealtime(conversationId, admin?.id || 'admin');
    }
  }, [selectedAgent?.id, selectedUser?.id, admin?.id, isConnected, markAsReadRealtime]);

  /**
   * Send agent response (for testing purposes)
   */
  const sendAgentResponse = async (input: TextMessageContent['content']) => {
    if (!selectedAgent?.id || !selectedUser?.id) {
      toast.error('Failed to send message');
      return;
    }
    if (input.trim().length > 0) {
      try {
        setConversationStatus('sending');

        // Generate message ID for real-time tracking
        const messageId = uuidv4();

        // Send to database
        await sendTextMessage(input, ConversationRole.Agent, messageId);

        setConversationStatus('idle');
      } catch (error: any) {
        toast.error(`Failed to send message: ${error.message}`);
        setConversationStatus('idle');
      }
    }
  };

  return {
    sendAdminMessage,
    sendAgentResponse,
    markAsRead,
    isConnected,
    typingUsers,
    realtimeMessages,
  };
};
