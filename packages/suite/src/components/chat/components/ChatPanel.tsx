'use client';

import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { useChatActions } from '@/hooks/use-chat-actions';
import { useSuiteSession } from '@/hooks/use-session';
import { useSuite } from '@/hooks/use-suite';

import { ConversationRole, ParsedUser } from '@getgrowly/core';

import { ChatInput, ChatInputProps } from './ChatInput';
import { ChatMessageView, ChatMessageViewProps } from './ChatMessageView';
import { StreamingResponse } from './StreamingResponse';

export function ChatPanel() {
  const { integration } = useSuite();
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
  const { sendUserMessage, isSending, streamingText, currentStatus } = useChatActions();

  return (
    <ChatPanelContainer
      user={user}
      integration={integration}
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
        currentStatus, // Pass streaming status to input
      }}
      streaming={{
        streamingText,
        currentStatus,
        isStreaming: isSending && isAgentThinking,
      }}
    />
  );
}

export function ChatPanelContainer({
  integration,
  user,
  view,
  input,
  streaming,
}: {
  integration?: {
    onchainKit?: {
      enabled: boolean;
    };
  };
  user: ParsedUser | undefined | null;
  view: ChatMessageViewProps;
  input: ChatInputProps;
  streaming?: {
    streamingText: string;
    currentStatus: string;
    isStreaming: boolean;
  };
}) {
  return (
    <PanelLayout>
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <ChatMessageView {...view} />
          {/* Show streaming response when agent is responding */}
          {streaming?.isStreaming && (
            <div className="px-4 pb-2">
              <StreamingResponse
                streamingText={streaming.streamingText}
                currentStatus={streaming.currentStatus}
                showAvatar={true}
              />
            </div>
          )}
        </div>
        <ChatInput {...input} />
      </div>
    </PanelLayout>
  );
}
