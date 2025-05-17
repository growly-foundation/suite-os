import { suiteCoreService } from '@/services/core.service';
import { ConversationRole, MessageContent } from '@getgrowly/core';
import React from 'react';
import { useSuiteSession } from './use-session';
import { chatService } from '@/services/chat.service';
import { toast } from 'sonner';
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
  } = useSuiteSession();
  const { agentId } = useSuite();
  const [isSending, setIsSending] = React.useState(false);

  const sendRemoteMessage = async (
    type: MessageContent['type'],
    message: string,
    sender: ConversationRole
  ) => {
    const serializedContent = JSON.stringify({
      type,
      content: message,
    });
    const newMessage = await suiteCoreService.callDatabaseService('messages', 'create', [
      {
        content: serializedContent,
        sender,
        agent_id: agentId,
        user_id: user?.id,
      },
    ]);

    const deserializedMessage = {
      ...newMessage,
      ...JSON.parse(newMessage.content),
    };
    addMessage(deserializedMessage);
  };

  const sendTextMessage = (message: string, sender: ConversationRole) => {
    sendRemoteMessage('text', message, sender);
  };

  const sendErrorMessage = (message: string, sender: ConversationRole) => {
    sendRemoteMessage('system:error', message, sender);
  };

  const sendUserMessage = async (input: string) => {
    if (isSending) return;
    if (!agentId || !user?.id) {
      toast.error('Failed to send message');
      return;
    }
    if (input.trim().length > 0) {
      setIsAgentThinking(true);
      setBusterState('writing');
      setIsSending(true);
      setInputValue('');

      sendTextMessage(input, ConversationRole.User);
      await generateAgentMessage(input);

      setIsSending(false);
      setBusterState('idle');
      setIsAgentThinking(false);
      setPanelOpen(true);
    }
  };

  const textAgentMessage = async (input: string, isError?: boolean) => {
    if (isError) {
      sendErrorMessage(input, ConversationRole.Agent);
    } else {
      sendTextMessage(input, ConversationRole.Agent);
    }
    setPanelOpen(true);
  };

  const generateAgentMessage = async (input: string) => {
    if (!agentId || !user?.id) {
      toast.error('Failed to send message');
      return;
    }
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
      toast.error(`Failed to send message: ${error}`);
      textAgentMessage(error.toSring(), true);
    }
  };

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
