import moment from 'moment';

import { types } from '@getgrowly/chainsmith';
import { ParsedUser } from '@getgrowly/core';

import { SUPPORTED_CHAINS, SUPPORTED_CHAIN_NAMES } from './chains';

export type TActivityFeed = {
  chainName: types.TChainName;
  activity: types.TTokenTransferActivity;
};

/**
 * Consumes persona data and provides utilities to access it
 * @param user - The parsed user object
 * @param chainIds - Optional array of chain IDs to filter data by (defaults to all supported chains)
 */
export const consumePersona = (user: ParsedUser, chainIds?: number[]) => {
  const personaData = user.personaData;
  const [identities, activities, portfolioSnapshots] = [
    personaData.identities,
    personaData.activities,
    personaData.portfolio_snapshots,
  ];

  // Filter chain names based on provided chain IDs
  const activeChainNames =
    chainIds && chainIds.length > 0
      ? SUPPORTED_CHAINS.filter(chain => chainIds.includes(chain.id)).map(
          chain => chain.name.toLowerCase() as types.TChainName
        )
      : SUPPORTED_CHAIN_NAMES;

  return {
    address: () => user.id,
    nameService: () =>
      activeChainNames
        .map(chainName => identities?.nameService?.[chainName])
        .find(nameService => !!nameService?.name) || { name: '', avatar: '' },
    dominantTrait: () => identities?.dominantTrait,
    totalPortfolioValue: () => portfolioSnapshots?.totalValue,
    multichainTransactions: () => activities?.tokenActivity,
    universalTransactions: () =>
      activeChainNames
        .map(chainName => activities?.tokenActivity?.[chainName])
        .filter(txs => !!txs)
        .flat(),
    totalMultichainTransactions: () =>
      activeChainNames.reduce((total, chainName) => {
        const chainTransactions = activities?.tokenActivity?.[chainName] || [];
        return total + chainTransactions.length;
      }, 0),
    dayActive: () => activities?.daysActive,
    totalNftCount: () =>
      activeChainNames.reduce((total, chainName) => {
        const nftList =
          portfolioSnapshots?.nftPortfolio?.chainRecordsWithNfts?.[chainName]?.nfts || [];
        return total + nftList.length;
      }, 0),
    universalTokenList: () =>
      activeChainNames
        .map(chainName => portfolioSnapshots?.tokenPortfolio?.chainRecordsWithTokens?.[chainName])
        .filter(tokenList => !!tokenList)
        .map(tokenList => tokenList.tokens)
        .flat(),
    universalNftList: () =>
      activeChainNames
        .map(chainName => portfolioSnapshots?.nftPortfolio?.chainRecordsWithNfts?.[chainName])
        .filter(nftList => !!nftList)
        .map(nftList => nftList.nfts)
        .flat(),
    dominantTraitScore: () =>
      identities?.traitScores?.find(traitScore => traitScore.trait === identities?.dominantTrait)
        ?.score,
    activityFeed: () => {
      const multichainActivities: TActivityFeed[] = [];
      for (const chainName of activeChainNames) {
        const chainActivities = activities?.tokenActivity?.[chainName];
        if (chainActivities) {
          multichainActivities.push(
            ...chainActivities.map(activity => ({
              activity,
              chainName,
            }))
          );
        }
      }
      return multichainActivities;
    },
    getLatestActivity: () => {
      let lastActivity: types.TTokenTransferActivity | null = null;
      for (const chainName of activeChainNames) {
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
