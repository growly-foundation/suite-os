import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { ChevronUp, Loader2, Pencil } from 'lucide-react';
import React from 'react';

import { Agent, ConversationRole, ParsedMessage, User } from '@getgrowly/core';
import { BRAND_NAME_CAPITALIZED } from '@getgrowly/ui';

import ChatResponse from './ChatResponse';
import { ConnectWallet } from './ConnectWallet';

export interface ChatMessageViewProps {
  messages: ParsedMessage[];
  agent: Agent | undefined | null;
  user: User | undefined | null;
  viewAs?: ConversationRole;
  isLoadingMessages: boolean;
  isAgentThinking: boolean;
  isScrollingToBottom: boolean;
}

const shouldShowAvatar = (message: ParsedMessage, previousMessage: ParsedMessage | null) => {
  if (!previousMessage) return true;
  if (message.sender !== previousMessage.sender) return true;
  if (message.created_at && previousMessage.created_at) {
    const timeDiff =
      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime();
    return timeDiff > 600000; // 10 minutes in milliseconds
  }
  return false;
};

export const ChatMessageView = ({
  messages,
  agent,
  user,
  viewAs = ConversationRole.User,
  isLoadingMessages,
  isAgentThinking,
  isScrollingToBottom,
}: ChatMessageViewProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Number of messages to show initially and when loading more
  const MESSAGES_PER_PAGE = 5;

  // State to track how many messages are currently visible
  const [visibleMessageCount, setVisibleMessageCount] = React.useState(MESSAGES_PER_PAGE);

  // Calculate visible messages based on the count
  const visibleMessages = React.useMemo(() => {
    if (messages.length <= visibleMessageCount) {
      return messages;
    }
    return messages.slice(messages.length - visibleMessageCount);
  }, [messages, visibleMessageCount]);

  // Group messages: combine agent text messages with ALL their following tool messages
  const groupedMessages = React.useMemo(() => {
    const grouped: Array<{
      message: ParsedMessage;
      toolMessages: ParsedMessage[];
    }> = [];

    for (let i = 0; i < visibleMessages.length; i++) {
      const currentMessage = visibleMessages[i];

      // Skip standalone tool messages (they'll be grouped with agent messages)
      if (currentMessage.sender === 'assistant' && currentMessage.type !== 'text') {
        continue;
      }

      // For agent text messages, collect ALL following tool messages
      if (currentMessage.sender === 'assistant' && currentMessage.type === 'text') {
        const toolMessages: ParsedMessage[] = [];

        // Look ahead for consecutive tool messages from the same agent
        let j = i + 1;
        while (j < visibleMessages.length) {
          const nextMessage = visibleMessages[j];

          // If it's an agent message but not text, it's a tool message
          if (nextMessage.sender === 'assistant' && nextMessage.type !== 'text') {
            toolMessages.push(nextMessage);
            j++;
          } else {
            // Stop when we hit a user message or another agent text message
            break;
          }
        }

        grouped.push({
          message: currentMessage,
          toolMessages,
        });
      } else {
        // For user messages or other message types
        grouped.push({
          message: currentMessage,
          toolMessages: [],
        });
      }
    }

    return grouped;
  }, [visibleMessages]);

  // Handle loading more messages
  const loadPreviousMessages = () => {
    setVisibleMessageCount(prev => Math.min(prev + MESSAGES_PER_PAGE, messages.length));
  };

  // Scroll to bottom when messages change or when visible message count changes
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const element = document.getElementById('thinking-status');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isScrollingToBottom, isLoadingMessages]);

  if (!user) {
    return <ConnectWallet />;
  }
  return (
    <React.Fragment>
      {messages.length > 0 && viewAs === ConversationRole.User && (
        <React.Fragment>
          <div
            className={cn('text-gray-500 text-xs text-center', text.base)}
            style={{ padding: '20px 0px 30px 0px' }}>
            You are chatting with {agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
          </div>
        </React.Fragment>
      )}
      {!isLoadingMessages ? (
        <React.Fragment>
          {messages.length > 0 ? (
            <React.Fragment>
              <div style={{ height: '20px', width: '100%' }} />
              {messages.length > visibleMessageCount && (
                <div className="flex justify-center my-4">
                  <Button
                    onClick={loadPreviousMessages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1">
                    <ChevronUp className="h-4 w-4" />
                    Load previous messages
                  </Button>
                </div>
              )}
              {groupedMessages.map((group, index) => {
                const previousMessage = index > 0 ? groupedMessages[index - 1].message : null;
                return (
                  <ChatResponse
                    key={group.message.id}
                    message={group.message}
                    viewAs={viewAs}
                    showAvatar={shouldShowAvatar(group.message, previousMessage)}
                    user={user}
                    toolMessages={group.toolMessages}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </React.Fragment>
          ) : (
            <div className={cn('p-[50px] text-gray-500', text.body)}>
              <div style={{ marginBottom: '10px' }}>
                <Pencil className="h-6 w-6 mr-2" />
              </div>
              <div className={cn('mt-2', text.body)}>
                This conversation just started. Send a message to get started.
              </div>
            </div>
          )}
        </React.Fragment>
      ) : (
        <div
          className={cn('flex justify-center items-center text-gray-500 gap-4', text.body)}
          style={{ marginTop: 50 }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Loading conversation...
        </div>
      )}
      {isAgentThinking && (
        <div
          id="thinking-status"
          className={cn('flex justify-center items-center text-gray-500 gap-4', text.body)}
          style={{ marginTop: 50, marginBottom: 50 }}>
          <Loader2 className="h-5 w-5 animate-spin" /> Thinking...
        </div>
      )}
    </React.Fragment>
  );
};
