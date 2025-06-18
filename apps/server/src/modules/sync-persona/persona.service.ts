import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { processBatches } from 'src/utils/batch.utils';

import { SuiteDatabaseCore, UserPersonaService, UserPersonaStatus } from '@getgrowly/core';
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

  /**
   * Process pending and failed personas
   * Runs every 30 seconds
   */
  @Interval(1000)
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
    return processBatches(
      new Logger(`${SyncPersonaService.name} - processPendingPersonasInBatches`),
      await this.userPersonaService.getPendingPersonas(),
      batchSize,
      async persona => {
        try {
          await this.#buildPersona(persona.id);
          return { status: 'fulfilled' };
        } catch (error) {
          return { status: 'failed', reason: error };
        }
      }
    );
  }

  /**
   * Rebuild all completed personas in batches
   */
  private async rebuildAllPersonasInBatches(
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    return processBatches(
      new Logger(`${SyncPersonaService.name} - rebuildAllPersonasInBatches`),
      await this.userPersonaService.getCompletedPersonas(),
      batchSize,
      async persona => {
        try {
          await this.#buildPersona(persona.id);
          return { status: 'fulfilled' };
        } catch (error) {
          return { status: 'failed', reason: error };
        }
      }
    );
  }

  async getPersonaByAddress(walletAddress: string) {
    return this.userPersonaService.getPersona(walletAddress);
  }

  async getPersonasByStatus(status: UserPersonaStatus) {
    return this.userPersonaService.getPersonasByStatus(status);
  }

  async #buildPersona(walletAddress: string): Promise<void> {
    try {
      // Update status to running
      await this.userPersonaService.updatePersonaStatus(walletAddress, 'running');

      this.logger.debug(`Building persona data for wallet: ${walletAddress}`);

      // Use the persona classifier to analyze the wallet
      const result = await this.personaClient.buster.fetchPersonaAnalysis(walletAddress as Address);

      const guildXyzData = await this.personaClient.guildXyz.getAggregatedWalletData(
        walletAddress as Address
      );

      const talentData = await this.personaClient.talent.getAggregatedWalletData(
        walletAddress as Address
      );

      const [a, m, r] = [result.analysis, result.analysis.walletMetrics, result.raw];
      // Transform the analysis result to match our database schema
      const personaData = {
        identities: {
          dominantTrait: a.dominantTrait,
          traitScores: a.traitScores,
          walletMetrics: m,

          // External data
          guildXyz: guildXyzData,
          talentProtocol: talentData,
        },
        activities: {
          totalTransactions: m.totalTokenActivitiesLast12Months,
          daysActive: m.activeDaysLast12Months,
          longestHoldingPeriodMonths: m.longestHoldingPeriodMonths,
          tokenActivity: r.tokenActivities,
        },
        portfolio_snapshots: {
          totalValue: m.totalPortfolioValue,
          tokenValue: m.tokenPortfolioValue,
          nftValue: m.nftPortfolioValue,
          tokenAllocationPercentage: m.tokenAllocationPercentage,
          topAssetValue: m.topAssetValue,
          topAssetType: m.topAssetType,
          topTokenSymbol: m.topTokenSymbol,
          ethHolding: m.ethHolding,
          tokenPortfolio: r.tokenPortfolio,
          nftPortfolio: r.nftPortfolio,
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
}
