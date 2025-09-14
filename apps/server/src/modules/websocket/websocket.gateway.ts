import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { RedisService } from '@getgrowly/core';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  conversationId?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8888'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/conversation',
})
export class ConversationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConversationGateway.name);
  private redisService: RedisService;
  private connectedUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const redisToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (redisUrl && redisToken) {
      this.redisService = new RedisService(redisUrl, redisToken);
    } else {
      this.logger.warn('Redis configuration not found. Real-time features will be disabled.');
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Extract userId from query parameters or headers
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.userId = userId;
      await this.redisService?.setOnline(userId);
      this.logger.log(`User ${userId} is now online`);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    if (client.userId) {
      await this.redisService?.setOffline(client.userId);
      this.logger.log(`User ${client.userId} is now offline`);

      // Remove from conversation tracking
      if (client.conversationId) {
        const users = this.connectedUsers.get(client.conversationId);
        if (users) {
          users.delete(client.userId);
          if (users.size === 0) {
            this.connectedUsers.delete(client.conversationId);
          }
        }
      }
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    if (!client.userId) {
      client.userId = userId;
    }

    // Check if user is already in this conversation
    if (client.conversationId === conversationId) {
      this.logger.log(`User ${userId} already in conversation ${conversationId}, skipping join`);
      return;
    }

    // Leave previous conversation if any
    if (client.conversationId) {
      await this.handleLeaveConversation(client, { conversationId: client.conversationId });
    }

    // Join the conversation room
    await client.join(conversationId);
    client.conversationId = conversationId;

    // Track connected users
    if (!this.connectedUsers.has(conversationId)) {
      this.connectedUsers.set(conversationId, new Set());
    }
    this.connectedUsers.get(conversationId)!.add(userId);

    // Set user as online
    await this.redisService?.setOnline(userId);

    // Notify others in the conversation
    client.to(conversationId).emit('user_joined', {
      userId,
      conversationId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${userId} joined conversation ${conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    const { conversationId } = data;

    if (client.userId) {
      // Remove from conversation tracking
      const users = this.connectedUsers.get(conversationId);
      if (users) {
        users.delete(client.userId);
        if (users.size === 0) {
          this.connectedUsers.delete(conversationId);
        }
      }

      // Notify others in the conversation
      client.to(conversationId).emit('user_left', {
        userId: client.userId,
        conversationId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${client.userId} left conversation ${conversationId}`);
    }

    await client.leave(conversationId);
    client.conversationId = undefined;
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      messageId: string;
      senderId: string;
    }
  ) {
    const { conversationId, content, messageId, senderId } = data;

    if (!this.redisService) {
      this.logger.warn('Redis service not available. Message not sent to Redis.');
      return;
    }

    try {
      // Send message to Redis channel
      await this.redisService.sendMessage(conversationId, senderId, content, messageId);

      // Broadcast to all connected clients in the conversation
      this.server.to(conversationId).emit('new_message', {
        conversationId,
        senderId,
        content,
        messageId,
        timestamp: new Date().toISOString(),
      });

      // Increment unread count for all participants except sender
      const users = this.connectedUsers.get(conversationId);
      if (users) {
        for (const userId of users) {
          if (userId !== senderId) {
            await this.redisService.incrementUnreadCount(conversationId, userId);
          }
        }
      }

      this.logger.log(`Message sent in conversation ${conversationId} by ${senderId}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    if (!this.redisService) {
      this.logger.warn('Redis service not available. Cannot mark as read.');
      return;
    }

    try {
      await this.redisService.markAsRead(conversationId, userId);

      // Notify others that messages were read
      client.to(conversationId).emit('messages_read', {
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Messages marked as read in conversation ${conversationId} by ${userId}`);
    } catch (error) {
      this.logger.error('Error marking messages as read:', error);
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    // Notify others in the conversation
    client.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping: true,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; userId: string }
  ) {
    const { conversationId, userId } = data;

    // Notify others in the conversation
    client.to(conversationId).emit('user_typing', {
      conversationId,
      userId,
      isTyping: false,
      timestamp: new Date().toISOString(),
    });
  }

  // Method to broadcast message from server (e.g., from API endpoints)
  async broadcastMessage(conversationId: string, message: any) {
    this.server.to(conversationId).emit('new_message', message);
  }

  // Method to get online users in a conversation
  getOnlineUsers(conversationId: string): string[] {
    const users = this.connectedUsers.get(conversationId);
    return users ? Array.from(users) : [];
  }

  // Method to check if user is online
  async isUserOnline(userId: string): Promise<boolean> {
    if (!this.redisService) return false;
    return await this.redisService.isOnline(userId);
  }
}
