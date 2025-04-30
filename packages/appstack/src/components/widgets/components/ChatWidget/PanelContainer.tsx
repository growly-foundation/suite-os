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
import AgentAvatar from '../AgentAvatar';
import { useWidget } from '../WidgetConfigProvider';
import { BRAND_NAME_CAPITALIZED } from '@/constants';

interface PanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (message: ChatMessage) => void;
}

export function PanelContainer({ open, onClose, messages, onSend }: PanelProps) {
  const { config } = useWidget();
  const [refreshing, setRefreshing] = React.useState(+new Date());
  const [inputValue, setInputValue] = React.useState('');

  const sendMessageHandler = () => {
    if (inputValue.trim().length > 0) {
      const lastestMessage = messages[messages.length - 1];
      const newMessage: ChatMessage = {
        id: getNextMessageId(lastestMessage.id),
        content: inputValue,
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 right-0 w-full max-w-[500px] sm:w-[400px] h-[650px] shadow-2xl rounded-t-lg sm:rounded-l-lg sm:rounded-t-none z-[9999] flex flex-col overflow-hidden"
          style={{
            backgroundColor: config?.theme?.background,
          }}>
          {/* Header */}
          <div
            className="p-4 border-b"
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
          {/* No messages yet */}
          <ScrollArea className="flex-1 max-h-[500px]" style={{ padding: '0px 15px' }}>
            {messages.length > 0 ? (
              <React.Fragment>
                {messages.map(message => (
                  <ChatResponse key={message.id} id={message.id} message={message} />
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
          <div className="p-4 border-t" style={{ backgroundColor: config?.theme?.background }}>
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                required
                placeholder="Send a message..."
                className="flex-1"
              />
              <Button color={config?.theme?.primary} onClick={sendMessageHandler}>
                Send <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
