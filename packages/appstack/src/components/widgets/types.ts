export type MessageId = `message-${number}`;

export interface ChatMessage {
  id: MessageId;
  content: string;
  from: ChatRole;
  timestamp: Date;
}

export enum ChatRole {
  User = 'user',
  Agent = 'agent',
  System = 'system',
}
