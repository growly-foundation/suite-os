import { Inject, Injectable, Logger } from '@nestjs/common';

import { SuiteDatabaseCore } from '@getgrowly/core';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private queueName: string;

  constructor(@Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore) {}

  /**
   * Initialize the queue service with a specific queue name
   */
  initialize(queueName: string): void {
    this.queueName = queueName;
    this.logger.debug(`QueueService initialized for queue: ${queueName}`);
  }

  /**
   * Get the current queue name
   */
  getQueueName(): string {
    return this.queueName;
  }

  /**
   * Read messages from the queue without removing them
   */
  async readQueue(numMessages = 100, sleepSeconds = 0): Promise<any[]> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.getQueue(this.queueName, numMessages, sleepSeconds);
      this.logger.debug(`Read ${result.length} messages from queue: ${this.queueName}`);
      return result;
    } catch (error) {
      this.logger.error(`Error reading from queue ${this.queueName}:`, error);
      throw error;
    }
  }

  /**
   * Pop all messages from the queue
   */
  async popMessages(): Promise<any[]> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.popFromQueue(this.queueName);
      if (result && result.length > 0) {
        this.logger.debug(`Popped message from queue: ${this.queueName}`);
        return result;
      }
      return [];
    } catch (error) {
      this.logger.error(`Error popping from queue ${this.queueName}:`, error);
      throw error;
    }
  }

  /**
   * Check if queue has messages available
   */
  async hasMessages(): Promise<boolean> {
    try {
      const messages = await this.readQueue(1, 0);
      return messages.length > 0;
    } catch (error) {
      this.logger.error(`Error checking messages in queue ${this.queueName}:`, error);
      return false;
    }
  }

  /**
   * Pop and process all available messages with a callback function
   * Only deletes messages after successful processing
   */
  async processAllMessages<T>(
    processor: (message: any) => Promise<T>
  ): Promise<{ processed: number; errors: number }> {
    let processedCount = 0;
    let errorCount = 0;

    this.logger.debug(`Starting to process all messages from queue: ${this.queueName}`);

    try {
      // Read all available messages without visibility timeout to avoid delays
      const messages = await this.readQueue(); // Read up to 100 messages, no sleep

      if (messages.length > 0) {
        this.logger.debug(
          `Found ${messages.length} messages to process in queue: ${this.queueName}`
        );

        // Process each message
        for (const message of messages) {
          try {
            // Process the message
            await processor(message);

            // Only delete the message if processing succeeded
            // await this.deleteMessage(message.msg_id);
            processedCount++;

            this.logger.debug(
              `Successfully processed and deleted message ${message.msg_id} from queue: ${this.queueName}`
            );
          } catch (processingError) {
            this.logger.error(
              `Error processing message ${message.msg_id} from queue ${this.queueName}. Message will remain in queue:`,
              processingError
            );
            errorCount++;
            // Continue processing other messages instead of stopping
          }
        }
      } else {
        this.logger.debug(`No messages found in queue: ${this.queueName}`);
      }
    } catch (readError) {
      this.logger.error(`Error reading from queue ${this.queueName}:`, readError);
      errorCount++;
    }

    this.logger.debug(
      `Finished processing queue ${this.queueName}. Processed: ${processedCount}, Errors: ${errorCount}`
    );
    return { processed: processedCount, errors: errorCount };
  }

  /**
   * Send a single message to the queue
   */
  async sendMessage(message: any, sleepSeconds = 0): Promise<any> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.addToQueue(this.queueName, message, sleepSeconds);
      this.logger.debug(
        `Sent message to queue ${this.queueName}${sleepSeconds > 0 ? ` with ${sleepSeconds}s delay` : ''}`
      );
      return result;
    } catch (error) {
      this.logger.error(`Error sending message to queue ${this.queueName}:`, error);
      throw error;
    }
  }

  /**
   * Send multiple messages to the queue in batch
   */
  async sendBatchMessages(messages: any[], sleepSeconds = 0): Promise<any> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.sendBatch(this.queueName, messages, sleepSeconds);
      this.logger.debug(
        `Sent ${messages.length} messages to queue ${this.queueName}${sleepSeconds > 0 ? ` with ${sleepSeconds}s delay` : ''}`
      );
      return result;
    } catch (error) {
      this.logger.error(`Error sending batch messages to queue ${this.queueName}:`, error);
      throw error;
    }
  }

  /**
   * Archive a message by moving it to the archive table
   */
  async archiveMessage(messageId: number): Promise<any> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.archiveMessage(this.queueName, messageId);
      this.logger.debug(`Archived message ${messageId} from queue ${this.queueName}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error archiving message ${messageId} from queue ${this.queueName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Permanently delete a message from the queue
   */
  async deleteMessage(messageId: number): Promise<any> {
    if (!this.queueName) {
      throw new Error('QueueService not initialized. Call initialize() with queue name first.');
    }

    try {
      const result = await this.suiteCore.queue.deleteMessage(this.queueName, messageId);
      this.logger.debug(`Deleted message ${messageId} from queue ${this.queueName}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting message ${messageId} from queue ${this.queueName}:`, error);
      throw error;
    }
  }
}
