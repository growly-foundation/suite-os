import { Token } from '@coinbase/onchainkit/token';

export type MessageId = `message-${number}`;

export interface ChatMessage {
  id: MessageId;
  message: TextMessage | OnchainKitSwapMessage | OnchainKitTokenMessage;
  from: ChatRole;
  timestamp: Date;
}

export interface TextMessage {
  type: 'text';
  content: string;
}

export interface OnchainKitSwapMessage {
  type: 'onchainkit:swap';
  content: {
    fromToken: Token;
    toToken: Token;
    swappableTokens: Token[];
  };
}

export interface OnchainKitTokenMessage {
  type: 'onchainkit:token';
  content: {
    token: Token;
  };
}

export enum ChatRole {
  User = 'user',
  Agent = 'agent',
  System = 'system',
}
