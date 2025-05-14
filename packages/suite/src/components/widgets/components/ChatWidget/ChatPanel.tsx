'use client';

import { Loader2, Pencil, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useLayoutEffect } from 'react';
import { ConversationRole, ParsedMessage } from '@growly/core';
import ChatResponse from './ChatResponse';
import { useSuite } from '@/provider';
import { BRAND_NAME_CAPITALIZED } from '@/constants';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { border, cn, pressable, text } from '@/styles/theme';
import { AnimatedBuster, BusterState } from '@growly/ui';
import { Textarea } from '@/components/ui/textarea';

interface PanelProps {
  open: boolean;
  onClose: () => void;
  messages: ParsedMessage[];
  onSend: (message: ParsedMessage) => void;
}

export function ChatPanel({ onClose, messages, onSend }: Omit<PanelProps, 'open'>) {
  const { config } = useSuite();
  const [busterState, setBusterState] = React.useState<BusterState>('idle');
  const [refreshing, setRefreshing] = React.useState(+new Date());
  const [inputValue, setInputValue] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const sendMessageHandler = async () => {
    if (inputValue.trim().length > 0) {
      setBusterState('writing');
      setIsSending(true);
      setInputValue('');

      // Main logic to send message is here.
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newMessage: ParsedMessage = {
        id: '123',
        type: 'text',
        agent_id: '1',
        embedding: null,
        user_id: '1',
        content: inputValue,
        sender: ConversationRole.User,
        created_at: new Date().toISOString(),
      };
      onSend(newMessage);

      setRefreshing(+new Date());
      setIsSending(false);
      setBusterState('idle');
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
                {config?.agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
              </h2>
              <p className={cn('text-sm opacity-90', text.base)}>
                Typically replies in a few minutes
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} style={{ cursor: 'pointer' }}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {config?.session?.walletAddress && config.onchainKit?.enabled && (
        <Identity address={config.session.walletAddress} hasCopyAddressOnClick={false}>
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
        {messages.length > 0 ? (
          <React.Fragment>
            {messages.map((message, index) => (
              <div key={message.id}>
                {index === 0 && (
                  <React.Fragment>
                    <div
                      className={cn('text-gray-500 text-xs text-center', text.base)}
                      style={{ padding: '20px 0px 30px 0px' }}>
                      You are chatting with{' '}
                      {config?.agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
                    </div>
                  </React.Fragment>
                )}
                <ChatResponse id={message.id} message={message} />
              </div>
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

export function ChatPanelContainer({ open, ...props }: PanelProps) {
  const { config } = useSuite();

  return (
    <AnimatePresence>
      {open && (
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
          <ChatPanel {...props} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
