import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { Queue } from 'bull';

import {
  ParsedUserPersona,
  SuiteDatabaseCore,
  UserPersonaService,
  UserPersonaStatus,
  hour,
  second,
} from '@getgrowly/core';

import { processBatches } from '../../utils/batch.utils';
import { PERSONA_BUILD_JOB, PERSONA_QUEUE } from './persona.queue';

/**
 * Background service for syncing and building persona data
 * This is separate from the suite-persona module which provides API endpoints for the UI
 */
@Injectable()
export class SyncPersonaService {
  private readonly logger = new Logger(SyncPersonaService.name);

  // Explicitly type the userPersonas service
  private get userPersonaService(): UserPersonaService {
    return this.suiteCore.userPersonas as UserPersonaService;
  }

  constructor(
    @Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore,
    @InjectQueue(PERSONA_QUEUE) private readonly personaQueue: Queue
  ) {
    this.logger.log('PersonaSyncService initialized with shared persona client');
  }

  /**
   * Daily sync - Check for missing personas and create default records
   * Runs every day at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncMissingPersonas() {
    this.logger.log('Starting daily persona sync...');

    try {
      const result = await this.userPersonaService.syncMissing();
      this.logger.log(`Daily sync completed. Created: ${result.created} personas`);
      if (result.errors.length > 0) {
        this.logger.warn(`Sync had ${result.errors.length} errors:`);
        result.errors.forEach(error => this.logger.warn(error));
      }
    } catch (error) {
      this.logger.error('Daily sync failed:', error);
    }
  }

  /**
   * Process pending and failed personas
   * Runs every hour
   */
  @Interval(hour(1))
  async processPendingPersonas() {
    this.logger.debug('Processing pending/failed personas...');
    try {
      const result = await this.#processPendingPersonasInBatches(5);
      if (result.processed > 0 || result.failed.length > 0) {
        this.logger.log(`Processed: ${result.processed} personas, Failed: ${result.failed.length}`);
        if (result.failed.length > 0) {
          this.logger.warn('Failed wallets:');
          result.failed.forEach(failure => this.logger.warn(failure));
        }
      }
    } catch (error) {
      this.logger.error('Pending persona processing failed:', error);
    }
  }

  /**
   * Rebuild all completed personas
   * Runs every 12 hours
   */
  @Cron(CronExpression.EVERY_12_HOURS)
  async rebuildAllPersonas() {
    this.logger.log('Starting persona rebuild for all completed personas...');
    try {
      const result = await this.#rebuildAllPersonasInBatches(5);
      this.logger.log(
        `Rebuild completed. Processed: ${result.processed} personas, Failed: ${result.failed.length}`
      );
      if (result.failed.length > 0) {
        this.logger.warn('Failed rebuilds:');
        result.failed.forEach(failure => this.logger.warn(failure));
      }
    } catch (error) {
      this.logger.error('Persona rebuild failed:', error);
    }
  }

  /**
   * Process pending and failed personas in batches
   */
  async #processPendingPersonasInBatches(
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    return this.#batchEnqueuePersonas(
      'processPendingPersonasInBatches',
      await this.userPersonaService.getAllPending(),
      batchSize
    );
  }

  /**
   * Rebuild all completed personas in batches
   */
  async #rebuildAllPersonasInBatches(
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    return this.#batchEnqueuePersonas(
      'rebuildAllPersonasInBatches',
      await this.userPersonaService.getAllCompleted(),
      batchSize
    );
  }

  async getPersonaByAddress(walletAddress: string) {
    return this.userPersonaService.getOneByAddress(walletAddress);
  }

  async getPersonasByStatus(status: UserPersonaStatus) {
    return this.userPersonaService.getAllByStatus(status);
  }

  /**
   * Enqueue a batch of personas for processing
   */
  async #batchEnqueuePersonas(
    name: string,
    batch: ParsedUserPersona[],
    batchSize: number
  ): Promise<{ processed: number; failed: string[] }> {
    return processBatches(
      new Logger(`${SyncPersonaService.name} - ${name}`),
      batch,
      batchSize,
      second(1),
      async persona => {
        try {
          await this.enqueueBuildPersona(persona.id);
          return { status: 'fulfilled' };
        } catch (error) {
          return { status: 'failed', reason: error };
        }
      }
    );
  }

  // The buildPersona method is now moved to the queue processor
  async enqueueBuildPersona(walletAddress: string): Promise<void> {
    this.logger.debug(`Enqueueing build persona job for wallet: ${walletAddress}`);

    try {
      // Add job to queue with retry options
      await this.personaQueue.add(
        PERSONA_BUILD_JOB,
        { walletAddress },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          // Only keep failed jobs for debugging
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      this.logger.debug(`Successfully enqueued build persona job for wallet: ${walletAddress}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue persona job for ${walletAddress}:`, error);
      throw error;
    }
  }
}
