import { ChatMessage, ChatRole } from '@/components/widgets/types';
import { ChatWidgetContainer } from '../ChatWidget';
import { useState } from 'react';

const mockMessages: ChatMessage[] = [
  {
    id: 'message-1',
    content: 'Hi, How are you?',
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-2',
    content: 'I am doing great, thank you for asking!',
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-3',
    content: 'That is so cool! I was worried that you might be having a bad day.',
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-4',
    content:
      'No, I am doing great. I have a lot of amazing conversations with users like you. I am also learning a lot from them. Did you know that DeFi (Decentralized Finance) is a rapidly growing industry?',
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-5',
    content:
      'I am glad to hear that! I am also learning a lot from you. Yes, I am familiar with DeFi. I have been following it for a while now.',
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-6',
    content:
      'I am happy to help you with anything you need. I am here to assist you. Do you have any questions about DeFi?',
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-7',
    content: 'I have a question for you. What do you think about the potential of DeFi?',
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-8',
    content:
      'I think DeFi has a lot of potential to revolutionize the financial industry. It is a rapidly growing industry that is still in its early stages.',
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-9',
    content:
      'I think it is really cool how DeFi can be used to create more decentralized and secure financial systems.',
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-10',
    content: 'I am glad to hear that! DeFi is a really interesting topic.',
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
];

export function DemoChatWidget(
  props: { defaultOpen?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { defaultOpen = false } = props;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ChatWidgetContainer
      messages={mockMessages}
      onMessageSend={message => {
        mockMessages.push(message);
      }}
      open={open}
      setOpen={setOpen}
    />
  );
}
