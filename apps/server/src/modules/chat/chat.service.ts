import { Injectable, Logger } from '@nestjs/common';

import { RedisService } from '@getgrowly/core';

import { AgentService } from '../agent/agent.service';
import { ConversationGateway } from '../websocket/websocket.gateway';

interface ChatRequest {
  message: string;
  userId: string;
  agentId: string;
  conversationId?: string;
  messageId?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private redisService: RedisService;

  constructor(
    private readonly agentService: AgentService,
    private readonly conversationGateway: ConversationGateway
  ) {
    // Initialize Redis service if environment variables are available
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken) {
      this.redisService = new RedisService(redisUrl, redisToken);
    }
  }

  async dumbChat({ message, userId, agentId, conversationId, messageId }: ChatRequest) {
    try {
      this.logger.log('Processing with multi-agent supervisor...');
      const reply = await this.agentService.chat({
        message,
        userId,
        agentId,
      });

      // Send real-time message if Redis is available and conversationId is provided
      if (this.redisService && conversationId && messageId) {
        await this.sendRealtimeMessage(conversationId, userId, message, messageId);
      }

      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(`Error in chat processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  async advancedChat({ message, userId, agentId, conversationId, messageId }: ChatRequest) {
    try {
      this.logger.log('Processing with multi-agent supervisor...');
      const reply = await this.agentService.advancedChat({
        message,
        userId,
        agentId,
      });

      // Send real-time message if Redis is available and conversationId is provided
      if (this.redisService && conversationId && messageId) {
        await this.sendRealtimeMessage(conversationId, userId, message, messageId);
      }

      // Return the response
      return reply;
    } catch (error) {
      this.logger.error(`Error in chat processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async sendRealtimeMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageId: string
  ) {
    try {
      // Send to Redis channel
      await this.redisService.sendMessage(conversationId, senderId, content, messageId);

      // Broadcast via WebSocket
      await this.conversationGateway.broadcastMessage(conversationId, {
        conversationId,
        senderId,
        content,
        messageId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Real-time message sent for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error('Error sending real-time message:', error);
    }
  }

  async markAsRead(conversationId: string, userId: string) {
    if (this.redisService) {
      await this.redisService.markAsRead(conversationId, userId);
    }
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    if (this.redisService) {
      return await this.redisService.getUnreadCount(conversationId, userId);
    }
    return 0;
  }

  async isUserOnline(userId: string): Promise<boolean> {
    if (this.redisService) {
      return await this.redisService.isOnline(userId);
    }
    return false;
  }
}
