'use client';

import { Loader2, Pencil, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useLayoutEffect } from 'react';
import { ConversationRole, MessageContent } from '@growly/core';
import ChatResponse from './ChatResponse';
import { useSuite } from '@/provider';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { border, cn, pressable, text } from '@/styles/theme';
import { AnimatedBuster, BusterState, BRAND_NAME_CAPITALIZED } from '@growly/ui';
import { Textarea } from '@/components/ui/textarea';
import { chatService } from '@/services/chat.service';
import { suiteCoreService } from '@/services/core.service';
import { useWidgetSession } from '@/hooks/use-session';

export function ChatPanel() {
  const {
    user,
    agent,
    isLoadingMessages,
    isAgentThinking,
    setIsAgentThinking,
    togglePanel,
    messages,
    addMessage,
  } = useWidgetSession();
  const { config, agentId, session } = useSuite();
  const [busterState, setBusterState] = React.useState<BusterState>('idle');
  const [refreshing, setRefreshing] = React.useState(+new Date());
  const [inputValue, setInputValue] = React.useState('');
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* <AgentAvatar /> */}
            <div>
              <h2 className={cn('font-semibold', text.headline)}>
                {agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
              </h2>
              <p className={cn('text-sm opacity-90', text.base)}>
                Typically replies in a few minutes
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={togglePanel} style={{ cursor: 'pointer' }}>
            <X className="h-5 w-5" />
          </Button>
        </div>
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
      {/* No messages yet */}
      <ScrollArea
        className={cn('flex-1', config?.display === 'fullView' ? 'max-h-[90vh]' : 'max-h-[500px]')}
        style={{ padding: '0px 20px' }}>
        {messages.length > 0 && (
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
                {messages.map(message => (
                  <ChatResponse key={message.id} message={message} />
                ))}
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
            className={cn('flex justify-center items-center text-gray-500 gap-4', text.body)}
            style={{ marginTop: 50, marginBottom: 50 }}>
            <Loader2 className="h-5 w-5 animate-spin" /> Thinking...
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div
        className={cn('p-4 border-t', border.lineDefault)}
        style={{ backgroundColor: config?.theme?.background }}>
        <div className={cn('flex space-x-2', text.body)}>
          <AnimatedBuster state={busterState} setState={setBusterState} width={40} height={40} />
          <Textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            required
            placeholder="Send a message..."
            style={{
              border: 'none',
            }}
            className={cn(
              'flex-1',
              border.lineDefault,
              'placeholder:text-gray-500 text-xs placeholder:text-xs focus:outline-none focus:ring-0'
            )}
          />
          <Button
            className={cn(border.defaultActive, pressable.inverse, text.headline)}
            style={{
              backgroundColor: config?.theme?.primary,
              color: config?.theme?.text,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
            }}
            onClick={sendMessageHandler}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
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
