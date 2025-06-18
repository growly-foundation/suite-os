import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { SUPPORTED_CHAINS } from 'src/constants/chains';

import { SuiteDatabaseCore, UserPersonaService } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { PersonaClient } from '../persona/persona.provider';

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
    @Inject('PERSONA_CLIENT') private readonly personaClient: PersonaClient
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
      const result = await this.userPersonaService.syncMissingPersonas();

      this.logger.log(`Daily sync completed. Created: ${result.created} personas`);

      if (result.errors.length > 0) {
        this.logger.warn(`Sync had ${result.errors.length} errors:`);
        result.errors.forEach(error => this.logger.warn(error));
      }
    } catch (error) {
      this.logger.error('Daily sync failed:', error);
    }
  }

  @Interval(10000)
  async testPersonaClient() {
    const result = await this.personaClient.buster.fetchPersonaAnalysis(
      '0x6c34C667632dC1aAF04F362516e6F44D006A58fa' as Address,
      SUPPORTED_CHAINS
    );

    console.log(result);
  }

  /**
   * Process pending and failed personas
   * Runs every 30 seconds
   */
  // @Interval(30000)
  async processPendingPersonas() {
    this.logger.debug('Processing pending/failed personas...');

    try {
      const result = await this.processPendingPersonasInBatches(5);

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
  // @Cron('0 */12 * * *')
  async rebuildAllPersonas() {
    this.logger.log('Starting persona rebuild for all completed personas...');

    try {
      const result = await this.rebuildAllPersonasInBatches(5);

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
  private async processPendingPersonasInBatches(
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    const failed: string[] = [];
    let processed = 0;

    try {
      // Get pending and failed personas
      const toProcess = await this.userPersonaService.getPendingPersonas();

      if (toProcess.length === 0) {
        return { processed: 0, failed: [] };
      }

      this.logger.log(
        `Processing ${toProcess.length} pending/failed personas in batches of ${batchSize}`
      );

      // Process in batches
      for (let i = 0; i < toProcess.length; i += batchSize) {
        const batch = toProcess.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(persona => this.buildPersona(persona.id))
        );

        // Process results
        results.forEach((result, index) => {
          const walletAddress = batch[index].id;
          if (result.status === 'fulfilled') {
            processed++;
          } else {
            failed.push(`${walletAddress}: ${JSON.stringify(result.reason)}`);
          }
        });
      }

      this.logger.log(
        `Batch processing completed. Processed: ${processed}, Failed: ${failed.length}`
      );
      if (failed.length > 0) {
        this.logger.debug('Failed wallets:', failed);
      }

      return { processed, failed };
    } catch (error) {
      failed.push(`Batch processing failed: ${error}`);
      return { processed, failed };
    }
  }

  /**
   * Rebuild all completed personas in batches
   */
  private async rebuildAllPersonasInBatches(
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    const failed: string[] = [];
    let processed = 0;

    try {
      // Get all completed personas
      const completedPersonas = await this.userPersonaService.getCompletedPersonas();

      if (completedPersonas.length === 0) {
        return { processed: 0, failed: [] };
      }

      this.logger.log(`Rebuilding ${completedPersonas.length} personas in batches of ${batchSize}`);

      // Process in batches
      for (let i = 0; i < completedPersonas.length; i += batchSize) {
        const batch = completedPersonas.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(persona => this.buildPersona(persona.id))
        );

        // Process results
        results.forEach((result, index) => {
          const walletAddress = batch[index].id;
          if (result.status === 'fulfilled') {
            processed++;
          } else {
            failed.push(`${walletAddress}: ${result.reason}`);
          }
        });
      }

      this.logger.log(`Rebuild completed. Processed: ${processed}, Failed: ${failed.length}`);
      if (failed.length > 0) {
        this.logger.debug('Failed wallets:', failed);
      }

      return { processed, failed };
    } catch (error) {
      failed.push(`Rebuild failed: ${error}`);
      return { processed, failed };
    }
  }

  /**
   * Build persona for a specific wallet address using the persona package
   */
  private async buildPersona(walletAddress: string): Promise<void> {
    try {
      // Update status to running
      await this.userPersonaService.updatePersonaStatus(walletAddress, 'running');

      this.logger.debug(`Building persona data for wallet: ${walletAddress}`);

      // Use the persona classifier to analyze the wallet
      const result = await this.personaClient.buster.fetchPersonaAnalysis(
        walletAddress as Address,
        SUPPORTED_CHAINS
      );

      const guildXyzData = await this.personaClient.guildXyz.getAggregatedWalletData(
        walletAddress as Address
      );

      const talentData = await this.personaClient.talent.getAggregatedWalletData(
        walletAddress as Address
      );

      // Transform the analysis result to match our database schema
      const personaData = {
        identities: {
          dominantTrait: result.analysis.dominantTrait,
          traitScores: result.analysis.traitScores,
          walletMetrics: result.analysis.walletMetrics,

          // External data
          guildXyz: guildXyzData,
          talentProtocol: talentData,
        },
        activities: {
          totalTransactions: result.analysis.walletMetrics.totalTokenActivitiesLast12Months,
          daysActive: result.analysis.walletMetrics.activeDaysLast12Months,
          longestHoldingPeriodMonths: result.analysis.walletMetrics.longestHoldingPeriodMonths,
          tokenActivity: result.raw.tokenActivities,
        },
        portfolio_snapshots: {
          totalValue: result.analysis.walletMetrics.totalPortfolioValue,
          tokenValue: result.analysis.walletMetrics.tokenPortfolioValue,
          nftValue: result.analysis.walletMetrics.nftPortfolioValue,
          tokenAllocationPercentage: result.analysis.walletMetrics.tokenAllocationPercentage,
          topAssetValue: result.analysis.walletMetrics.topAssetValue,
          topAssetType: result.analysis.walletMetrics.topAssetType,
          topTokenSymbol: result.analysis.walletMetrics.topTokenSymbol,
          ethHolding: result.analysis.walletMetrics.ethHolding,
          tokenPortfolio: result.raw.tokenPortfolio,
          nftPortfolio: result.raw.nftPortfolio,
        },
      };

      // Update the persona with built data
      await this.userPersonaService.updatePersonaData(walletAddress, personaData);

      this.logger.debug(`Successfully built persona for wallet: ${walletAddress}`);
    } catch (error) {
      // Update status to failed
      await this.userPersonaService.updatePersonaStatus(walletAddress, 'failed');
      this.logger.error(`Failed to build persona for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Manual trigger for sync (for testing/admin purposes)
   */
  async triggerSync() {
    return this.syncMissingPersonas();
  }

  /**
   * Manual trigger for processing (for testing/admin purposes)
   */
  async triggerProcessing() {
    return this.processPendingPersonas();
  }

  /**
   * Manual trigger for rebuild (for testing/admin purposes)
   */
  async triggerRebuild() {
    return this.rebuildAllPersonas();
  }

  /**
   * Get persona by wallet address
   */
  async getPersona(walletAddress: string) {
    return this.userPersonaService.getPersona(walletAddress);
  }

  /**
   * Get personas by status
   */
  async getPersonasByStatus(status: 'pending' | 'running' | 'completed' | 'failed') {
    return this.userPersonaService.getPersonasByStatus(status);
  }
}
