'use client';

import { Pencil, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import React, { useLayoutEffect } from 'react';
import { ChatMessage, ChatRole } from '@/components/widgets/types';
import ChatResponse from './ChatResponse';
import { getNextMessageId } from '@/components/widgets/utils/message';
import AgentAvatar from '../../../agent/components/AgentAvatar';
import { useAppStack } from '@/provider';
import { BRAND_NAME_CAPITALIZED } from '@/constants';
import { Avatar, Identity, Name, Badge, Address } from '@coinbase/onchainkit/identity';
import { border, cn, pressable } from '@/styles/theme';

interface PanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (message: ChatMessage) => void;
}

export function ChatPanel({ onClose, messages, onSend }: Omit<PanelProps, 'open'>) {
  const { config } = useAppStack();
  const [refreshing, setRefreshing] = React.useState(+new Date());
  const [inputValue, setInputValue] = React.useState('');

  const sendMessageHandler = () => {
    if (inputValue.trim().length > 0) {
      const lastestMessage = messages[messages.length - 1];
      const newMessage: ChatMessage = {
        id: lastestMessage ? getNextMessageId(lastestMessage.id) : 'message-0',
        message: {
          type: 'text',
          content: inputValue,
        },
        from: ChatRole.User,
        timestamp: new Date(),
      };
      onSend(newMessage);
      setRefreshing(+new Date());
      setInputValue('');
    }
  };

  useLayoutEffect(() => {
    const lastestMessage = messages[messages.length - 1];
    if (lastestMessage) {
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
            <AgentAvatar />
            <div>
              <h2 className="font-semibold">
                {config?.agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
              </h2>
              <p className="text-sm opacity-90">Typically replies in a few minutes</p>
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
      <ScrollArea className="flex-1 max-h-[500px]" style={{ padding: '0px 15px' }}>
        {messages.length > 0 ? (
          <React.Fragment>
            {messages.map((message, index) => (
              <div key={message.id}>
                {index === 0 && (
                  <React.Fragment>
                    <div
                      className="text-gray-500 text-xs text-center"
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
          <div className="p-[50px] text-gray-500">
            <div style={{ marginBottom: '10px' }}>
              <Pencil className="h-6 w-6 mr-2" />
            </div>
            <div className="mt-2">
              This conversation just started. Send a message to get started.
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div
        className={cn('p-4 border-t', border.lineDefault)}
        style={{ backgroundColor: config?.theme?.background }}>
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            required
            placeholder="Send a message..."
            style={{
              border: 'none',
            }}
            className={cn('flex-1', border.lineDefault)}
          />
          <Button
            className={cn(border.defaultActive, pressable.inverse)}
            style={{
              backgroundColor: config?.theme?.primary,
              color: config?.theme?.text,
            }}
            onClick={sendMessageHandler}>
            Send <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
}

export function ChatPanelContainer({ open, ...props }: PanelProps) {
  const { config } = useAppStack();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed rounded-t-lg bottom-0 right-0 w-full max-w-[400px] sm:w-[400px] h-[650px] shadow-2xl z-[9999] flex flex-col overflow-hidden',
            border.lineDefault
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
