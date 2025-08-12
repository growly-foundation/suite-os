import { AgentChatResponse, chatService } from '@/services/chat.service';
import { suiteCoreService } from '@/services/core.service';
import { Screen } from '@/types/screen';
import React from 'react';
import { toast } from 'sonner';

import {
  ConversationRole,
  Message,
  MessageContent,
  SystemErrorMessageContent,
  TextMessageContent,
} from '@getgrowly/core';

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
  const [streamingText, setStreamingText] = React.useState('');
  const [currentStatus, setCurrentStatus] = React.useState<string>('');

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

  const sendErrorMessage = (message: SystemErrorMessageContent['content']) => {
    sendRemoteMessage('system:error', message, ConversationRole.System);
  };

  const sendUserMessage = (message: TextMessageContent['content']) => {
    sendTextMessage(message, ConversationRole.User);
    generateStreamingAgentMessage(message);
    setInputValue('');
  };

  const navigateChatScreen = () => {
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        setPanelOpen(true);
        setScreen(Screen.Chat);
      }, 500);
    }
  };

  /**
   * Process agent message response and persist to database
   */
  const textAgentMessage = async (reply: AgentChatResponse, isError = false) => {
    if (isError) {
      sendErrorMessage(reply.agent);
      return;
    }

    // Send the agent text response
    if (reply.agent?.trim()) {
      sendTextMessage(reply.agent, ConversationRole.Agent);
    }

    // Send all tool messages
    for (const tool of reply.tools) {
      await sendRemoteMessage(tool.type, tool.content, ConversationRole.Agent);
    }
  };

  /**
   * Generate a streaming agent message with real-time updates
   */
  const generateStreamingAgentMessage = async (input: TextMessageContent['content']) => {
    console.log('🔍 generateStreamingAgentMessage called with:', {
      input,
      agentId,
      userId: user?.id,
    });

    if (!agentId || !user?.id) {
      console.error('❌ Missing agentId or user.id:', { agentId, user: user?.id });
      toast.error('Failed to send message');
      return;
    }

    navigateChatScreen();
    setIsSending(true);
    setIsAgentThinking(true);
    setBusterState('writing');
    setStreamingText('');
    setCurrentStatus('');

    try {
      const streamingPayload = {
        message: input,
        agentId,
        userId: user.id ?? '',
        stepId: agentId,
        isBeastMode: false,
      };

      console.log('📤 Calling chatService.chatStream with payload:', streamingPayload);

      const streamingResponse = chatService.chatStream(streamingPayload);

      let fullAgentResponse = '';
      const toolMessages: MessageContent[] = [];

      for await (const chunk of streamingResponse) {
        console.log('📨 Processing streaming chunk:', chunk);

        switch (chunk.type) {
          case 'stream:status':
            setCurrentStatus(chunk.content.message);
            if (chunk.content.toolName) {
              setBusterState('writing'); // Use 'writing' for tool calls since 'tool_calling' is not a valid BusterState
            }
            break;

          case 'stream:text':
            if (chunk.content.chunk) {
              fullAgentResponse += chunk.content.chunk;
              setStreamingText(fullAgentResponse);
            }

            if (chunk.content.isComplete) {
              // Send the complete agent response to database
              if (fullAgentResponse.trim()) {
                await sendTextMessage(fullAgentResponse, ConversationRole.Agent);
              }
              setBusterState('idle');
            }
            break;

          case 'stream:tool':
            toolMessages.push(chunk.content);
            // Send tool message immediately to database
            await sendRemoteMessage(
              chunk.content.type,
              chunk.content.content,
              ConversationRole.Agent
            );
            break;

          case 'stream:complete':
            console.log(`✅ Streaming completed in ${chunk.content.processingTime}ms`);
            setCurrentStatus('');
            break;

          case 'stream:error':
            console.error('❌ Streaming error:', chunk.content.error);
            toast.error(`Agent error: ${chunk.content.error}`);
            sendErrorMessage(chunk.content.error);
            break;
        }
      }
    } catch (error: any) {
      console.error('Streaming failed:', error);
      toast.error(`Failed to send message: ${error.message}`);
      sendErrorMessage(error.toString());
    } finally {
      setIsSending(false);
      setIsAgentThinking(false);
      setBusterState('idle');
      setStreamingText('');
      setCurrentStatus('');
    }
  };

  /**
   * Generate an agent message using the legacy non-streaming method (fallback)
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
    generateStreamingAgentMessage,
    textAgentMessage,
    sendUserMessage,
    streamingText,
    currentStatus,
  };
};
