import { useState } from 'react';
import { FloatingButton } from './FloatingButton';
import { PanelContainer } from './PanelContainer';
import { ChatMessage } from '../../types';

export function ChatWidgetContainer({
  messages,
  onMessageSend,
  open,
  setOpen,
  buttonProps,
}: {
  messages: ChatMessage[];
  onMessageSend: (message: ChatMessage) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <div>
      <FloatingButton onClick={() => setOpen(true)} {...buttonProps} />
      <PanelContainer
        messages={messages}
        onSend={onMessageSend}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export function ChatWidget(
  props: { defaultOpen?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { defaultOpen = false } = props;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ChatWidgetContainer
      messages={messages}
      onMessageSend={message => {
        setMessages(prev => [...prev, message]);
      }}
      open={open}
      setOpen={setOpen}
    />
  );
}
