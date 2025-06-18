import { PersonaAnalysis } from '@/types';

import {
  TActivityStats,
  TAddress,
  TChainName,
  TChainStats,
  TLongestHoldingToken,
  TMultichain,
  TNftPortfolio,
  TTokenPortfolio,
  TTokenTransferActivity,
} from '@getgrowly/chainsmith/types';
import {
  calculateEVMStreaksAndMetrics,
  calculateGasInETH,
  findLongestHoldingToken,
} from '@getgrowly/chainsmith/utils';

import { EvmChainService } from '../evm';
import { PersonaClassifierService } from '../persona-classifier';

export class OnchainBusterService {
  private personaClassifier: PersonaClassifierService;

  constructor(private evmChainService: EvmChainService) {
    this.personaClassifier = new PersonaClassifierService(evmChainService);
  }

  /**
   * Get the activity stats for a wallet
   */
  fetchActivityStats = async (
    addressInput: TAddress
  ): Promise<{
    // Activity data
    longestHoldingTokenByChain: TLongestHoldingToken[];
    multichainTxs: TMultichain<TTokenTransferActivity[]>;
    chainStats: TChainStats;
    totalGasInETH: number;
    activityStats: TMultichain<TActivityStats>;
    walletCreationDate: Date;
  }> => {
    // Fetch all required data in parallel
    const multichainTxs =
      await this.evmChainService.listMultichainTokenTransferActivities(addressInput);

    // Process token activity data
    const allTransactions = Object.values(multichainTxs).flat();
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

    const totalChains: TChainName[] = Object.keys(multichainTxs) as TChainName[];
    const filteredTransactions = Object.values(multichainTxs)
      .flat()
      .filter(tx => tx.from.toLowerCase() === addressInput.toLowerCase());

    const totalGasInETH = filteredTransactions.reduce(
      (acc, curr) =>
        acc + calculateGasInETH(Number.parseInt(curr.gasUsed), Number.parseInt(curr.gasPrice)),
      0
    );

    const longestHoldingTokenByChain = Object.entries(multichainTxs).map(([chain, activities]) => {
      return findLongestHoldingToken(chain as TChainName, activities, addressInput);
    });

    let mostActiveChainName: TChainName = totalChains.reduce((a, b) =>
      (multichainTxs[a]?.length || 0) > (multichainTxs[b]?.length || 0) ? a : b
    );

    // Default chain should be 'Base'
    if (multichainTxs[mostActiveChainName]?.length === 0) mostActiveChainName = 'base';

    const _countActiveChainTxs = multichainTxs[mostActiveChainName]?.length || 0;

    // Get Activity Stats
    const activityStats: TMultichain<TActivityStats> = {};
    for (const chain of totalChains) {
      const chainTxs = multichainTxs[chain];
      if (chainTxs?.length || 0 > 0) {
        activityStats[chain] = calculateEVMStreaksAndMetrics(chainTxs || [], addressInput);
      }
    }

    // Get chain stats
    const noActivityChains = totalChains.filter(chain => multichainTxs[chain]?.length || 0 === 0);
    const { uniqueActiveDays } = calculateEVMStreaksAndMetrics(
      multichainTxs[mostActiveChainName] || [],
      addressInput
    );

    const chainStats: TChainStats = {
      totalChains,
      mostActiveChainName,
      noActivityChains,
      countUniqueDaysActiveChain: uniqueActiveDays,
      countActiveChainTxs: _countActiveChainTxs,
    };

    return {
      longestHoldingTokenByChain,
      multichainTxs,
      chainStats,
      totalGasInETH,
      activityStats,
      walletCreationDate,
    };
  };

  /**
   * Get the persona classification for a wallet
   */
  fetchPersonaAnalysis = async (
    addressInput: TAddress
  ): Promise<{
    analysis: PersonaAnalysis;
    raw: {
      tokenPortfolio: TTokenPortfolio;
      nftPortfolio: TNftPortfolio;
      tokenActivities: TMultichain<TTokenTransferActivity[]>;
    };
  }> => {
    return this.personaClassifier.analyzeWalletPersona(addressInput);
  };
}
