import { Inject, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { MessageRepositoryInterface } from './message-repository.interface';
import { Message, SuiteDatabaseCore } from '@growly/sdk';

@Injectable()
export class SupabaseMessageRepository implements MessageRepositoryInterface {
  private readonly logger = new Logger(SupabaseMessageRepository.name);

  constructor(
    @Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore,
    @Inject('OPENAI_CLIENT') private readonly openai: OpenAI
  ) {}

  async storeMessageWithEmbedding(
    message: string,
    threadId: string,
    agentId: string,
    role: string,
    existingEmbedding?: number[]
  ): Promise<Message> {
    try {
      // Generate embedding if not provided
      const embedding = existingEmbedding || (await this.createEmbedding(message));

      // Store the message with its embedding
      const data = await this.suiteCore.db.messages.getOne();

      if (!data) {
        throw new Error('No message found');
      }

      // Convert to Message entity
      return data;
    } catch (error) {
      this.logger.error('Failed to store message with embedding', error);
      throw error;
    }
  }

  async getConversationHistory(threadId: string, agentId: string): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: true });

      if (error) {
        this.logger.error(`Error retrieving conversation history: ${error.message}`, error.stack);
        throw error;
      }

      // Convert to Message entities with proper typing
      return data;
    } catch (error) {
      this.logger.error('Failed to retrieve conversation history', error);
      throw error;
    }
  }

  async searchSimilarMessages(
    query: string,
    threadId: string,
    agentId: string,
    limit = 5
  ): Promise<Message[]> {
    try {
      // Generate embedding for the query
      const embedding = await this.createEmbedding(query);

      // Search for similar messages
      const { data, error } = await this.supabase.rpc('match_messages', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        thread_id: threadId,
        agent_id: agentId,
      });

      if (error) {
        this.logger.error(`Error searching similar messages: ${error.message}`, error.stack);
        throw error;
      }

      // Convert to Message entities with proper typing
      return data;
    } catch (error) {
      this.logger.error('Failed to search similar messages', error);
      throw error;
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to create embedding', error);
      throw error;
    }
  }
}
