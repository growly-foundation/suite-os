export type MessageId = `message-${number}`;

export interface ChatMessage {
  id: MessageId;
  message: TextMessage | OnchainKitMessage;
  from: ChatRole;
  timestamp: Date;
}

interface TextMessage {
  type: 'text';
  content: string;
}

interface OnchainKitMessage {
  type: 'onchainkit:swap' | 'onchainkit:token' | 'onchainkit:identity';
  content: React.ReactNode;
}

export enum ChatRole {
  User = 'user',
  Agent = 'agent',
  System = 'system',
}
