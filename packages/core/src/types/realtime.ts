export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'admin';
}

export interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface UnreadCount {
  conversationId: string;
  userId: string;
  count: number;
}

export interface ConversationEvent {
  type: 'message' | 'presence' | 'typing' | 'read';
  data: any;
  timestamp: string;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  conversationId: string;
  readAt: string;
}

export type RealtimeEventHandler = (event: ConversationEvent) => void;
export type MessageEventHandler = (message: RealtimeMessage) => void;
export type PresenceEventHandler = (presence: PresenceStatus) => void;
export type TypingEventHandler = (typing: TypingIndicator) => void;
