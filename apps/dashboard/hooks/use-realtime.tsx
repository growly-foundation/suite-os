'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

export interface UseRealtimeOptions extends RealtimeEventHandlers {
  serverUrl: string;
  userId: string;
  conversationId?: string;
  autoConnect?: boolean;
}

export interface UseRealtimeReturn {
  // Connection state
  isConnected: boolean;
  connect: (config: RealtimeConfig) => void;
  disconnect: () => void;

  // Conversation management
  joinConversation: (conversationId: string, userId: string) => void;
  leaveConversation: (conversationId: string) => void;

  // Messaging
  sendMessage: (
    conversationId: string,
    content: string,
    messageId: string,
    senderId: string
  ) => void;
  markAsRead: (conversationId: string, userId: string) => void;

  // Typing indicators
  startTyping: (conversationId: string, userId: string) => void;
  stopTyping: (conversationId: string, userId: string) => void;

  // State
  messages: RealtimeMessage[];
  presence: PresenceStatus[];
  typingUsers: Set<string>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useRealtime(options: UseRealtimeOptions): UseRealtimeReturn {
  const {
    serverUrl,
    userId,
    conversationId,
    autoConnect = true,
    onMessage,
    onTyping,
    onRead,
    onUserJoined,
    onUserLeft,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [presence] = useState<PresenceStatus[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const isConnectingRef = useRef(false);
  const hasConnectedRef = useRef(false);

  // Initialize socket
  useEffect(() => {
    if (
      autoConnect &&
      serverUrl &&
      userId &&
      !isConnectingRef.current &&
      !hasConnectedRef.current
    ) {
      isConnectingRef.current = true;
      hasConnectedRef.current = true;

      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      const socket = io(`${serverUrl}/conversation`, {
        query: {
          userId,
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        isConnectingRef.current = false;
        console.log('✅ Connected to real-time service');

        // Join conversation if provided
        if (conversationId) {
          socket.emit('join_conversation', { conversationId, userId });
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        isConnectingRef.current = false;
        console.log('❌ Disconnected from real-time service');
      });

      socket.on('connect_error', error => {
        console.error('🚨 Connection error:', error);
        setError(error.message);
        setIsConnected(false);
        isConnectingRef.current = false;
      });

      socket.on('reconnect', attemptNumber => {
        console.log('Reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setError(null);
      });

      socket.on('reconnect_error', error => {
        console.error('Reconnection error:', error);
        setError(error.message);
      });

      socket.on('reconnect_failed', () => {
        console.error('Failed to reconnect after maximum attempts');
        setError('Connection failed permanently');
        setIsConnected(false);
      });

      // Message events
      socket.on('new_message', (data: any) => {
        const message: RealtimeMessage = {
          id: data.messageId,
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.timestamp,
          type: 'text',
        };
        setMessages(prev => [...prev, message]);
        onMessage?.(message);
      });

      // Presence events
      socket.on('user_joined', (data: any) => {
        onUserJoined?.(data);
      });

      socket.on('user_left', (data: any) => {
        onUserLeft?.(data);
      });

      // Typing events
      socket.on('user_typing', (data: any) => {
        const typing: TypingIndicator = {
          userId: data.userId,
          conversationId: data.conversationId,
          isTyping: data.isTyping,
          timestamp: data.timestamp,
        };
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (typing.isTyping) {
            newSet.add(typing.userId);
          } else {
            newSet.delete(typing.userId);
          }
          return newSet;
        });
        onTyping?.(typing);
      });

      // Read events
      socket.on('messages_read', (data: any) => {
        const read: ReadReceipt = {
          messageId: data.messageId || '',
          userId: data.userId,
          conversationId: data.conversationId,
          readAt: data.timestamp,
        };
        onRead?.(read);
      });

      // Error events
      socket.on('error', (error: any) => {
        setError(error.message);
        onError?.(error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        isConnectingRef.current = false;
        hasConnectedRef.current = false;
      }
    };
  }, [autoConnect, serverUrl, userId]);

  const connect = useCallback((config: RealtimeConfig) => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }

    const socket = io(`${config.serverUrl}/conversation`, {
      query: {
        userId: config.userId,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (config.conversationId) {
        socket.emit('join_conversation', {
          conversationId: config.conversationId,
          userId: config.userId,
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', error => {
      setError(error.message);
    });

    // Set up other event listeners...
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const joinConversation = useCallback((conversationId: string, userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', { conversationId, userId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_conversation', { conversationId });
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, messageId: string, senderId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          conversationId,
          content,
          messageId,
          senderId,
        });
      }
    },
    []
  );

  const markAsRead = useCallback((conversationId: string, userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', { conversationId, userId });
    }
  }, []);

  const startTyping = useCallback((conversationId: string, userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_start', { conversationId, userId });
    }
  }, []);

  const stopTyping = useCallback((conversationId: string, userId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing_stop', { conversationId, userId });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    messages,
    presence,
    typingUsers,
    error,
    clearError,
  };
}
