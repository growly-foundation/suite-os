import { Socket, io } from 'socket.io-client';

import { PresenceStatus, ReadReceipt, RealtimeMessage, TypingIndicator } from '@getgrowly/core';

export interface RealtimeConfig {
  serverUrl: string;
  userId: string;
  conversationId?: string;
}

export interface RealtimeEventHandlers {
  onMessage?: (message: RealtimeMessage) => void;
  onPresence?: (presence: PresenceStatus) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onRead?: (read: ReadReceipt) => void;
  onUserJoined?: (data: { userId: string; conversationId: string; timestamp: string }) => void;
  onUserLeft?: (data: { userId: string; conversationId: string; timestamp: string }) => void;
  onError?: (error: { message: string }) => void;
}

export class RealtimeService {
  private socket: Socket | null = null;
  private config: RealtimeConfig | null = null;
  private handlers: RealtimeEventHandlers = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {}

  connect(config: RealtimeConfig, handlers: RealtimeEventHandlers = {}) {
    this.config = config;
    this.handlers = handlers;

    if (this.socket?.connected) {
      this.disconnect();
    }

    this.socket = io(`${config.serverUrl}/conversation`, {
      query: {
        userId: config.userId,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to real-time service');

      // Join conversation if provided
      if (this.config?.conversationId) {
        this.joinConversation(this.config.conversationId, this.config.userId);
      }
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from real-time service');
      this.handleReconnect();
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    // Message events
    this.socket.on('new_message', (data: any) => {
      const message: RealtimeMessage = {
        id: data.messageId,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp,
        type: 'text',
      };
      this.handlers.onMessage?.(message);
    });

    // Presence events
    this.socket.on('user_joined', (data: any) => {
      this.handlers.onUserJoined?.(data);
    });

    this.socket.on('user_left', (data: any) => {
      this.handlers.onUserLeft?.(data);
    });

    // Typing events
    this.socket.on('user_typing', (data: any) => {
      const typing: TypingIndicator = {
        userId: data.userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
        timestamp: data.timestamp,
      };
      this.handlers.onTyping?.(typing);
    });

    // Read events
    this.socket.on('messages_read', (data: any) => {
      const read: ReadReceipt = {
        messageId: data.messageId || '',
        userId: data.userId,
        conversationId: data.conversationId,
        readAt: data.timestamp,
      };
      this.handlers.onRead?.(read);
    });

    // Error events
    this.socket.on('error', (error: any) => {
      this.handlers.onError?.(error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (this.config && !this.isConnected) {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect(this.config, this.handlers);
      }
    }, delay);
  }

  joinConversation(conversationId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot join conversation.');
      return;
    }

    this.socket.emit('join_conversation', { conversationId, userId });
    console.log(`Joined conversation: ${conversationId}`);
  }

  leaveConversation(conversationId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot leave conversation.');
      return;
    }

    this.socket.emit('leave_conversation', { conversationId });
    console.log(`Left conversation: ${conversationId}`);
  }

  sendMessage(conversationId: string, content: string, messageId: string, senderId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot send message.');
      return;
    }

    this.socket.emit('send_message', {
      conversationId,
      content,
      messageId,
      senderId,
    });
  }

  markAsRead(conversationId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot mark as read.');
      return;
    }

    this.socket.emit('mark_as_read', { conversationId, userId });
  }

  startTyping(conversationId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot start typing.');
      return;
    }

    this.socket.emit('typing_start', { conversationId, userId });
  }

  stopTyping(conversationId: string, userId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected. Cannot stop typing.');
      return;
    }

    this.socket.emit('typing_stop', { conversationId, userId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  updateHandlers(handlers: Partial<RealtimeEventHandlers>) {
    this.handlers = { ...this.handlers, ...handlers };
  }
}
