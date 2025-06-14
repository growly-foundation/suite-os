import { ConversationRole, Message } from '@/models';

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

  async getMessagesOfAgentAndUser(agent_id: string, user_id: string): Promise<Message[]> {
    const conversation = await this.conversationDatabaseService.getOneByFields({
      agent_id,
      user_id,
    });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return this.messageDatabaseService.getAllByFields(
      {
        conversation_id: conversation.id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
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
}
