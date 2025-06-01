'use client';

import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useSuite } from '@/hooks/use-suite';
import { Address, Avatar, Badge, Identity, Name } from '@coinbase/onchainkit/identity';
import React from 'react';

import { ChatInput } from './ChatInput';
import { ChatMessageView } from './ChatMessageView';
import { ConnectWallet } from './ConnectWallet';

export function ChatPanel() {
  const {
    integration,
    appState: { walletAddress },
  } = useSuite();
  const { sendMessage, isSending } = useChatActions();
  return (
    <ChatPanelContainer
      isSending={isSending}
      sendMessageHandler={sendMessage}
      walletAddress={walletAddress}
      integration={integration}
    />
  );
}

export function ChatPanelContainer({
  walletAddress,
  integration,
  sendMessageHandler,
  isSending,
}: {
  integration?: {
    onchainKit?: {
      enabled: boolean;
    };
  };
  walletAddress: `0x${string}` | undefined;
  sendMessageHandler: () => void;
  isSending: boolean;
}) {
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
