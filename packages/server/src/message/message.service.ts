import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { FnReturnType, Message, ConversationRole } from '@growly/core';

@Injectable()
export class MessageService {
  constructor(private readonly messageRepository: MessageRepository) {}

  async storeMessage(
    message: string,
    threadId: string,
    agentId: string,
    role: string,
  ): Promise<Message> {
    return this.messageRepository.storeMessageWithEmbedding(
      message,
      threadId,
      agentId,
      role as ConversationRole,
    );
  }

  async getConversationHistory(
    threadId: string,
    agentId: string,
  ): Promise<Message[]> {
    return this.messageRepository.getConversationHistory(threadId, agentId);
  }

  async findSimilarMessages(
    query: string,
    threadId: string,
    agentId: string,
    limit?: number,
  ): Promise<FnReturnType<'match_messages'>> {
    return this.messageRepository.searchSimilarMessages(
      query,
      threadId,
      agentId,
      limit,
    );
  }

  async createEmbedding(text: string): Promise<number[]> {
    return this.messageRepository.createEmbedding(text);
  }
}
