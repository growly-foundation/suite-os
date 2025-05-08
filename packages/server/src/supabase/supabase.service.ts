import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    @Inject('OPENAI_CLIENT') private readonly openai: OpenAI,
  ) {}

  /**
   * Store a conversation message with its embedding in Supabase
   */
  async storeMessageWithEmbedding(
    message: string,
    threadId: string,
    role: 'user' | 'assistant',
  ) {
    try {
      // Generate embedding for the message
      const embedding = await this.createEmbedding(message);

      // Store the message with its embedding
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          content: message,
          thread_id: threadId,
          role,
          embedding,
        })
        .select();

      if (error) {
        this.logger.error(
          `Error storing message: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      this.logger.error('Failed to store message with embedding', error);
      throw error;
    }
  }

  /**
   * Retrieve conversation history for a thread
   */
  async getConversationHistory(threadId: string) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) {
        this.logger.error(
          `Error retrieving conversation history: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      this.logger.error('Failed to retrieve conversation history', error);
      throw error;
    }
  }

  /**
   * Search for similar messages using vector similarity
   */
  async searchSimilarMessages(
    query: string,
    threadId: string,
    limit: number = 5,
  ) {
    try {
      // Generate embedding for the query
      const embedding = await this.createEmbedding(query);

      // Search for similar messages
      const { data, error } = await this.supabase.rpc('match_messages', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
        thread_id: threadId,
      });

      if (error) {
        this.logger.error(
          `Error searching similar messages: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      this.logger.error('Failed to search similar messages', error);
      throw error;
    }
  }

  /**
   * Create embedding for a text using OpenAI
   */
  private async createEmbedding(text: string): Promise<number[]> {
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
