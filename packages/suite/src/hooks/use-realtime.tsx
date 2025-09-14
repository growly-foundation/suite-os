import { useCallback, useEffect, useRef, useState } from 'react';

import { PresenceStatus, RealtimeMessage } from '@getgrowly/core';

import {
  RealtimeConfig,
  RealtimeEventHandlers,
  RealtimeService,
} from '../services/realtime.service';

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
    onPresence,
    onTyping,
    onRead,
    onUserJoined,
    onUserLeft,
    onError,
  } = options;

  const serviceRef = useRef<RealtimeService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [presence, setPresence] = useState<PresenceStatus[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new RealtimeService();
    }
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && serviceRef.current && serverUrl && userId) {
      const config: RealtimeConfig = {
        serverUrl,
        userId,
        conversationId,
      };

      const handlers: RealtimeEventHandlers = {
        onMessage: message => {
          setMessages(prev => [...prev, message]);
          onMessage?.(message);
        },
        onPresence: presenceData => {
          setPresence(prev => {
            const filtered = prev.filter(p => p.userId !== presenceData.userId);
            return [...filtered, presenceData];
          });
          onPresence?.(presenceData);
        },
        onTyping: typing => {
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
        },
        onRead: read => {
          onRead?.(read);
        },
        onUserJoined: data => {
          onUserJoined?.(data);
        },
        onUserLeft: data => {
          onUserLeft?.(data);
        },
        onError: error => {
          setError(error.message);
          onError?.(error);
        },
      };

      serviceRef.current.connect(config, handlers);
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, [autoConnect, serverUrl, userId]);

  // Monitor connection state
  useEffect(() => {
    const checkConnection = () => {
      if (serviceRef.current) {
        const connected = serviceRef.current.isSocketConnected();
        setIsConnected(connected);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(
    (config: RealtimeConfig) => {
      if (serviceRef.current) {
        serviceRef.current.connect(config, {
          onMessage: message => {
            setMessages(prev => [...prev, message]);
            onMessage?.(message);
          },
          onPresence: presenceData => {
            setPresence(prev => {
              const filtered = prev.filter(p => p.userId !== presenceData.userId);
              return [...filtered, presenceData];
            });
            onPresence?.(presenceData);
          },
          onTyping: typing => {
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
          },
          onRead: read => {
            onRead?.(read);
          },
          onUserJoined: data => {
            onUserJoined?.(data);
          },
          onUserLeft: data => {
            onUserLeft?.(data);
          },
          onError: error => {
            setError(error.message);
            onError?.(error);
          },
        });
      }
    },
    [onMessage, onPresence, onTyping, onRead, onUserJoined, onUserLeft, onError]
  );

  const disconnect = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const joinConversation = useCallback((conversationId: string, userId: string) => {
    if (serviceRef.current) {
      serviceRef.current.joinConversation(conversationId, userId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (serviceRef.current) {
      serviceRef.current.leaveConversation(conversationId);
    }
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, messageId: string, senderId: string) => {
      if (serviceRef.current) {
        serviceRef.current.sendMessage(conversationId, content, messageId, senderId);
      }
    },
    []
  );

  const markAsRead = useCallback((conversationId: string, userId: string) => {
    if (serviceRef.current) {
      serviceRef.current.markAsRead(conversationId, userId);
    }
  }, []);

  const startTyping = useCallback((conversationId: string, userId: string) => {
    if (serviceRef.current) {
      serviceRef.current.startTyping(conversationId, userId);
    }
  }, []);

  const stopTyping = useCallback((conversationId: string, userId: string) => {
    if (serviceRef.current) {
      serviceRef.current.stopTyping(conversationId, userId);
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
