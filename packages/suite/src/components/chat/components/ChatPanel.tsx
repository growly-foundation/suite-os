'use client';

import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useSuiteSession } from '@/hooks/use-session';

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
    <div className="flex flex-col h-full min-h-0">
      {user?.entities.walletAddress ? (
        <>
          <div className="flex-1 min-h-0">
            <PanelLayout>
              <ChatMessageView {...view} />
            </PanelLayout>
          </div>
          <div className="flex-shrink-0">
            <ChatInput {...input} />
          </div>
        </>
      ) : (
        <ConnectWallet />
      )}
    </div>
  );
}
