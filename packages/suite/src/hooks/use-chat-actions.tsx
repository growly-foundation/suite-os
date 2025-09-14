import { AgentChatResponse, chatService } from '@/services/chat.service';
import { suiteCoreService } from '@/services/core.service';
import { Screen } from '@/types/screen';
import React from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import {
  ConversationRole,
  Message,
  MessageContent,
  SystemErrorMessageContent,
  TextMessageContent,
} from '@getgrowly/core';

import { useRealtime } from './use-realtime';
import { useSuiteSession } from './use-session';
import { useSuite } from './use-suite';

export const useChatActions = () => {
  const {
    user,
    setIsAgentThinking,
    addMessage,
    setBusterState,
    inputValue,
    setInputValue,
    setPanelOpen,
    setScreen,
  } = useSuiteSession();
  const { agentId } = useSuite();
  const [isSending, setIsSending] = React.useState(false);

  // Real-time messaging setup
  const { sendMessage: sendRealtimeMessage, isConnected } = useRealtime({
    serverUrl: process.env.NEXT_PUBLIC_SUITE_API_URL || 'http://localhost:8888',
    userId: user?.id || '',
    conversationId: user?.id && agentId ? `${agentId}-${user.id}` : undefined,
    autoConnect: true,
  });

  /**
   * Send a message to the remote database
   * @param type The type of the message
   * @param message The content of the message
   * @param sender The sender of the message
   */
  const sendRemoteMessage = async (
    type: MessageContent['type'],
    message: MessageContent['content'],
    sender: ConversationRole,
    senderId?: string
  ) => {
    const serializedContent = JSON.stringify({
      type,
      content: message,
    });
    const newMessage: Message = await suiteCoreService.call(
      'conversations',
      'addMessageToConversation',
      [
        {
          agent_id: agentId,
          user_id: user?.id,
          message: serializedContent,
          sender,
          sender_id: senderId,
          existingEmbedding: undefined,
        },
      ]
    );

    const deserializedMessage = {
      ...newMessage,
      ...JSON.parse(newMessage.content),
    };
    addMessage(deserializedMessage);
  };

  const sendTextMessage = (message: TextMessageContent['content'], sender: ConversationRole) => {
    sendRemoteMessage('text', message, sender);
  };

  const sendErrorMessage = (
    message: SystemErrorMessageContent['content'],
    sender: ConversationRole
  ) => {
    sendRemoteMessage('system:error', message, sender);
  };

  const navigateChatScreen = () => {
    setPanelOpen(true);
    setScreen(Screen.Chat);
  };

  /**
   * Send a message on behalf of the user.
   * @param input The content of the message
   */
  const sendUserMessage = async (input: TextMessageContent['content']) => {
    if (isSending) return;
    if (!agentId || !user?.id) {
      toast.error('Failed to send message');
      return;
    }
    if (input.trim().length > 0) {
      navigateChatScreen();

      setIsSending(true);
      setInputValue('');

      // Generate message ID for real-time tracking
      const messageId = uuidv4();
      const conversationId = `${agentId}-${user.id}`;

      // Send real-time message if connected
      if (isConnected) {
        sendRealtimeMessage(conversationId, input, messageId, user.id);
      }

      sendTextMessage(input, ConversationRole.User);
      await generateAgentMessage(input);

      setIsSending(false);
    }
  };

  /**
   * Send a message on behalf of the agent.
   * @param input The content of the message
   * @param isError Whether the message is an error message
   */
  const textAgentMessage = async (input: AgentChatResponse, isError?: boolean) => {
    navigateChatScreen();
    if (isError) {
      await sendErrorMessage(input.agent, ConversationRole.Agent);
    } else {
      await sendTextMessage(input.agent, ConversationRole.Agent);
    }
    for (const tool of input.tools) {
      setTimeout(() => {
        sendRemoteMessage(tool.type, tool.content, ConversationRole.Agent);
      }, 500);
    }
  };

  /**
   * Generate an agent message. This will send a message on behalf of the user and trigger the agent to respond.
   * @param input The content of the message
   */
  const generateAgentMessage = async (input: TextMessageContent['content']) => {
    if (!agentId || !user?.id) {
      toast.error('Failed to send message');
      return;
    }
    navigateChatScreen();
    setIsAgentThinking(true);
    setBusterState('writing');
    try {
      const newMessage = await chatService.chat({
        message: input,
        agentId,
        userId: user.id ?? '',
        stepId: agentId,
        isBeastMode: false,
      });
      textAgentMessage(newMessage.reply);
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.message}`);
      textAgentMessage(error.toString(), true);
    } finally {
      setIsAgentThinking(false);
      setBusterState('idle');
    }
  };

  /**
   * Send a message on behalf of the user.
   */
  const sendMessage = () => {
    sendUserMessage(inputValue);
  };

  return {
    sendMessage,
    isSending,
    generateAgentMessage,
    textAgentMessage,
    sendUserMessage,
  };
};
