import {
  EvmChainPlugin,
  EvmTokenPlugin,
  MultiPlatformSocialPlugin,
  MultichainPortfolioPlugin,
  MultichainTokenPlugin,
  StoragePlugin,
} from './plugins';
import type { TChain } from './types';

export class ChainsmithSdk {
  portfolio: MultichainPortfolioPlugin = new MultichainPortfolioPlugin();
  token: MultichainTokenPlugin = new MultichainTokenPlugin();
  social: MultiPlatformSocialPlugin = new MultiPlatformSocialPlugin();
  storage: StoragePlugin = new StoragePlugin();
  evmToken: EvmTokenPlugin = new EvmTokenPlugin();
  evmChain: EvmChainPlugin = new EvmChainPlugin();

  get chains() {
    return this.storage.readDisk('chains');
  }

  get chainNames() {
    return this.storage.readDisk('chains').map(chain => chain.name);
  }
}

export function initChainsmithSdk(chains?: TChain[]) {
  const sdk = new ChainsmithSdk();
  if (chains) sdk.storage.writeToDisk('chains', chains);
  return sdk;
}
