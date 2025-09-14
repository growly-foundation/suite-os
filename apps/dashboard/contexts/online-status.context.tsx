'use client';

import { OnlineStatusContextType } from '@/types/online-status.types';
import React, { createContext, useEffect, useState } from 'react';

import { RedisService } from '@getgrowly/core';

// eslint-disable-next-line react-refresh/only-export-components
export const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

interface OnlineStatusProviderProps {
  children: React.ReactNode;
}

export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [redisService, setRedisService] = useState<RedisService | null>(null);

  // Check existing presence keys from Redis
  const checkExistingPresence = async () => {
    if (!redisService) return;

    try {
      const redisUrl = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN;

      if (redisUrl && redisToken) {
        setRedisService(new RedisService(redisUrl, redisToken));
      }
      // Get all presence keys from Redis
      const presenceKeys = await redisService.getAllPresenceKeys();
      console.log('📊 Loaded existing presence keys from Redis:', presenceKeys);
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
    setInterval(() => {
      checkExistingPresence();
    }, 5000);
  }, []);

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
