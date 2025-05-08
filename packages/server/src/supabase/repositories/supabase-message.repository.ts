import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { Message } from '../entities/message.entity';
import { MessageRepositoryInterface } from './message-repository.interface';

// Define the shape of data returned from Supabase
interface MessageRecord {
  id: string;
  content: string;
  thread_id: string;
  agent_id: string;
  role: string;
  embedding?: number[];
  created_at: string;
  similarity?: number;
}

@Injectable()
export class SupabaseMessageRepository implements MessageRepositoryInterface {
  private readonly logger = new Logger(SupabaseMessageRepository.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    @Inject('OPENAI_CLIENT') private readonly openai: OpenAI,
  ) {}

  async storeMessageWithEmbedding(
    message: string,
    threadId: string,
    agentId: string,
    role: string,
    existingEmbedding?: number[],
  ): Promise<Message> {
    try {
      // Generate embedding if not provided
      const embedding =
        existingEmbedding || (await this.createEmbedding(message));

      // Store the message with its embedding
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          content: message,
          thread_id: threadId,
          agent_id: agentId,
          role,
          embedding,
        })
        .select()
        .single();

      if (error) {
        this.logger.error(
          `Error storing message: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // Convert to Message entity
      return this.mapToMessageEntity(data as MessageRecord);
    } catch (error) {
      this.logger.error('Failed to store message with embedding', error);
      throw error;
    }
  }

  async getConversationHistory(
    threadId: string,
    agentId: string,
  ): Promise<Message[]> {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: true });

      if (error) {
        this.logger.error(
          `Error retrieving conversation history: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // Convert to Message entities with proper typing
      return (data as MessageRecord[]).map((item) =>
        this.mapToMessageEntity(item),
      );
    } catch (error) {
      this.logger.error('Failed to retrieve conversation history', error);
      throw error;
    }
  }

  async searchSimilarMessages(
    query: string,
    threadId: string,
    agentId: string,
    limit: number = 5,
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
        this.logger.error(
          `Error searching similar messages: ${error.message}`,
          error.stack,
        );
        throw error;
      }

      // Convert to Message entities with proper typing
      return (data as MessageRecord[]).map((item) =>
        this.mapToMessageEntity(item),
      );
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

  private mapToMessageEntity(data: MessageRecord): Message {
    const message = new Message();
    message.id = data.id;
    message.content = data.content;
    message.thread_id = data.thread_id;
    message.agent_id = data.agent_id;
    message.role = data.role;
    message.embedding = data.embedding || [];
    message.created_at = new Date(data.created_at);
    return message;
  }
}
