import {
  PersonaAnalysis,
  PersonaTrait,
  TraitMetric,
  TraitScore,
  WalletMetrics,
  WeightLevel,
} from '@/types';

import {
  TAddress,
  TChainName,
  TMultichain,
  TNftPortfolio,
  TTokenPortfolio,
  TTokenTransferActivity,
} from '@getgrowly/chainsmith/types';
import {
  calculateEVMStreaksAndMetrics,
  findLongestHoldingToken,
} from '@getgrowly/chainsmith/utils';

import { EvmChainService } from '../evm';

export class PersonaClassifierService {
  constructor(private evmChainService: EvmChainService) {}

  async analyzeWalletPersona(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<PersonaAnalysis> {
    // Fetch all required data
    const [tokenPortfolio, nftPortfolio, tokenActivities] = await Promise.all([
      this.evmChainService.getWalletTokenPortfolio(walletAddress, chainNames),
      this.evmChainService.getWalletNftPortfolio(walletAddress, chainNames),
      this.evmChainService.listMultichainTokenTransferActivities(walletAddress, chainNames),
    ]);

    // Calculate wallet metrics
    const walletMetrics = this.calculateWalletMetrics(
      walletAddress,
      tokenPortfolio,
      nftPortfolio,
      tokenActivities
    );

    // Calculate trait scores
    const traitScores = this.calculateTraitScores(walletMetrics);

    // Find dominant trait
    const dominantTrait = traitScores.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    ).trait;

    return {
      dominantTrait,
      traitScores,
      walletMetrics,
    };
  }

  private calculateWalletMetrics(
    walletAddress: TAddress,
    tokenPortfolio: TTokenPortfolio,
    nftPortfolio: TNftPortfolio,
    tokenActivities: TMultichain<TTokenTransferActivity[]>
  ): WalletMetrics {
    // Get wallet creation date from earliest transaction
    const allTransactions = Object.values(tokenActivities).flat();
    let walletCreationDate = new Date();

    if (allTransactions.length > 0) {
      const validTimestamps = allTransactions
        .map(tx => {
          const txTimestamp = tx.timestamp || tx.timeStamp;
          const timestampNum = parseInt(txTimestamp);
          return timestampNum < 32503680000 ? timestampNum * 1000 : timestampNum;
        })
        .filter(timestamp => !isNaN(timestamp) && timestamp > 0);

      if (validTimestamps.length > 0) {
        const earliestTimestamp = Math.min(...validTimestamps);
        walletCreationDate = new Date(earliestTimestamp);
      }
    }

    // Portfolio values
    const tokenPortfolioValue = tokenPortfolio.totalUsdValue;
    const nftPortfolioValue = nftPortfolio.totalUsdValue;
    const totalPortfolioValue = tokenPortfolioValue + nftPortfolioValue;
    const tokenAllocationPercentage =
      totalPortfolioValue > 0 ? (tokenPortfolioValue / totalPortfolioValue) * 100 : 0;

    // Find longest holding period across all chains
    let longestHoldingPeriodMonths = 0;
    Object.entries(tokenActivities).forEach(([chain, activities]) => {
      if (activities.length > 0) {
        const holdingResult = findLongestHoldingToken(
          chain as TChainName,
          activities,
          walletAddress
        );
        const holdingMonths = holdingResult.duration / (60 * 60 * 24 * 30); // Convert seconds to months
        longestHoldingPeriodMonths = Math.max(longestHoldingPeriodMonths, holdingMonths);
      }
    });

    // Find top asset value and type
    let topAssetValue = 0;
    let topAssetType: 'token' | 'nft' = 'token';
    let topTokenSymbol: string | undefined;

    // Check most valuable token
    if (Object.keys(tokenPortfolio.aggregatedBalanceByToken).length > 0) {
      const mostValuableToken = Object.entries(tokenPortfolio.aggregatedBalanceByToken).reduce(
        (prev, [symbol, data]) =>
          data.totalUsdValue > prev.value ? { symbol, value: data.totalUsdValue } : prev,
        { symbol: '', value: 0 }
      );

      if (mostValuableToken.value > topAssetValue) {
        topAssetValue = mostValuableToken.value;
        topAssetType = 'token';
        topTokenSymbol = mostValuableToken.symbol;
      }
    }

    // Check most valuable NFT
    if (nftPortfolio.mostValuableNFT) {
      const nftValue = nftPortfolio.mostValuableNFT.usdValue || 0;
      if (nftValue > topAssetValue) {
        topAssetValue = nftValue;
        topAssetType = 'nft';
        topTokenSymbol = undefined;
      }
    }

    // Calculate activity metrics for last 12 months
    const twelveMonthsAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    let activeDaysLast12Months = 0;
    let totalTokenActivitiesLast12Months = 0;

    Object.values(tokenActivities).forEach(activities => {
      const recentActivities = activities.filter(tx => {
        const txTimestamp = tx.timestamp || tx.timeStamp;
        const timestampNum = parseInt(txTimestamp);
        const txTime = timestampNum < 32503680000 ? timestampNum * 1000 : timestampNum;
        return txTime >= twelveMonthsAgo;
      });

      totalTokenActivitiesLast12Months += recentActivities.length;

      if (recentActivities.length > 0) {
        const stats = calculateEVMStreaksAndMetrics(recentActivities, walletAddress);
        activeDaysLast12Months = Math.max(activeDaysLast12Months, stats.uniqueActiveDays);
      }
    });

    // Calculate ETH holding
    let ethHolding = 0;
    if (tokenPortfolio.aggregatedBalanceByToken.ETH) {
      ethHolding = tokenPortfolio.aggregatedBalanceByToken.ETH.totalBalance;
    }

    return {
      walletCreationDate,
      totalPortfolioValue,
      tokenPortfolioValue,
      nftPortfolioValue,
      tokenAllocationPercentage,
      longestHoldingPeriodMonths,
      topAssetValue,
      topAssetType,
      activeDaysLast12Months,
      totalTokenActivitiesLast12Months,
      ethHolding,
      topTokenSymbol,
    };
  }

  private calculateTraitScores(walletMetrics: WalletMetrics): TraitScore[] {
    return [
      this.calculateOGScore(walletMetrics),
      this.calculateDeFiChadScore(walletMetrics),
      this.calculateDegenScore(walletMetrics),
      this.calculateVirginCTScore(walletMetrics),
    ];
  }

  private calculateOGScore(data: WalletMetrics): TraitScore {
    const metrics: TraitMetric[] = [
      {
        name: 'Token allocation > 60% portfolio value',
        weight: WeightLevel.HIGH,
        satisfied: data.tokenAllocationPercentage > 60,
      },
      {
        name: 'Longest token holding period > 12 months',
        weight: WeightLevel.MEDIUM,
        satisfied: data.longestHoldingPeriodMonths > 12,
      },
      {
        name: 'Top asset value < $5,000',
        weight: WeightLevel.HIGH,
        satisfied: data.topAssetValue < 5000,
      },
      {
        name: 'Wallet creation day < 2020',
        weight: WeightLevel.LOW,
        satisfied: data.walletCreationDate.getFullYear() < 2020,
      },
      {
        name: 'Holding at least 0.1 ETH',
        weight: WeightLevel.MEDIUM,
        satisfied: data.ethHolding >= 0.1,
      },
    ];

    const score = metrics.reduce(
      (total, metric) => total + (metric.satisfied ? metric.weight : 0),
      0
    );

    return {
      trait: PersonaTrait.OG,
      score,
      metrics,
    };
  }

  private calculateDeFiChadScore(data: WalletMetrics): TraitScore {
    const metrics: TraitMetric[] = [
      {
        name: 'Longest token holding period > 3 months',
        weight: WeightLevel.MEDIUM,
        satisfied: data.longestHoldingPeriodMonths > 3,
      },
      {
        name: 'Token allocation > 50% portfolio value',
        weight: WeightLevel.HIGH,
        satisfied: data.tokenAllocationPercentage > 50,
      },
      {
        name: 'Active for over 120 days for the last 12 months',
        weight: WeightLevel.MEDIUM,
        satisfied: data.activeDaysLast12Months > 120,
      },
      {
        name: 'Top asset value between $2,000 and $5,000',
        weight: WeightLevel.MEDIUM,
        satisfied: data.topAssetValue >= 2000 && data.topAssetValue <= 5000,
      },
    ];

    const score = metrics.reduce(
      (total, metric) => total + (metric.satisfied ? metric.weight : 0),
      0
    );

    return {
      trait: PersonaTrait.DEFI_CHAD,
      score,
      metrics,
    };
  }

  private calculateDegenScore(data: WalletMetrics): TraitScore {
    const metrics: TraitMetric[] = [
      {
        name: 'Active for over 180 days within 12 months',
        weight: WeightLevel.HIGH,
        satisfied: data.activeDaysLast12Months > 180,
      },
      {
        name: 'Over 100 token activities within 12 months',
        weight: WeightLevel.HIGH,
        satisfied: data.totalTokenActivitiesLast12Months > 100,
      },
      {
        name: 'Longest token holding period < 3 months',
        weight: WeightLevel.MEDIUM,
        satisfied: data.longestHoldingPeriodMonths < 3,
      },
      {
        name: 'Token allocation > 70% portfolio value',
        weight: WeightLevel.LOW,
        satisfied: data.tokenAllocationPercentage > 70,
      },
      {
        name: 'Top asset is token, but not ETH',
        weight: WeightLevel.MEDIUM,
        satisfied: data.topAssetType === 'token' && data.topTokenSymbol !== 'ETH',
      },
    ];

    const score = metrics.reduce(
      (total, metric) => total + (metric.satisfied ? metric.weight : 0),
      0
    );

    return {
      trait: PersonaTrait.DEGEN,
      score,
      metrics,
    };
  }

  private calculateVirginCTScore(data: WalletMetrics): TraitScore {
    const metrics: TraitMetric[] = [
      {
        name: 'Wallet creation day > 2023',
        weight: WeightLevel.HIGH,
        satisfied: data.walletCreationDate.getFullYear() > 2023,
      },
      {
        name: 'Active for over 30 days for the last 12 months',
        weight: WeightLevel.MEDIUM,
        satisfied: data.activeDaysLast12Months > 30,
      },
      {
        name: 'Total portfolio value < $5,000',
        weight: WeightLevel.HIGH,
        satisfied: data.totalPortfolioValue < 5000,
      },
      {
        name: 'Total token activities < 50',
        weight: WeightLevel.MEDIUM,
        satisfied: data.totalTokenActivitiesLast12Months < 50,
      },
    ];

    const score = metrics.reduce(
      (total, metric) => total + (metric.satisfied ? metric.weight : 0),
      0
    );

    return {
      trait: PersonaTrait.VIRGIN_CT,
      score,
      metrics,
    };
  }
}
