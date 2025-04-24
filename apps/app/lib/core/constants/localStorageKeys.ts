import { TAddress } from 'chainsmith-sdk/types';

export type LocalStorageCacheKey = [string, number];

const HOUR = 1000 * 60 * 60;

export const INVESTMENT_OBJECTIVES = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.investmentObjectives`,
  HOUR * 24 * 10,
];

export const MULTICHAIN_TOKEN_PORTFOLIO = (
  addressInput: TAddress | undefined
): LocalStorageCacheKey => [`${addressInput}.multichainTokenPortfolio`, HOUR * 5];

export const MULTICHAIN_DATA_READY = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.multichainDataReady`,
  HOUR * 24 * 30,
];

export const MULTICHAIN_ACTIVITY_STATS = (
  addressInput: TAddress | undefined
): LocalStorageCacheKey => [`${addressInput}.multichainActivityStats`, HOUR * 24 * 30];

export const MULTICHAIN_NFT_BALANCES = (
  addressInput: TAddress | undefined
): LocalStorageCacheKey => [`${addressInput}.multichainNftBalances`, HOUR * 24 * 30];

export const MULTICHAIN_NFT_ACTIVITY_DATA = (addressInput: TAddress): LocalStorageCacheKey => [
  `${addressInput}.multichainNftActivityData`,
  HOUR * 24 * 30,
];

export const NATIVE_TOKEN_PORTFOLIO = (
  addressInput: TAddress | undefined
): LocalStorageCacheKey => [`${addressInput}.tokenPortfolio`, HOUR / 2];

export const NATIVE_POINTS = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.points`,
  HOUR * 3,
];

export const NATIVE_NFT_PORTFOLIO = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.nftPortfolio`,
  HOUR / 2,
];

export const NATIVE_DAPP_PROTOCOL = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.dappProtocol`,
  HOUR * 10,
];

export const SELECTED_NETWORKS = (addressInput: TAddress | undefined): LocalStorageCacheKey => [
  `${addressInput}.selectedNetworks`,
  HOUR * 24 * 10,
];
