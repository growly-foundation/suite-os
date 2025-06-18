import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { processBatches } from 'src/utils/batch.utils';
import { hour, second } from 'src/utils/schedule.utils';

import {
  ExtendedUserPersona,
  ParsedUserPersona,
  SuiteDatabaseCore,
  UserPersonaService,
  UserPersonaStatus,
} from '@getgrowly/core';
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
  @Cron('0 */12 * * *')
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
    return this.#batchBuildPersonas(
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
    return this.#batchBuildPersonas(
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

  async #batchBuildPersonas(
    name: string,
    batch: ParsedUserPersona[],
    batchSize = 5
  ): Promise<{ processed: number; failed: string[] }> {
    return processBatches(
      new Logger(`${SyncPersonaService.name} - ${name}`),
      batch,
      batchSize,
      second(1),
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

  async #buildPersona(walletAddress: string): Promise<void> {
    try {
      // Update status to running
      await this.userPersonaService.updateStatus(walletAddress, 'running');

      this.logger.debug(`Building persona data for wallet: ${walletAddress}`);

      // Use the persona classifier to analyze the wallet
      let result = await Promise.all([
        this.personaClient.buster.fetchPersonaAnalysis(walletAddress as Address).catch(() => {
          this.logger.error(`Failed to fetch persona analysis for wallet: ${walletAddress}`);
          return undefined;
        }),
        this.personaClient.guildXyz.getAggregatedWalletData(walletAddress as Address).catch(() => {
          this.logger.error(`Failed to fetch guild xyz data for wallet: ${walletAddress}`);
          return undefined;
        }),
        this.personaClient.talent.getAggregatedWalletData(walletAddress as Address).catch(() => {
          this.logger.error(`Failed to fetch talent data for wallet: ${walletAddress}`);
          return undefined;
        }),
      ]);

      const [personaAnalysis, guildXyzData, talentData] = await result;

      // Destructure persona analysis
      const [a, m, r] = [
        personaAnalysis?.analysis,
        personaAnalysis?.analysis?.walletMetrics,
        personaAnalysis?.raw,
      ];

      // Transform the analysis result to match our database schema
      let personaData: ExtendedUserPersona = {
        identities: {},
        activities: {},
        portfolio_snapshots: {},
      };

      // Identities
      if (a) personaData['identities']['dominantTrait'] = a.dominantTrait;
      if (a) personaData['identities']['traitScores'] = a.traitScores;
      if (m) personaData['identities']['walletMetrics'] = m;

      // External data
      if (guildXyzData) personaData['identities']['guildXyz'] = guildXyzData;
      if (talentData) personaData['identities']['talentProtocol'] = talentData;

      // Activities
      if (m) personaData['activities']['totalTransactions'] = m?.totalTokenActivitiesLast12Months;
      if (m) personaData['activities']['daysActive'] = m?.activeDaysLast12Months;
      if (m)
        personaData['activities']['longestHoldingPeriodMonths'] = m?.longestHoldingPeriodMonths;
      if (r) personaData['activities']['tokenActivity'] = r?.tokenActivities;

      // Portfolio snapshots
      if (m) personaData['portfolio_snapshots']['totalValue'] = m?.totalPortfolioValue;
      if (m) personaData['portfolio_snapshots']['tokenValue'] = m?.tokenPortfolioValue;
      if (m) personaData['portfolio_snapshots']['nftValue'] = m?.nftPortfolioValue;
      if (m)
        personaData['portfolio_snapshots']['tokenAllocationPercentage'] =
          m?.tokenAllocationPercentage;
      if (m) personaData['portfolio_snapshots']['topAssetValue'] = m?.topAssetValue;
      if (m) personaData['portfolio_snapshots']['topAssetType'] = m?.topAssetType;
      if (m) personaData['portfolio_snapshots']['topTokenSymbol'] = m?.topTokenSymbol;
      if (m) personaData['portfolio_snapshots']['ethHolding'] = m?.ethHolding;
      if (r) personaData['portfolio_snapshots']['tokenPortfolio'] = r?.tokenPortfolio;
      if (r) personaData['portfolio_snapshots']['nftPortfolio'] = r?.nftPortfolio;

      // Update the persona with built data
      await this.userPersonaService.update(walletAddress, personaData);

      this.logger.debug(`Successfully built persona for wallet: ${walletAddress}`);
    } catch (error) {
      // Update status to failed
      await this.userPersonaService.updateStatus(walletAddress, 'failed');
      this.logger.error(`x persona for ${walletAddress}:`, error);
      throw error;
    }
  }
}
