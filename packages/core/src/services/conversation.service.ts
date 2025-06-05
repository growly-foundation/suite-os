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
    return this.messageDatabaseService.getAllByFields({
      conversation_id: conversation.id,
    });
  }

  async addMessageToConversation({
    agent_id,
    user_id,
    message,
    sender,
    existingEmbedding,
  }: {
    agent_id: string;
    user_id: string;
    message: string;
    sender: ConversationRole;
    existingEmbedding?: number[];
  }) {
    const conversation = await this.createConversationIfNotExists(agent_id, user_id);
    return this.messageDatabaseService.create({
      content: message,
      conversation_id: conversation.id,
      sender,
      embedding: JSON.stringify(existingEmbedding),
    });
  }
}
