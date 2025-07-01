import { ConversationRole, LatestConversation, Message } from '@/models';

import { PublicDatabaseService } from './database.service';

export class ConversationService {
  constructor(
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

  async getLastestConversationMessage(
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
      console.log(`Error getting last conversation of ${user_id}:`, error);
      return undefined;
    }
  }
}
