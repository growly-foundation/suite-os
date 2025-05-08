import { Inject, Injectable } from '@nestjs/common';
import { MessageRepositoryInterface } from '../repositories/message-repository.interface';
import { Message } from '@growly/sdk';

@Injectable()
export class MessageService {
  constructor(
    @Inject('MessageRepository')
    private readonly messageRepository: MessageRepositoryInterface
  ) {}

  async storeMessage(
    message: string,
    threadId: string,
    agentId: string,
    role: string
  ): Promise<Message> {
    return this.messageRepository.storeMessageWithEmbedding(message, threadId, agentId, role);
  }

  async getConversationHistory(threadId: string, agentId: string): Promise<Message[]> {
    return this.messageRepository.getConversationHistory(threadId, agentId);
  }

  async findSimilarMessages(
    query: string,
    threadId: string,
    agentId: string,
    limit?: number
  ): Promise<Message[]> {
    return this.messageRepository.searchSimilarMessages(query, threadId, agentId, limit);
  }

  async createEmbedding(text: string): Promise<number[]> {
    return this.messageRepository.createEmbedding(text);
  }
}
