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

  async getMessagesOfAgentAndUser(
    agent_id: string,
    user_id: string,
    ascending = false
  ): Promise<Message[]> {
    const conversation = await this.conversationDatabaseService.getOneByFields({
      agent_id,
      user_id,
    });
    if (!conversation) throw new Error('Conversation not found');
    return this.messageDatabaseService.getAllByFields(
      {
        conversation_id: conversation.id,
      },
      undefined,
      {
        field: 'created_at',
        ascending,
      }
    );
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
            .select('id', { count: 'exact', head: true })
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
