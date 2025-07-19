import moment from 'moment';

import { types } from '@getgrowly/chainsmith';
import { ParsedUser } from '@getgrowly/core';

export const SUPPORTED_CHAINS: types.TChainName[] = ['mainnet', 'base', 'optimism'];

export const consumePersona = (user: ParsedUser) => {
  const personaData = user.personaData;
  const [identities, activities, portfolioSnapshots] = [
    personaData.identities,
    personaData.activities,
    personaData.portfolio_snapshots,
  ];

  return {
    nameService: () =>
      SUPPORTED_CHAINS.map(chainName => identities?.nameService?.[chainName]).find(
        nameService => !!nameService?.name
      ) || { name: '', avatar: '' },
    dominantTrait: () => identities?.dominantTrait,
    multichainTransactions: () => activities?.tokenActivity,
    universalTransactions: () =>
      SUPPORTED_CHAINS.map(chainName => activities?.tokenActivity?.[chainName])
        .filter(txs => !!txs)
        .flat(),
    totalMultichainTransactions: () =>
      SUPPORTED_CHAINS.reduce((total, chainName) => {
        const chainTransactions = activities?.tokenActivity?.[chainName] || [];
        return total + chainTransactions.length;
      }, 0),
    dayActive: () => activities?.daysActive,
    totalNftCount: () =>
      SUPPORTED_CHAINS.reduce((total, chainName) => {
        const nftList =
          portfolioSnapshots?.nftPortfolio?.chainRecordsWithNfts?.[chainName]?.nfts || [];
        return total + nftList.length;
      }, 0),
    universalTokenList: () =>
      SUPPORTED_CHAINS.map(
        chainName => portfolioSnapshots?.tokenPortfolio?.chainRecordsWithTokens?.[chainName]
      )
        .filter(tokenList => !!tokenList)
        .map(tokenList => tokenList.tokens)
        .flat(),
    universalNftList: () =>
      SUPPORTED_CHAINS.map(
        chainName => portfolioSnapshots?.nftPortfolio?.chainRecordsWithNfts?.[chainName]
      )
        .filter(nftList => !!nftList)
        .map(nftList => nftList.nfts)
        .flat(),
    dominantTraitScore: () =>
      identities?.traitScores?.find(traitScore => traitScore.trait === identities?.dominantTrait)
        ?.score,
    getLatestActivity: () => {
      let lastActivity: types.TTokenTransferActivity | null = null;
      for (const chainName of SUPPORTED_CHAINS) {
        const activity = activities?.tokenActivity?.[chainName]?.[0];
        if (!lastActivity && activity) {
          lastActivity = activity;
        } else if (activity && activity.timestamp > (lastActivity?.timestamp || 0)) {
          lastActivity = activity;
        }
      }
      return lastActivity;
    },
    walletCreatedAt: () => {
      const creationDate = identities?.walletMetrics?.walletCreationDate;
      return creationDate ? moment(creationDate).toDate() : null;
    },
    getHumanCheckmark: (): boolean => !!identities?.talentProtocol?.profile?.human_checkmark,
  };
};
