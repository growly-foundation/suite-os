import { getBasename } from '@/utils/basename';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import { ChainsmithSdk } from '@getgrowly/chainsmith';
import { EvmscanAdapter } from '@getgrowly/chainsmith/adapters';
import { ZerionPortfolioPlugin } from '@getgrowly/chainsmith/plugins';
import {
  TAddress,
  TChainName,
  TMultichain,
  TNftPortfolio,
  TNftTransferActivity,
  TTokenPortfolio,
  TTokenTransferActivity,
} from '@getgrowly/chainsmith/types';

export class EvmChainService {
  private readonly client;

  constructor(
    private chainsmithSdk: ChainsmithSdk,
    private evmScan: EvmscanAdapter,
    private zerionPortfolioPlugin: ZerionPortfolioPlugin
  ) {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http('https://eth.llamarpc.com'),
    });
  }

  async getEns(
    walletAddress: TAddress
  ): Promise<{ ensName: string; ensAvatar: string; basename: string }> {
    const ensName = await this.client.getEnsName({
      address: walletAddress,
      gatewayUrls: ['https://ccip.ens.xyz'],
    });

    const basename = await getBasename(walletAddress);

    if (ensName) {
      const ensAvatar = await this.client.getEnsAvatar({
        name: ensName,
      });

      return {
        ensName,
        ensAvatar: ensAvatar || '',
        basename: basename || '',
      };
    }

    return { ensName: '', ensAvatar: '', basename: basename || '' };
  }

  async listMultichainTokenTransferActivities(
    walletAddress: TAddress
  ): Promise<TMultichain<TTokenTransferActivity[]>> {
    return this.chainsmithSdk.token.listMultichainTokenTransferActivities(this.evmScan)(
      walletAddress
    );
  }

  async listMultichainNftTransferActivities(
    walletAddress: TAddress
  ): Promise<TMultichain<TNftTransferActivity[]>> {
    return this.chainsmithSdk.token.listMultichainNftTransferActivities(this.evmScan)(
      walletAddress
    );
  }

  async getWalletTokenPortfolio(walletAddress: TAddress): Promise<TTokenPortfolio> {
    return this.zerionPortfolioPlugin.getMultichainTokenPortfolio(
      walletAddress,
      this.#chainNames()
    );
  }

  async getWalletNftPortfolio(walletAddress: TAddress): Promise<TNftPortfolio> {
    return this.zerionPortfolioPlugin.getMultichainNftPortfolio(walletAddress, this.#chainNames());
  }

  #chainNames(): TChainName[] {
    return this.chainsmithSdk.chainNames as any;
  }
}
