import { TNftBalance } from 'chainsmith-sdk/types';
import { LocalStorageCacheKey, UseState, buildCachePayload, storeJsonCacheData } from '.';

export const mustBeBoolean = (v: any) => !!v;

export const delayMs = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function selectState<T>(s: UseState<T>): T {
  return s[0];
}

export function setState<T>(s: UseState<T>) {
  return s[1];
}

export function setStateAndStoreInCache<T>(
  state: UseState<T>,
  [key, expiration]: LocalStorageCacheKey,
  data: T
) {
  storeJsonCacheData(key, buildCachePayload(data, expiration));
  setState(state)(data);
}

export function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// TODO: Get price of the currency
const getNftPrice = (nftBalance: TNftBalance) => {
  return nftBalance.balance * nftBalance.floorPrice;
};

export const calculateMultichainNFTPortfolio = (nftBalanceList: TNftBalance[]) => {
  // Calculate sumPortfolioUSDValue
  let sumPortfolioUSDValue = 0;
  for (const nft of nftBalanceList) {
    sumPortfolioUSDValue += getNftPrice(nft);
  }

  // Calculate mostValuableNFTCollection
  const mostValuableNFTCollection =
    nftBalanceList.length > 0
      ? nftBalanceList.reduce((prev, current) =>
          prev && getNftPrice(prev) > getNftPrice(current) ? prev : current
        )
      : undefined;

  const chainRecordsWithTokens = {};

  for (const nft of nftBalanceList) {
    chainRecordsWithTokens[nft.chainId] = {
      tokens: (chainRecordsWithTokens[nft.chainId]?.tokens || []).concat(nft),
      totalUSDValue: (chainRecordsWithTokens[nft.chainId]?.totalUSDValue || 0) + getNftPrice(nft),
    };
  }

  return {
    sumPortfolioUSDValue,
    mostValuableNFTCollection,
    chainRecordsWithTokens,
  };
};
