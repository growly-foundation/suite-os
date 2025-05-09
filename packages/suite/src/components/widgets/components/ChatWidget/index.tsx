import { useState } from 'react';
import { FloatingButton } from './FloatingButton';
import { ChatPanelContainer, ChatPanel } from './ChatPanel';
import { ParsedMessage } from '@growly/core';

function ChatWidgetContainer({
  messages,
  onMessageSend,
  open,
  setOpen,
  buttonProps,
}: {
  messages: ParsedMessage[];
  onMessageSend: (message: ParsedMessage) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <div>
      <FloatingButton onClick={() => setOpen(true)} {...buttonProps} />
      <ChatPanelContainer
        messages={messages}
        onSend={onMessageSend}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function ChatWidget(
  props: { defaultOpen?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { defaultOpen = false } = props;
  const [messages, setMessages] = useState<ParsedMessage[]>([]);
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

export { ChatPanel, ChatWidgetContainer, ChatWidget };
