import {
  TAddress,
  TChainName,
  TMultichain,
  TNftPortfolio,
  TNftTransferActivity,
  TTokenPortfolio,
  TTokenTransferActivity,
} from '@getgrowly/chainsmith/types';

import { AdapterRegistry, chainsmithSdk, zerionPortfolioPlugin } from '../../config/chainsmith';

export class EvmChainService {
  async listMultichainTokenTransferActivities(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TMultichain<TTokenTransferActivity[]>> {
    return chainsmithSdk(chainNames).token.listMultichainTokenTransferActivities(
      AdapterRegistry.Evmscan
    )(walletAddress);
  }

  async listMultichainNftTransferActivities(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TMultichain<TNftTransferActivity[]>> {
    return chainsmithSdk(chainNames).token.listMultichainNftTransferActivities(
      AdapterRegistry.Evmscan
    )(walletAddress);
  }

  async getWalletTokenPortfolio(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TTokenPortfolio> {
    return zerionPortfolioPlugin.getMultichainTokenPortfolio(walletAddress, chainNames);
  }

  async getWalletNftPortfolio(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TNftPortfolio> {
    return zerionPortfolioPlugin.getMultichainNftPortfolio(walletAddress, chainNames);
  }
}
