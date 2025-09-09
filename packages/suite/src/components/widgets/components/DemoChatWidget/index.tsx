import { useSuiteSession } from '@/hooks/use-session';
import { useEffect } from 'react';

import { ConversationRole, ParsedMessage } from '@getgrowly/core';

import { ChatWidgetContainer } from '../ChatWidget';

const conversation = {
  id: 'conversation-1',
  agent_id: '1',
  user_id: '1',
};

const mockMessages: ParsedMessage[] = [
  {
    id: 'message-1',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'Hi, How are you?',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-2',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'I am doing great, thank you for asking!',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-3',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'That is so cool! I was worried that you might be having a bad day.',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-4',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'No, I am doing great. I have a lot of amazing conversations with users like you. I am also learning a lot from them. Did you know that DeFi (Decentralized Finance) is a rapidly growing industry?',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-5',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'I am glad to hear that! I am also learning a lot from you. Yes, I am familiar with DeFi. I have been following it for a while now.',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-6',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'I am happy to help you with anything you need. I am here to assist you. Do you have any questions about DeFi?',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-7',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'I have a question for you. What do you think about the potential of DeFi?',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-8',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'I think DeFi has a lot of potential to revolutionize the financial industry. It is a rapidly growing industry that is still in its early stages.',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-9',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'I think it is really cool how DeFi can be used to create more decentralized and secure financial systems.',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-10',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'I am glad to hear that! DeFi is a really interesting topic.',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-11',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'I can help you with token swaps, but the OnchainKit integration has been removed.',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-12',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'I am also learning a lot from you. Yes, I am familiar with DeFi. I have been following it for a while now.',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-13',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'Can you discover info about Ethereum?',
    sender: ConversationRole.User,
    sender_id: conversation.user_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-14',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content:
      'Ethereum (ETH) is a decentralized platform that enables smart contracts and decentralized applications (dApps).',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
  {
    id: 'message-15',
    type: 'text',
    conversation_id: conversation.id,
    embedding: null,
    content: 'Ethereum is a decentralized platform for building and running smart contracts.',
    sender: ConversationRole.Agent,
    sender_id: conversation.agent_id,
    created_at: new Date().toISOString(),
  },
];

export function DemoChatWidget() {
  const { setMessages } = useSuiteSession();

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  return <ChatWidgetContainer />;
}
