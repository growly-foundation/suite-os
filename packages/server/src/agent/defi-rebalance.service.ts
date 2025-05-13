import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDeFiRebalanceAgent } from './rebalance-agent';

interface RebalanceRecommendation {
  fromToken: string | null;
  toToken: string | null;
  amount: number | null;
  reason: string;
  shouldRebalance: boolean;
}

interface RebalanceResponse {
  recommendation: RebalanceRecommendation;
  fullResponse: string;
}

@Injectable()
export class DefiRebalanceService {
  private readonly logger = new Logger(DefiRebalanceService.name);
  private readonly rebalanceAgent;

  constructor(private readonly configService: ConfigService) {
    this.rebalanceAgent = createDeFiRebalanceAgent(configService);
  }

  /**
   * Analyzes a crypto portfolio and provides rebalancing advice if needed
   * @param walletAddress The wallet address to analyze
   * @param userPreferences Optional additional preferences or constraints from the user
   * @returns Analysis result with rebalance recommendation if applicable
   */
  async analyzePortfolio(
    walletAddress: string,
    userPreferences = '',
  ): Promise<RebalanceResponse> {
    this.logger.log(`Analyzing portfolio for wallet: ${walletAddress}`);

    try {
      const result = await this.rebalanceAgent.getRebalanceRecommendation(walletAddress, userPreferences);
      
      // Log the result but not in production
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug('Portfolio analysis result:', {
          shouldRebalance: result.shouldRebalance,
          fromToken: result.fromToken,
          toToken: result.toToken,
          amount: result.amount,
        });
      }

      const recommendation: RebalanceRecommendation = {
        fromToken: result.fromToken,
        toToken: result.toToken,
        amount: result.amount,
        reason: result.reason,
        shouldRebalance: result.shouldRebalance
      };

      return {
        recommendation,
        fullResponse: result.fullResponse
      };
    } catch (error) {
      this.logger.error(`Error analyzing portfolio: ${error.message}`, error.stack);
      throw new Error(`Failed to analyze portfolio: ${error.message}`);
    }
  }
  
  /**
   * Legacy method - Gets a specific rebalance recommendation for a user's crypto portfolio
   * @param walletAddress The wallet address to analyze
   * @param userQuery Optional additional context or constraints from the user
   * @returns Structured rebalance recommendation (will throw error if rebalance is not recommended)
   * @deprecated Use analyzePortfolio instead which provides more context on whether rebalancing is needed
   */
  async getRebalanceRecommendation(
    walletAddress: string,
    userQuery = 'Please suggest a portfolio rebalance to optimize my holdings.',
  ): Promise<{
    fromToken: string;
    toToken: string;
    amount: number;
    reason: string;
  }> {
    this.logger.log(`Getting rebalance recommendation for wallet: ${walletAddress}`);
    this.logger.warn('getRebalanceRecommendation is deprecated - use analyzePortfolio instead');

    try {
      const result = await this.analyzePortfolio(walletAddress, userQuery);
      
      if (!result.recommendation.shouldRebalance) {
        throw new Error(`No rebalance needed: ${result.recommendation.reason}`);
      }
      
      if (!result.recommendation.fromToken || !result.recommendation.toToken || result.recommendation.amount === null) {
        throw new Error('Cannot provide rebalance recommendation: incomplete data');
      }

      return {
        fromToken: result.recommendation.fromToken,
        toToken: result.recommendation.toToken,
        amount: result.recommendation.amount,
        reason: result.recommendation.reason
      };
    } catch (error) {
      this.logger.error(`Error getting rebalance recommendation: ${error.message}`, error.stack);
      throw new Error(`Failed to generate rebalance recommendation: ${error.message}`);
    }
  }
}
