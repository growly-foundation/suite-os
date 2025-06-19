import { Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';

import { SuiteDatabaseCore, UserPersonaMetadata, UserPersonaService } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { SUITE_CORE } from '../../constants/services';
import { PersonaClient } from '../persona/persona.provider';

export const PERSONA_QUEUE = 'queue:persona-processing';
export const PERSONA_BUILD_JOB = `${PERSONA_QUEUE}:build-persona`;

export interface BuildPersonaJobData {
  walletAddress: string;
}

@Processor(PERSONA_QUEUE)
@Injectable()
export class PersonaQueueProcessor {
  private readonly logger = new Logger(PersonaQueueProcessor.name);

  private get userPersonaService(): UserPersonaService {
    return this.suiteCore.userPersonas as UserPersonaService;
  }

  constructor(
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore,
    @Inject('PERSONA_CLIENT') private readonly personaClient: PersonaClient
  ) {}

  @Process(PERSONA_BUILD_JOB)
  async processBuildPersona(job: Job<BuildPersonaJobData>): Promise<void> {
    const { walletAddress } = job.data;

    this.logger.debug(`Processing build-persona job for wallet: ${walletAddress}`);

    try {
      // Update status to running
      const existingUserPersona = await this.userPersonaService.updateStatus(
        walletAddress,
        'running'
      );

      this.logger.debug(`Building persona data for wallet: ${walletAddress}`);

      // Use the persona classifier to analyze the wallet
      const result = await Promise.all([
        this.personaClient.buster.fetchWalletNameService(walletAddress as Address).catch(() => {
          this.logger.error(`Failed to fetch name service data for wallet: ${walletAddress}`);
          return undefined;
        }),
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

      const [ens, personaAnalysis, guildXyzData, talentData] = await result;

      // Destructure persona analysis
      const [a, m, r] = [
        personaAnalysis?.analysis,
        personaAnalysis?.analysis?.walletMetrics,
        personaAnalysis?.raw,
      ];

      // Transform the analysis result to match our database schema
      const p: UserPersonaMetadata = {
        identities: existingUserPersona.identities || {},
        activities: existingUserPersona.activities || {},
        portfolio_snapshots: existingUserPersona.portfolio_snapshots || {},
      };

      // Identities
      if (ens) p.identities['nameService'] = ens;
      if (a) p.identities['dominantTrait'] = a.dominantTrait;
      if (a) p.identities['traitScores'] = a.traitScores;
      if (m) p.identities['walletMetrics'] = m;

      // External data
      if (guildXyzData) p.identities['guildXyz'] = guildXyzData;
      if (talentData) p.identities['talentProtocol'] = talentData;

      // Activities
      if (m) p.activities['totalTransactions'] = m?.totalTokenActivitiesLast12Months;
      if (m) p.activities['daysActive'] = m?.activeDaysLast12Months;
      if (m) p.activities['longestHoldingPeriodMonths'] = m?.longestHoldingPeriodMonths;
      if (r) p.activities['tokenActivity'] = r?.tokenActivities;

      // Portfolio snapshots
      if (m) p.portfolio_snapshots['totalValue'] = m?.totalPortfolioValue;
      if (m) p.portfolio_snapshots['tokenValue'] = m?.tokenPortfolioValue;
      if (m) p.portfolio_snapshots['nftValue'] = m?.nftPortfolioValue;
      if (m) p.portfolio_snapshots['tokenAllocationPercentage'] = m?.tokenAllocationPercentage;
      if (m) p.portfolio_snapshots['topAssetValue'] = m?.topAssetValue;
      if (m) p.portfolio_snapshots['topAssetType'] = m?.topAssetType;
      if (m) p.portfolio_snapshots['topTokenSymbol'] = m?.topTokenSymbol;
      if (m) p.portfolio_snapshots['ethHolding'] = m?.ethHolding;
      if (r) p.portfolio_snapshots['tokenPortfolio'] = r?.tokenPortfolio;
      if (r) p.portfolio_snapshots['nftPortfolio'] = r?.nftPortfolio;

      // Update the persona with built data
      await this.userPersonaService.update(walletAddress, p);

      this.logger.debug(`Successfully built persona for wallet: ${walletAddress}`);
    } catch (error) {
      // Update status to failed
      await this.userPersonaService.updateStatus(walletAddress, 'failed');
      this.logger.error(`Failed to build persona for ${walletAddress}:`, error);
      throw error; // Rethrow to let Bull handle retry logic
    }
  }
}
