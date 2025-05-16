'use client';

import React, { useLayoutEffect } from 'react';
import { ConversationRole, MessageContent } from '@growly/core';
import { useSuite } from '@/hooks/use-suite';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { chatService } from '@/services/chat.service';
import { suiteCoreService } from '@/services/core.service';
import { useSuiteSession } from '@/hooks/use-session';
import { ChatMessageView } from './ChatMessageView';
import { ChatInput } from './ChatInput';
import { ConnectWallet } from './ConnectWallet';
import { PanelLayout } from '@/components/panel/components/PanelLayout';

export function ChatPanel() {
  const {
    user,
    setIsAgentThinking,
    messages,
    addMessage,
    setBusterState,
    inputValue,
    setInputValue,
  } = useSuiteSession();
  const {
    config,
    agentId,
    integration,
    appState: { walletAddress },
  } = useSuite();
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
      {walletAddress ? (
        <>
          {integration?.onchainKit?.enabled && (
            <Identity address={walletAddress} hasCopyAddressOnClick={false}>
              <Avatar />
              <Name>
                <Badge tooltip={false} />
              </Name>
              <Address />
            </Identity>
          )}
          <PanelLayout>
            <ChatMessageView />
          </PanelLayout>
          <ChatInput sendMessageHandler={sendMessageHandler} isSending={isSending} />
        </>
      ) : (
        <ConnectWallet />
      )}
    </React.Fragment>
  );
}
