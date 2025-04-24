import {
  TActivityStats,
  TChainStats,
  TDeFiActivityStats,
  TLongestHoldingToken,
  TTokenActivityStats,
  TTokenPortfolioStats,
} from 'chainsmith-sdk/types';
import { TNFTPortfolioStats } from '../core/contexts';
import { TSonicUserPointsStats } from 'chainsmith-sdk/plugins';

type TUserTraitResult = {
  trait: string;
  score: number;
};

export enum UserTrait {
  DeFi = 'DeFi Enthusiast',
  Art = 'Art Collector',
  Degen = 'Degen',
  DiamondHand = 'Diamond Hand',
  OriginalBuilder = 'Original Builder',
  MultichainCitizen = 'Multichain Citizen',
}

export enum ProductTag {
  DeFi = 'defi',
  DeFiProfessional = 'defi-professional',
  SocialFi = 'social',
  Gaming = 'gaming',
  NFT = 'nft',
  Bridge = 'bridge',
  DAO = 'dao',
}

export const getBaseTraits = (userTraits: UserTrait[]): ProductTag => {
  if (userTraits.includes(UserTrait.DeFi) && userTraits.includes(UserTrait.Degen)) {
    return ProductTag.SocialFi;
  }
  if (userTraits.includes(UserTrait.DeFi) && userTraits.includes(UserTrait.DiamondHand)) {
    return ProductTag.DeFiProfessional;
  }
  if (userTraits.includes(UserTrait.Art) && userTraits.includes(UserTrait.Degen)) {
    return ProductTag.Gaming;
  }
  if (userTraits.includes(UserTrait.Art) && userTraits.includes(UserTrait.DiamondHand)) {
    return ProductTag.NFT;
  }
  if (userTraits.includes(UserTrait.DeFi) && userTraits.includes(UserTrait.OriginalBuilder)) {
    return ProductTag.Bridge;
  }
  if (userTraits.includes(UserTrait.DeFi) && userTraits.includes(UserTrait.MultichainCitizen)) {
    return ProductTag.DeFi;
  }
  if (userTraits.includes(UserTrait.Art) && userTraits.includes(UserTrait.OriginalBuilder)) {
    return ProductTag.DAO;
  }
  if (userTraits.includes(UserTrait.Art) && userTraits.includes(UserTrait.MultichainCitizen)) {
    return ProductTag.DAO;
  }

  return ProductTag.NFT; // mint.fun is Based!
};

export const isDeFiOrArt = (
  tokenPortfolio: TTokenPortfolioStats,
  nftPortfolio: TNFTPortfolioStats,
  firstTransactionDate: Date
): TUserTraitResult => {
  const tokenPortfolioValue = tokenPortfolio.sumPortfolioUSDValue;
  const nftPortfolioValue = nftPortfolio.sumPortfolioUSDValue;
  const totalPortfolioValue = tokenPortfolioValue + nftPortfolioValue;

  const mostTokenValue = tokenPortfolio.mostValuableToken.totalUsdValue;
  const mostNftValue = nftPortfolio.mostValuableNFTCollection?.balance || 0;

  // Debug
  // console.log('------ Start: DeFi or Art Score --------');
  // console.log(
  //   `0.3 * (${tokenPortfolioValue} / ${totalPortfolioValue}): TokenPort ${tokenPortfolioValue} / FullPort ${totalPortfolioValue}  `,
  // );
  // console.log(
  //   `0.15 * (${mostTokenValue > mostNftValue ? 1 : 0}): Token: ${mostTokenValue} vs NFT: ${mostNftValue}`,
  // );
  // console.log(
  //   `0.35 * (${defiSumCount} / (${defiSumCount} + ${nftMarketplaceCount})): DeFi sumCount / (DeFi sumCount + NFTMarketplace sumCount)`,
  // );
  // console.log(
  //   `0.2 * (${firstTransactionDate.getFullYear() < 2022 ? 1 : 0}): First txYear: ${firstTransactionDate.getFullYear()}`,
  // );

  // console.log('------ End: DeFi or Art Score --------');

  const score =
    // 30% * (sum of $Token / sum of ($Token + $NFT))
    0.3 *
      (totalPortfolioValue === 0
        ? totalPortfolioValue
        : tokenPortfolioValue / totalPortfolioValue) +
    // 15% * (if topValueAsset is NFT then 1 else 0)
    0.15 * (mostTokenValue > mostNftValue ? 1 : 0) +
    // 20% * (if 1st_transaction < 2022 then 1 else 0)
    0.2 * (firstTransactionDate.getFullYear() < 2022 ? 1 : 0);

  // DeFi Enthusiast if >50% else Art Collector
  return { score, trait: score > 0.5 ? UserTrait.DeFi : UserTrait.Art };
};

export const isDegenOrDiamondHand = (
  tokenActivityStats: TTokenActivityStats,
  defiActivityStats: TDeFiActivityStats,
  longestHoldingToken: TLongestHoldingToken,
  firstTransactionDate: Date
): TUserTraitResult => {
  const defiDexCount = defiActivityStats.dexCount;
  const defiSumCount = defiActivityStats.sumCount;

  const newTokenCount = tokenActivityStats.newCount;
  const sumTokenCount = tokenActivityStats.sumCount;

  const walletAgeDuration = (Date.now() - firstTransactionDate.getTime()) / 1000;
  const longestHoldingDuration = longestHoldingToken.duration;

  const holdingRatio = longestHoldingDuration / walletAgeDuration;

  // Debug
  // console.log('------ Start: DeGen or Diamond --------');
  // console.log(
  //   `0.25 * (sqrt(${defiDexCount} / ${defiSumCount})): DEX Count / DeFi Count`,
  // );
  // console.log(
  //   `0.25 * (1 - (${longestHoldingDuration} / ${walletAgeDuration})):  LongestHolding: ${formatDuration(longestHoldingDuration)} / WalletAge ${formatDuration(walletAgeDuration)}`,
  // );
  // console.log(
  //   `0.35 * (${newTokenCount} / ${sumTokenCount}):  New token (12m) Count / All token Count`,
  // );
  // console.log(
  //   `0.15 * (${
  //     longestHoldingToken.duration / (3600 * 24 * 365) > 1 // 1 year
  //       ? 0
  //       : 1
  //   }): Longest holding duration (${formatDuration(longestHoldingToken.duration)})`,
  // );

  // console.log('------ End: DeGen or Diamond --------');

  const score =
    // 25% * (longestTokenHolding / walletAge)
    0.25 * (1 - holdingRatio) +
    // 25% * (sqrt(dexCount / defiCount))
    0.25 * (defiSumCount === 0 ? defiSumCount : Math.sqrt(defiDexCount / defiSumCount)) +
    // 35% * (newCount Token / sumCount Token )
    0.35 * (sumTokenCount === 0 ? sumTokenCount : newTokenCount / sumTokenCount) +
    // 15% * (longest holding token is > 12 months)
    0.15 *
      (longestHoldingDuration / (3600 * 24 * 365) > 1 // 1 year
        ? 0
        : 1);

  // Degen (interact with new stuffs) if >50% else long-term Holder
  return {
    score,
    trait: score > 0.5 ? UserTrait.Degen : UserTrait.DiamondHand,
  };
};

export const isOriginalBuilderOrMultichainCitizen = (
  activityStats: TActivityStats,
  chainStats: TChainStats,
  sonicPoints: TSonicUserPointsStats
): TUserTraitResult => {
  // Degen (interact with new stuffs) or long-term Holders?
  const noActivityChains = chainStats.noActivityChains.length;
  const totalChains = chainStats.totalChains.length;

  const uniqueActiveDaysAll = activityStats.uniqueActiveDays;
  const countUniqueDaysActiveChain = chainStats.countUniqueDaysActiveChain;

  const countActiveChainTxs = chainStats.countActiveChainTxs;
  const totalTxs = activityStats.totalTxs;

  // console.log('------ Start: Builder or Citizen --------');
  // console.log(
  //   `0.25 * (${noActivityChains} / ${totalChains}): No Activity Chains: ${noActivityChains} / All Chain: ${totalChains})`,
  // );
  // console.log(
  //   `0.3 * (${countUniqueDaysActiveChain} / ${uniqueActiveDaysAll}): ActiveDayActiveChain / ActiveDayAll)`,
  // );
  // console.log(
  //   `0.3 * (${countActiveChainTxs} / ${totalTxs}): mostActiveChainTxs / allTxs`,
  // );
  // console.log(
  //   `0.15 * (${skillsScore !== 0 ? 1 : 0}): Skills score: ${skillsScore}`,
  // );

  // console.log('------ End: Builder or Citizen --------');

  const score =
    // 25% * (noActivityChains / totalChains)
    0.25 * (totalChains === 0 ? totalChains : noActivityChains / totalChains) +
    0.3 *
      // 30% * (countUniqueDaysActiveChain / uniqueActiveDaysAll)
      (uniqueActiveDaysAll === 0
        ? uniqueActiveDaysAll
        : countUniqueDaysActiveChain / uniqueActiveDaysAll) +
    // 30% * (activeChainTxs / totalTxs)
    0.3 * (totalTxs === 0 ? totalTxs : countActiveChainTxs / totalTxs) +
    // 15% * (if skillsScore != 0 then 1 else 0)
    0.15 * (sonicPoints.ecosystem_points > 100000 ? 1 : 0);

  // Chain-dedicated builder (rather stay & build on 1 chain) if >50% else Multi-chain user
  return {
    trait: score > 0.5 ? UserTrait.OriginalBuilder : UserTrait.MultichainCitizen,
    score,
  };
};
