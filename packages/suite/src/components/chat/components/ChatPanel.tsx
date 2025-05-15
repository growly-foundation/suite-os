'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useLayoutEffect } from 'react';
import { ConversationRole, MessageContent } from '@growly/core';
import { useSuite } from '@/provider';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { border, cn } from '@/styles/theme';
import { chatService } from '@/services/chat.service';
import { suiteCoreService } from '@/services/core.service';
import { useWidgetSession } from '@/hooks/use-session';
import { ChatPanelHeader } from './ChatPanelHeader';
import { ChatMessageView } from './ChatMessageView';
import { ChatInput } from './ChatInput';

export function ChatPanel() {
  const {
    user,
    setIsAgentThinking,
    messages,
    addMessage,
    setBusterState,
    inputValue,
    setInputValue,
  } = useWidgetSession();
  const { config, agentId, session } = useSuite();
  const [refreshing, setRefreshing] = React.useState(+new Date());
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
    setRefreshing(+new Date());
  };

  const sendTextMessage = (message: string, sender: ConversationRole) => {
    sendRemoteMessage('text', message, sender);
  };

  const sendErrorMessage = (message: string, sender: ConversationRole) => {
    sendRemoteMessage('system:error', message, sender);
  };

  const sendMessageHandler = async () => {
    if (inputValue.trim().length > 0) {
      setIsAgentThinking(true);
      setBusterState('writing');
      setIsSending(true);
      setInputValue('');

      sendTextMessage(inputValue, ConversationRole.User);
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const newMessage = await chatService.chat({
          message: inputValue,
          agentId,
          userId: user?.id ?? '',
          stepId: agentId,
          isBeastMode: false,
        });
        sendTextMessage(newMessage.reply, ConversationRole.Agent);
      } catch (error: any) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        sendErrorMessage(error.toString(), ConversationRole.Agent);
      }

      setIsSending(false);
      setBusterState('idle');
      setIsAgentThinking(false);
    }
  };

  useLayoutEffect(() => {
    const lastestMessage = messages[messages.length - 1];
    if (lastestMessage && typeof document !== 'undefined') {
      const element = document.getElementById(lastestMessage.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, refreshing]);

  return (
    <React.Fragment>
      {/* Header */}
      <div
        className={cn('p-4 shadow-md border-b', border.lineDefault)}
        style={{
          backgroundColor: config?.theme?.headerBackground,
          color: config?.theme?.headerText,
        }}>
        <ChatPanelHeader />
      </div>
      {session?.walletAddress && config?.onchainKit?.enabled && (
        <Identity address={session.walletAddress} hasCopyAddressOnClick={false}>
          <Avatar />
          <Name>
            <Badge tooltip={false} />
          </Name>
          <Address />
        </Identity>
      )}
      {/* Messages */}
      <ChatMessageView />
      {/* Input Area */}
      <ChatInput sendMessageHandler={sendMessageHandler} isSending={isSending} />
    </React.Fragment>
  );
}

export function ChatPanelContainer() {
  const { config } = useSuite();
  const { panelOpen } = useWidgetSession();

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed rounded-t-lg bottom-0 right-0 w-full max-w-[450px] sm:w-[450px] shadow-2xl z-[9999] flex flex-col overflow-hidden',
            border.default,
            config?.display === 'fullView' ? 'h-[100vh]' : 'h-[650px]'
          )}
          style={{
            backgroundColor: config?.theme?.background,
          }}>
          <ChatPanel />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
