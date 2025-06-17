import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interact with the queue in `pgmq_public` schema.
 */
export class QueueService {
  constructor(private supabase: SupabaseClient) {}
  SCHEMA = 'pgmq_public';

  async addToQueue(queueName: string, message: any, sleepSeconds = 0) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('send', {
      queue_name: queueName,
      message,
      sleep_seconds: sleepSeconds,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async popFromQueue(queueName: string) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('pop', {
      queue_name: queueName,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async getQueue(queueName: string, numMessages = 100, sleepSeconds = 0) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('read', {
      queue_name: queueName,
      sleep_seconds: sleepSeconds,
      n: numMessages,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async sendBatch(queueName: string, messages: any[], sleepSeconds = 0) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('send_batch', {
      queue_name: queueName,
      messages,
      sleep_seconds: sleepSeconds,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async archiveMessage(queueName: string, messageId: number) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('archive', {
      queue_name: queueName,
      message_id: messageId,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async deleteMessage(queueName: string, messageId: number) {
    const result = await this.supabase.schema(this.SCHEMA).rpc('delete', {
      queue_name: queueName,
      message_id: messageId,
    });
    if (result.error) throw result.error;
    return result.data;
  }
}
