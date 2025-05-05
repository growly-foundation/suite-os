import { ChatMessage, ChatRole } from '@growly/sdk';
import { ChatWidgetContainer } from '../ChatWidget';
import { useState } from 'react';
import { ETHToken, USDCToken } from './tokens';

const mockMessages: ChatMessage[] = [
  {
    id: 'message-1',
    message: {
      type: 'text',
      content: 'Hi, How are you?',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-2',
    message: {
      type: 'text',
      content: 'I am doing great, thank you for asking!',
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-3',
    message: {
      type: 'text',
      content: 'That is so cool! I was worried that you might be having a bad day.',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-4',
    message: {
      type: 'text',
      content:
        'No, I am doing great. I have a lot of amazing conversations with users like you. I am also learning a lot from them. Did you know that DeFi (Decentralized Finance) is a rapidly growing industry?',
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-5',
    message: {
      type: 'text',
      content:
        'I am glad to hear that! I am also learning a lot from you. Yes, I am familiar with DeFi. I have been following it for a while now.',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-6',
    message: {
      type: 'text',
      content:
        'I am happy to help you with anything you need. I am here to assist you. Do you have any questions about DeFi?',
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-7',
    message: {
      type: 'text',
      content: 'I have a question for you. What do you think about the potential of DeFi?',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-8',
    message: {
      type: 'text',
      content:
        'I think DeFi has a lot of potential to revolutionize the financial industry. It is a rapidly growing industry that is still in its early stages.',
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-9',
    message: {
      type: 'text',
      content:
        'I think it is really cool how DeFi can be used to create more decentralized and secure financial systems.',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-10',
    message: {
      type: 'text',
      content: 'I am glad to hear that! DeFi is a really interesting topic.',
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-11',
    message: {
      type: 'onchainkit:swap',
      content: {
        swappableTokens: [ETHToken, USDCToken],
        fromToken: ETHToken,
        toToken: USDCToken,
      },
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-12',
    message: {
      type: 'text',
      content:
        'I am also learning a lot from you. Yes, I am familiar with DeFi. I have been following it for a while now.',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-13',
    message: {
      type: 'text',
      content: 'Can you discover info about Ethereum?',
    },
    from: ChatRole.User,
    timestamp: new Date(),
  },
  {
    id: 'message-14',
    message: {
      type: 'onchainkit:token',
      content: {
        token: ETHToken,
      },
    },
    from: ChatRole.Agent,
    timestamp: new Date(),
  },
  {
    id: 'message-15',
    message: {
      type: 'text',
      content: 'Ethereum is a decentralized platform for building and running smart contracts.',
    },
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
