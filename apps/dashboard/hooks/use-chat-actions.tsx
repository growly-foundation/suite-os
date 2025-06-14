import { suiteCore } from '@/core/suite';
import axios from 'axios';
import { toast } from 'sonner';

import { AgentId, ConversationRole, MessageContent, TextMessageContent } from '@getgrowly/core';

import { useDashboardState } from './use-dashboard';

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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SUITE_API_URL}/chat`, payload, {
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

  const sendRemoteMessage = async (
    type: MessageContent['type'],
    message: MessageContent['content'],
    sender: ConversationRole
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
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const sendTextMessage = async (
    message: TextMessageContent['content'],
    sender: ConversationRole
  ) => {
    await sendRemoteMessage('text', message, sender);
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
      await sendTextMessage(input, ConversationRole.Admin);
      setConversationStatus('idle');
      onMessageSent();
    }
  };

  return {
    sendAdminMessage,
  };
};
