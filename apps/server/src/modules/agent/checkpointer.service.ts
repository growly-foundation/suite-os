import { BaseCheckpointSaver } from '@langchain/langgraph-checkpoint';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CheckpointerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CheckpointerService.name);
  private checkpointer: BaseCheckpointSaver | null = null;
  private initializationPromise: Promise<BaseCheckpointSaver> | null = null;

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    // Cleanup if needed
    this.logger.log('CheckpointerService shutting down');
  }

  /**
   * Initialize the checkpointer with singleton pattern
   */
  private async initialize(): Promise<BaseCheckpointSaver> {
    if (this.checkpointer) {
      return this.checkpointer;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.createCheckpointer();
    this.checkpointer = await this.initializationPromise;
    this.initializationPromise = null;

    return this.checkpointer;
  }

  /**
   * Get or create the checkpointer instance
   */
  async getCheckpointer(): Promise<BaseCheckpointSaver> {
    if (this.checkpointer) {
      return this.checkpointer;
    }

    return this.initialize();
  }

  /**
   * Create a new checkpointer instance
   */
  private async createCheckpointer(): Promise<BaseCheckpointSaver> {
    const connectionString = process.env.POSTGRES_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error('POSTGRES_CONNECTION_STRING environment variable is not set');
    }

    try {
      this.logger.log('Initializing PostgreSQL checkpointer...');
      const checkpointer = PostgresSaver.fromConnString(connectionString);

      if (!checkpointer) {
        throw new Error('Failed to create checkpointer instance');
      }

      await checkpointer.setup();
      this.logger.log('PostgreSQL checkpointer initialized successfully');

      return checkpointer;
    } catch (error) {
      this.logger.error(`Failed to initialize checkpointer: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Health check for the checkpointer connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const checkpointer = await this.getCheckpointer();
      // Perform a simple operation to verify connection
      // This is a placeholder - adjust based on actual API
      return checkpointer !== null;
    } catch (error) {
      this.logger.error(`Checkpointer health check failed: ${error.message}`);
      return false;
    }
  }
}
