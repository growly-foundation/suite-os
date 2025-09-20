import { ConversationRole, LatestConversation, Message } from '@/models';
import { SupabaseClient } from '@supabase/supabase-js';

import { PerformanceMonitor } from '../utils/performance-monitor';
import { PublicDatabaseService } from './database.service';

export class ConversationService {
  constructor(
    private supabase: SupabaseClient,
    private messageDatabaseService: PublicDatabaseService<'messages'>,
    private conversationDatabaseService: PublicDatabaseService<'conversation'>
  ) {}

  async createConversationIfNotExists(agent_id: string, user_id: string) {
    // Optimized: Use upsert to avoid the initial lookup round trip
    // This uses PostgreSQL's ON CONFLICT to handle the "if not exists" logic at the database level
    const { data, error } = await this.supabase
      .schema('public')
      .from('conversation')
      .upsert(
        { agent_id, user_id },
        {
          onConflict: 'agent_id,user_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      // Fallback to the original method if upsert fails (e.g., no unique constraint)
      const conversation = await this.conversationDatabaseService.getOneByFields({
        agent_id,
        user_id,
      });
      if (!conversation) {
        return this.conversationDatabaseService.create({
          agent_id,
          user_id,
        });
      }
      return conversation;
    }

    return data;
  }

  async getMessagesOfAgentAndUser(
    agent_id: string,
    user_id: string,
    ascending = false
  ): Promise<Message[]> {
    // Optimized: Single query using LEFT JOIN to get both conversation existence and messages
    // This completely eliminates any additional round trips
    const { data, error } = await this.supabase
      .schema('public')
      .from('conversation')
      .select(
        `
        id,
        messages (
          id,
          conversation_id,
          content,
          sender,
          sender_id,
          embedding,
          created_at
        )
      `
      )
      .eq('agent_id', agent_id)
      .eq('user_id', user_id)
      .order('created_at', {
        ascending,
        foreignTable: 'messages',
      });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Conversation not found');
    }

    const conversation = data[0];

    // If conversation exists but has no messages, return empty array
    if (!conversation.messages || conversation.messages.length === 0) {
      return [];
    }

    // Return the messages directly (they're already in the correct format)
    return conversation.messages;
  }

  /**
   * Get messages with cursor-based pagination (latest to oldest)
   * Optimized for infinite scroll loading
   */
  async getMessagesOfAgentAndUserPaginated(
    agent_id: string,
    user_id: string,
    options: {
      limit?: number;
      cursor?: string; // created_at timestamp for cursor pagination
      ascending?: boolean;
    } = {}
  ): Promise<{
    messages: Message[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const { limit = 20, cursor, ascending = false } = options;

    // First, get the conversation ID
    const { data: conversationData, error: convError } = await this.supabase
      .schema('public')
      .from('conversation')
      .select('id')
      .eq('agent_id', agent_id)
      .eq('user_id', user_id)
      .single();

    if (convError || !conversationData) {
      throw new Error('Conversation not found');
    }

    // Build the messages query with proper cursor-based pagination
    let messagesQuery = this.supabase
      .schema('public')
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationData.id)
      .order('created_at', { ascending })
      .limit(limit + 1); // Fetch one extra to check if there are more

    // Apply cursor pagination if provided
    if (cursor) {
      const operator = ascending ? 'gt' : 'lt';
      messagesQuery = messagesQuery.filter('created_at', operator, cursor);
    }

    const { data: messagesData, error: messagesError } = await messagesQuery;

    if (messagesError) {
      throw new Error(`Failed to fetch paginated messages: ${messagesError.message}`);
    }

    if (!messagesData) {
      return { messages: [], hasMore: false };
    }

    // Check if there are more messages
    const hasMore = messagesData.length > limit;
    const messages = hasMore ? messagesData.slice(0, limit) : messagesData;

    // Get next cursor from the last message (oldest when descending, newest when ascending)
    const nextCursor =
      hasMore && messages.length > 0 ? messages[messages.length - 1].created_at : undefined;

    return {
      messages,
      nextCursor,
      hasMore,
    };
  }

  async addMessageToConversation({
    agent_id,
    user_id,
    message,
    sender,
    sender_id,
    existingEmbedding,
  }: {
    agent_id: string;
    user_id: string;
    message: string;
    sender: ConversationRole;
    sender_id?: string;
    existingEmbedding?: number[];
  }) {
    const getSenderId = (sender: ConversationRole) => {
      switch (sender) {
        case ConversationRole.User:
          return user_id;
        case ConversationRole.Agent:
          return agent_id;
        default:
          return sender_id;
      }
    };
    const conversation = await this.createConversationIfNotExists(agent_id, user_id);
    return this.messageDatabaseService.create({
      content: message,
      conversation_id: conversation.id,
      sender,
      sender_id: getSenderId(sender),
      embedding: JSON.stringify(existingEmbedding),
    });
  }

  async getLatestConversation(user_id: string) {
    return this.conversationDatabaseService.getOneByFields(
      {
        user_id,
      },
      {
        field: 'created_at',
        ascending: false,
      }
    );
  }

  async getPaginatedLatestConversations(
    agent_id: string,
    limit: number,
    offset: number
  ): Promise<(LatestConversation & { userId: string })[]> {
    return PerformanceMonitor.measureAsync(
      `getPaginatedLatestConversations-${agent_id}`,
      async () => {
        try {
          // Use optimized Supabase query with JOIN for maximum performance
          const { data, error } = await this.supabase
            .schema('public')
            .from('conversation')
            .select(
              `
                id,
                agent_id,
                user_id,
                messages!inner(
                  id,
                  content,
                  created_at,
                  sender,
                  sender_id
                )
              `
            )
            .eq('agent_id', agent_id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (error) {
            console.error('Database query error:', error);
            return [];
          }

          if (!data) return [];

          // Transform the data to match our expected format
          const conversations = data
            .map(conv => {
              // Get the latest message (first one due to our ordering)
              const latestMessage = conv.messages?.[conv.messages.length - 1];
              if (!latestMessage) return null;

              return {
                conversationId: conv.id,
                agentId: conv.agent_id,
                userId: conv.user_id,
                message: {
                  id: latestMessage.id,
                  content: latestMessage.content,
                  created_at: latestMessage.created_at,
                  conversation_id: conv.id,
                  sender: latestMessage.sender,
                  sender_id: latestMessage.sender_id,
                } as Message,
              };
            })
            .filter((conv): conv is LatestConversation & { userId: string } => conv !== null);

          return conversations.sort((a, b) => {
            return (
              new Date(b.message.created_at!).getTime() - new Date(a.message.created_at!).getTime()
            );
          });
        } catch (error) {
          console.error('Error getting paginated conversations:', error);
          return [];
        }
      }
    );
  }

  async getConversationsWithMessagesCount(agent_id: string): Promise<number> {
    return PerformanceMonitor.measureAsync(
      `getConversationsWithMessagesCount-${agent_id}`,
      async () => {
        try {
          // Use a more efficient count query
          const { count, error } = await this.supabase
            .schema('public')
            .from('conversation')
            .select('id', { count: 'estimated', head: true })
            .eq('agent_id', agent_id);

          if (error) {
            console.error('Database count query error:', error);
            return 0;
          }

          return count || 0;
        } catch (error) {
          console.error('Error getting conversations count:', error);
          return 0;
        }
      }
    );
  }

  async getLatestConversationMessage(
    user_id: string,
    agent_id: string
  ): Promise<LatestConversation | undefined> {
    try {
      const conversation = await this.conversationDatabaseService.getOneByFields({
        agent_id,
        user_id,
      });
      if (!conversation) return undefined;
      const message = await this.messageDatabaseService.getOneByFields(
        {
          conversation_id: conversation.id,
        },
        {
          field: 'created_at',
          ascending: false,
        }
      );
      if (!message) return undefined;
      return {
        conversationId: conversation.id!,
        agentId: agent_id,
        message: message,
      };
    } catch (error) {
      console.error(`Error getting last conversation of ${user_id}:`, error);
      return undefined;
    }
  }
}
