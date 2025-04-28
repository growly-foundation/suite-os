'use client';

import { Pencil, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useLayoutEffect } from 'react';
import { ChatMessage, ChatRole } from 'lib/types';
import ChatResponse from './ChatResponse';
import { getNextMessageId } from 'lib/utils/message';

interface PanelProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (message: ChatMessage) => void;
}

export function PanelContainer({ open, onClose, messages, onSend }: PanelProps) {
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
          className="fixed bottom-0 right-0 w-full sm:w-[400px] h-[650px] bg-white shadow-2xl rounded-t-lg sm:rounded-l-lg sm:rounded-t-none z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b bg-primary text-primary-foreground">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/support-avatar.png" />
                  <AvatarFallback>CS</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">Growly Copilot</h2>
                  <p className="text-sm opacity-90">Typically replies in a few minutes</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-primary-foreground/10">
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
          <div className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                required
                placeholder="Send a message..."
                className="flex-1"
              />
              <Button onClick={sendMessageHandler} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
