import { UnreadCount } from '@/types/realtime';
import { Redis } from '@upstash/redis';

export interface PresenceData {
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface MessageEvent {
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageId: string;
}

export class RedisService {
  private redis: Redis;
  private presenceTTL = 60 * 20; // 20 minutes
  private lastSeenTTL = 86400; // 24 hours

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }

  // Presence Management
  async setOnline(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    await this.redis.setex(key, this.presenceTTL, 'online');
  }

  async setOffline(userId: string): Promise<void> {
    const presenceKey = `presence:${userId}`;
    const lastSeenKey = `lastSeen:${userId}`;
    const timestamp = new Date().toISOString();

    // Remove from online presence
    await this.redis.del(presenceKey);

    // Set last seen timestamp
    await this.redis.setex(lastSeenKey, this.lastSeenTTL, timestamp);
  }

  async isOnline(userId: string): Promise<boolean> {
    const key = `presence:${userId}`;
    const result = await this.redis.get(key);
    return result === 'online';
  }

  async getPresenceData(userId: string): Promise<PresenceData> {
    const isUserOnline = await this.isOnline(userId);

    if (isUserOnline) {
      return { status: 'online' };
    }

    const lastSeenKey = `lastSeen:${userId}`;
    const lastSeen = await this.redis.get(lastSeenKey);

    return {
      status: 'offline',
      lastSeen: (lastSeen as string) || undefined,
    };
  }

  async refreshPresence(userId: string): Promise<void> {
    await this.setOnline(userId);
  }

  // Unread Count Management
  async incrementUnreadCount(conversationId: string, userId: string): Promise<number> {
    const key = `unread:${conversationId}:${userId}`;
    const result = await this.redis.incr(key);
    return result;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const key = `unread:${conversationId}:${userId}`;
    await this.redis.del(key);
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const key = `unread:${conversationId}:${userId}`;
    const result = await this.redis.get(key);
    return result ? parseInt(result as string, 10) : 0;
  }

  async getUnreadCountsForUser(userId: string): Promise<UnreadCount[]> {
    const pattern = `unread:*:${userId}`;
    const keys = await this.redis.keys(pattern);

    const counts: UnreadCount[] = [];

    for (const key of keys) {
      const count = await this.redis.get(key);
      if (count) {
        // Extract conversationId from key pattern "unread:conversationId:userId"
        const conversationId = key.split(':')[1];
        counts.push({
          conversationId,
          userId,
          count: parseInt(count as string, 10),
        });
      }
    }

    return counts;
  }

  // Message Delivery
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageId: string
  ): Promise<void> {
    const channel = `messages:${conversationId}`;
    const messageEvent: MessageEvent = {
      conversationId,
      senderId,
      content,
      timestamp: new Date().toISOString(),
      messageId,
    };

    // Publish message to channel
    await this.redis.publish(channel, JSON.stringify(messageEvent));
  }

  async subscribeToConversation(
    conversationId: string,
    callback: (message: MessageEvent) => void
  ): Promise<void> {
    const channel = `messages:${conversationId}`;

    // Note: In a real implementation, you'd use Redis Streams or a persistent connection
    // This is a simplified version for demonstration
    // const subscription = await this.redis.subscribe(channel, message => {
    //   try {
    //     const messageEvent: MessageEvent = JSON.parse(message as string);
    //     callback(messageEvent);
    //   } catch (error) {
    //     console.error('Error parsing message:', error);
    //   }
    // });
  }

  // Utility methods
  async getConversationParticipants(conversationId: string): Promise<string[]> {
    // This would typically come from your database
    // For now, we'll use a pattern to find all presence keys
    const pattern = 'presence:*';
    const keys = await this.redis.keys(pattern);
    return keys.map(key => key.replace('presence:', ''));
  }

  async broadcastToConversation(
    conversationId: string,
    event: any,
    excludeUserId?: string
  ): Promise<void> {
    const participants = await this.getConversationParticipants(conversationId);

    for (const userId of participants) {
      if (excludeUserId && userId === excludeUserId) {
        continue;
      }

      const userChannel = `user:${userId}`;
      await this.redis.publish(userChannel, JSON.stringify(event));
    }
  }

  // Get all presence keys
  async getAllPresenceKeys(): Promise<string[]> {
    try {
      const pattern = 'presence:*';
      const keys = await this.redis.keys(pattern);
      return keys;
    } catch (error) {
      console.error('Error getting presence keys:', error);
      return [];
    }
  }

  // Cleanup methods
  async cleanupExpiredPresence(): Promise<void> {
    // Redis TTL handles this automatically, but you might want to add cleanup logic
    const pattern = 'presence:*';
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no TTL, remove it
        await this.redis.del(key);
      }
    }
  }
}
