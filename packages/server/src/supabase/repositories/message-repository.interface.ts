import { Message } from '../entities/message.entity';

export interface MessageRepositoryInterface {
  /**
   * Store a message with its embedding
   */
  storeMessageWithEmbedding(
    message: string,
    threadId: string,
    agentId: string,
    role: string,
    embedding?: number[],
  ): Promise<Message>;

  /**
   * Get conversation history for a thread and agent
   */
  getConversationHistory(threadId: string, agentId: string): Promise<Message[]>;

  /**
   * Search for similar messages
   */
  searchSimilarMessages(
    query: string,
    threadId: string,
    agentId: string,
    limit?: number,
  ): Promise<Message[]>;

  /**
   * Create an embedding for text
   */
  createEmbedding(text: string): Promise<number[]>;
}
