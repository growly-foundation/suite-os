'use client';

import { useRealtime } from '@/hooks/use-realtime';
import { OnlineStatusContextType } from '@/types/online-status.types';
import React, { createContext, useEffect, useState } from 'react';

import { RedisService } from '@getgrowly/core';

export const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

interface OnlineStatusProviderProps {
  children: React.ReactNode;
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [redisService, setRedisService] = useState<RedisService | null>(null);

  // Initialize Redis service
  useEffect(() => {
    const redisUrl = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      setRedisService(new RedisService(redisUrl, redisToken));
    }
  }, []);

  const { isConnected } = useRealtime({
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080',
    userId: 'admin',
    autoConnect: true,
    onUserJoined: data => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    },
    onUserLeft: data => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    },
  });

  // Check existing presence keys from Redis
  const checkExistingPresence = async () => {
    if (!redisService) return;

    try {
      // Get all presence keys from Redis
      const presenceKeys = await redisService.getAllPresenceKeys();
      const onlineUserIds = new Set<string>();

      for (const key of presenceKeys) {
        // Extract userId from presence:<userId> key
        const userId = key.replace('presence:', '');
        if (userId) {
          onlineUserIds.add(userId);
        }
      }

      setOnlineUsers(onlineUserIds);
      console.log('📊 Loaded existing online users from Redis:', Array.from(onlineUserIds));
    } catch (error) {
      console.error('Error checking existing presence:', error);
    }
  };

  // Load existing presence when Redis service is available
  useEffect(() => {
    if (redisService && isConnected) {
      checkExistingPresence();
    }
  }, [redisService, isConnected]);

  const isUserOnline = async (userId: string): Promise<boolean> => {
    // First check local state
    if (onlineUsers.has(userId)) {
      return true;
    }

    // If not in local state, check Redis directly
    if (redisService) {
      try {
        return await redisService.isOnline(userId);
      } catch (error) {
        console.error('Error checking user online status:', error);
        return false;
      }
    }

    return false;
  };

  const getOnlineCount = (): number => {
    return onlineUsers.size;
  };

  const value: OnlineStatusContextType = {
    onlineUsers,
    isUserOnline,
    getOnlineCount,
  };

  return <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>;
};
