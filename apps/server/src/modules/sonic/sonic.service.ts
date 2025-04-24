import { Injectable } from '@nestjs/common';
import { AdapterRegistry, chainsmithSdk } from '../../config';
import type {
  TAddress,
  TChain,
  TChainName,
  TNftBalance,
  TTokenPortfolio,
  TTokenTransferActivity,
} from 'chainsmith-sdk/types';
import type { TSonicEcosystemApp, TSonicUserPointsStats } from 'chainsmith-sdk/plugins';
import { getChainByName } from 'chainsmith-sdk/utils';
import { ChainsmithSdk } from 'chainsmith-sdk';

@Injectable()
export class SonicService {
  CHAIN_NAME: TChainName = 'sonic';
  sdk: ChainsmithSdk = chainsmithSdk([this.CHAIN_NAME]);
  chain: TChain = getChainByName(this.CHAIN_NAME);

  async getTokenPortfolio(walletAddress: TAddress): Promise<TTokenPortfolio> {
    return this.sdk.portfolio.getTokenPortfolio([
      AdapterRegistry.ShadowExchangeApi,
      AdapterRegistry.ShadowExchange,
    ])(walletAddress, this.chain);
  }

  async getUserPointStats(walletAddress: TAddress): Promise<TSonicUserPointsStats> {
    return this.sdk.sonicPoint.fetchUserPointsStats(walletAddress);
  }

  async getSonicActivePointsApps(): Promise<TSonicEcosystemApp[]> {
    return this.sdk.sonicPoint.getSonicActivePointApps();
  }

  async getNftCollectibles(walletAddress: TAddress): Promise<TNftBalance[]> {
    return this.sdk.token.getNftCollectibles(AdapterRegistry.PaintSwap)(
      this.CHAIN_NAME,
      walletAddress
    );
  }

  async listTokenTransferActivities(walletAddress: TAddress): Promise<TTokenTransferActivity[]> {
    return this.sdk.token.listChainTokenTransferActivities(AdapterRegistry.Evmscan)(
      walletAddress,
      this.chain
    );
  }
}
