'use client';

import React from 'react';
import { useSuite } from '@/hooks/use-suite';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { ChatMessageView } from './ChatMessageView';
import { ChatInput } from './ChatInput';
import { ConnectWallet } from './ConnectWallet';
import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { useChatActions } from '@/hooks/use-chat-actions';

export function ChatPanel() {
  const {
    integration,
    appState: { walletAddress },
  } = useSuite();
  const { sendMessage, isSending } = useChatActions();

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
          <ChatInput sendMessageHandler={sendMessage} isSending={isSending} />
        </>
      ) : (
        <ConnectWallet />
      )}
    </React.Fragment>
  );
}
