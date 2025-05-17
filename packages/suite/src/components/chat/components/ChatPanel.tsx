'use client';

import React from 'react';
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
  const { user, setIsAgentThinking, addMessage, setBusterState, inputValue, setInputValue } =
    useSuiteSession();
  const {
    agentId,
    integration,
    appState: { walletAddress },
  } = useSuite();
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
