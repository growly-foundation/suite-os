import {
  TAddress,
  TNftBalance,
  TTokenPortfolio,
  TTokenTransferActivity,
} from 'chainsmith-sdk/types';
import { TSonicEcosystemApp, TSonicUserPointsStats } from 'chainsmith-sdk/plugins';
import { BACKEND_SERVER_URL } from '../../config';
import { AxiosService } from '../axios';
import {
  TAnglesMarket,
  TBeetsPool,
  TBeetsStakedSonicMarket,
  TMetropolisAggregatedInfo,
  TMetropolisV21Pool,
  TMetropolisVault,
  TMetropolisVaultPosition,
  TShadowEpochData,
  TShadowMixedPairs,
  TSiloMarket,
  TSiloMetrics,
} from 'chainsmith-sdk/adapters';

export class SonicChainApiService extends AxiosService {
  async getWalletTokenPortfolio(walletAddress: TAddress): Promise<TTokenPortfolio> {
    return this.post<{ walletAddress: TAddress }, TTokenPortfolio>(
      `${BACKEND_SERVER_URL}/sonic/portfolio`,
      { walletAddress }
    );
  }

  async listTokenTransferActivities(walletAddress: TAddress): Promise<TTokenTransferActivity[]> {
    return this.post<{ walletAddress: TAddress }, TTokenTransferActivity[]>(
      `${BACKEND_SERVER_URL}/sonic/activity`,
      { walletAddress }
    );
  }

  async getPointStats(walletAddress: TAddress): Promise<TSonicUserPointsStats> {
    return this.post<{ walletAddress: TAddress }, TSonicUserPointsStats>(
      `${BACKEND_SERVER_URL}/sonic/points`,
      { walletAddress }
    );
  }

  async getNftCollectibles(walletAddress: TAddress): Promise<TNftBalance[]> {
    return this.post<{ walletAddress: TAddress }, TNftBalance[]>(
      `${BACKEND_SERVER_URL}/sonic/nfts`,
      { walletAddress }
    );
  }

  async getUserBeetsPools(walletAddress: TAddress): Promise<TBeetsPool[]> {
    return this.post<{ walletAddress: TAddress }, TBeetsPool[]>(
      `${BACKEND_SERVER_URL}/sonic/beets/user`,
      { walletAddress }
    );
  }

  async getSonicActivePointsApps(): Promise<TSonicEcosystemApp[]> {
    return this.get<TSonicEcosystemApp[]>(`${BACKEND_SERVER_URL}/sonic/apps`);
  }

  async getBeetsPools(): Promise<TBeetsPool[]> {
    return this.get<TBeetsPool[]>(`${BACKEND_SERVER_URL}/sonic/beets/pools`);
  }

  async getStakedSonicMarket(): Promise<TBeetsStakedSonicMarket> {
    return this.get<TBeetsStakedSonicMarket>(`${BACKEND_SERVER_URL}/sonic/beets/staked`);
  }

  async getShadowMixedPairs(): Promise<TShadowMixedPairs> {
    return this.get<TShadowMixedPairs>(`${BACKEND_SERVER_URL}/sonic/shadow/mixed-pairs`);
  }

  async getShadowStatistics(): Promise<TShadowEpochData> {
    return this.get<TShadowEpochData>(`${BACKEND_SERVER_URL}/sonic/shadow/epoch`);
  }

  async getSiloMarkets(): Promise<TSiloMarket[]> {
    return this.get<TSiloMarket[]>(`${BACKEND_SERVER_URL}/sonic/silo/markets`);
  }

  async getSiloMetrics(): Promise<TSiloMetrics> {
    return this.get<TSiloMetrics>(`${BACKEND_SERVER_URL}/sonic/silo/metrics`);
  }

  async getV21Pools(): Promise<TMetropolisV21Pool[]> {
    return this.get<TMetropolisV21Pool[]>(`${BACKEND_SERVER_URL}/sonic/metropolis/pools`);
  }

  async getMetropolisProtocolStatistics(): Promise<TMetropolisAggregatedInfo> {
    return this.get<TMetropolisAggregatedInfo>(`${BACKEND_SERVER_URL}/sonic/metropolis/stats`);
  }

  async getUserVaultPositions(walletAddress: TAddress): Promise<TMetropolisVaultPosition[]> {
    return this.post<{ walletAddress: TAddress }, TMetropolisVaultPosition[]>(
      `${BACKEND_SERVER_URL}/sonic/metropolis/stats`,
      { walletAddress }
    );
  }

  async getMetropolisVaults(): Promise<TMetropolisVault[]> {
    return this.get<TMetropolisVault[]>(`${BACKEND_SERVER_URL}/sonic/metropolis/vaults`);
  }

  async getAngles(): Promise<TAnglesMarket> {
    return this.get<TAnglesMarket>(`${BACKEND_SERVER_URL}/sonic/angles/market`);
  }
}
