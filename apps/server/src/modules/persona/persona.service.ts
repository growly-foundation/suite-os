import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { QueueService } from '../queue/queue.service';

@Injectable()
export class PersonaService implements OnModuleInit {
  private readonly logger = new Logger(PersonaService.name);

  constructor(private readonly queueService: QueueService) {}

  onModuleInit() {
    // Initialize the queue service with the persona queue name
    this.queueService.initialize('persona');
  }

  @Interval(10000)
  async checkPersonaQueue() {
    this.logger.debug('Checking persona queue for new requests');

    // Check if there are messages to process
    const hasMessages = await this.queueService.hasMessages();

    if (hasMessages) {
      // Process all available messages
      const result = await this.queueService.processAllMessages(message =>
        this.processPersonaRequest(message)
      );

      this.logger.log(
        `Persona queue processing completed. Processed: ${result.processed}, Errors: ${result.errors}`
      );
    }
  }

  /**
   * Process a single persona creation request
   */
  private async processPersonaRequest(message: any): Promise<void> {
    const walletAddress = message.message.walletAddress;

    if (!walletAddress) {
      throw new Error('Message missing required walletAddress field');
    }

    this.logger.debug(`Processing persona creation request for wallet: ${walletAddress}`);

    try {
      await this.createPersona(walletAddress);
      this.logger.log(`Successfully created persona for wallet: ${walletAddress}`);
    } catch (error) {
      this.logger.error(`Failed to create persona for wallet ${walletAddress}:`, error);
      throw error; // Re-throw to be counted as an error in queue processing
    }
  }

  /**
   * Create a persona for the given wallet address
   * This is where the actual persona creation logic will go
   */
  private async createPersona(walletAddress: string): Promise<void> {
    // TODO: Implement persona creation logic
    this.logger.debug(`Creating persona for ${walletAddress}`);

    // Placeholder for actual implementation
    // Example steps:
    // 1. Validate wallet address
    // 2. Fetch user data
    // 3. Generate persona attributes
    // 4. Save to database
    // 5. Send confirmation/notification

    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
