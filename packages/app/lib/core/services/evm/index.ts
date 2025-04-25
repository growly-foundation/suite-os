import {
  TActivityStats,
  TAddress,
  TChainMetadataListResponse,
  TChainName,
  TChainStats,
  TLongestHoldingToken,
  TMultichain,
  TNFTActivityStats,
  TNftBalance,
  TNftTransferActivity,
  TTokenPortfolio,
  TTokenTransferActivity,
} from 'chainsmith-sdk/types';
import { BACKEND_SERVER_URL } from '../../config';
import { AxiosService } from '../axios';

export type TChainActivityStats = {
  longestHoldingTokenByChain: TLongestHoldingToken[];
  multichainTxs: TMultichain<TTokenTransferActivity[]>;
  chainStats: TChainStats;
  totalGasInETH: number;
  activityStats: TMultichain<TActivityStats>;
};

export class EvmApiService extends AxiosService {
  async getWalletTokenPortfolio(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TTokenPortfolio> {
    return this.post<{ walletAddress: TAddress; chainNames: TChainName[] }, TTokenPortfolio>(
      `${BACKEND_SERVER_URL}/evm/portfolio`,
      { walletAddress, chainNames }
    );
  }

  async getMultichainNftCollectibles(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TMultichain<TNftBalance[]>> {
    return this.post<
      { walletAddress: TAddress; chainNames: TChainName[] },
      TMultichain<TNftBalance[]>
    >(`${BACKEND_SERVER_URL}/evm/nfts`, { walletAddress, chainNames });
  }

  async fetchMultichainNftActivity(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<{
    allNftActivities: TNftTransferActivity[];
    nftActivityStats: TNFTActivityStats;
  }> {
    return this.post<
      { walletAddress: TAddress; chainNames: TChainName[] },
      { allNftActivities: TNftTransferActivity[]; nftActivityStats: TNFTActivityStats }
    >(`${BACKEND_SERVER_URL}/evm/nfts/activity`, { walletAddress, chainNames });
  }

  async listMultichainTokenTransferActivities(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TMultichain<TTokenTransferActivity[]>> {
    return this.post<
      { walletAddress: TAddress; chainNames: TChainName[] },
      TMultichain<TTokenTransferActivity[]>
    >(`${BACKEND_SERVER_URL}/evm/token/activity`, { walletAddress, chainNames });
  }

  async fetchActivityStats(
    walletAddress: TAddress,
    chainNames: TChainName[]
  ): Promise<TChainActivityStats> {
    return this.post<{ walletAddress: TAddress; chainNames: TChainName[] }, TChainActivityStats>(
      `${BACKEND_SERVER_URL}/evm/activity-stats`,
      { walletAddress, chainNames }
    );
  }

  async getChainMetadataById(chainId: number): Promise<TChainMetadataListResponse> {
    return this.get<TChainMetadataListResponse>(`${BACKEND_SERVER_URL}/chainlist/${chainId}`);
  }
}
