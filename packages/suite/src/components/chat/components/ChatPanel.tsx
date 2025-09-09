'use client';

import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useSuiteSession } from '@/hooks/use-session';
import React from 'react';

import { ConversationRole, ParsedUser } from '@getgrowly/core';

import { ChatInput, ChatInputProps } from './ChatInput';
import { ChatMessageView, ChatMessageViewProps } from './ChatMessageView';
import { ConnectWallet } from './ConnectWallet';

export function ChatPanel() {
  const {
    messages,
    user,
    agent,
    isLoadingMessages,
    isAgentThinking,
    panelOpen,
    inputValue,
    setInputValue,
  } = useSuiteSession();
  const { sendUserMessage, isSending } = useChatActions();
  return (
    <ChatPanelContainer
      user={user}
      view={{
        user,
        messages,
        agent,
        isLoadingMessages,
        isAgentThinking,
        isScrollingToBottom: panelOpen,
        viewAs: ConversationRole.User,
      }}
      input={{
        sendMessageHandler: sendUserMessage,
        isSending,
        inputValue,
        setInputValue,
        isAgentThinking,
      }}
    />
  );
}

export function ChatPanelContainer({
  user,
  view,
  input,
}: {
  user: ParsedUser | undefined | null;
  view: ChatMessageViewProps;
  input: ChatInputProps;
}) {
  return (
    <React.Fragment>
      {user?.entities.walletAddress ? (
        <>
          <PanelLayout>
            <ChatMessageView {...view} />
          </PanelLayout>
          <ChatInput {...input} />
        </>
      ) : (
        <ConnectWallet />
      )}
    </React.Fragment>
  );
}
