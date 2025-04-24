import { Body, Controller, Inject, Post } from '@nestjs/common';
import { EvmChainService } from './evm.service.ts';
import type {
  TChainName,
  TAddress,
  TTokenTransferActivity,
  TMultichain,
  TTokenPortfolio,
  TNftBalance,
  TLongestHoldingToken,
  TChainStats,
  TActivityStats,
  TNftTransferActivity,
  TNFTActivityStats,
} from 'chainsmith-sdk/types';
import { OnchainBusterService } from '../onchain-buster/onchain-buster.service.ts';

@Controller('/evm')
export class EvmController {
  constructor(
    @Inject(EvmChainService) private readonly evmChainService: EvmChainService,
    @Inject(OnchainBusterService) private readonly onchainBusterService: OnchainBusterService
  ) {}

  @Post('/portfolio')
  async getWalletTokenPortfolio(
    @Body() payload: { walletAddress: TAddress; chainNames: TChainName[] }
  ): Promise<TTokenPortfolio> {
    if (payload.chainNames.length === 0) throw new Error('No chain provided');
    return this.evmChainService.getWalletTokenPortfolio(payload.walletAddress, payload.chainNames);
  }

  @Post('/nfts')
  async getMultichainNftCollectibles(
    @Body() payload: { walletAddress: TAddress; chainNames: TChainName[] }
  ): Promise<TMultichain<TNftBalance[]>> {
    if (payload.chainNames.length === 0) throw new Error('No chain provided');
    return this.evmChainService.getMultichainNftCollectibles(
      payload.walletAddress,
      payload.chainNames
    );
  }

  @Post('/nfts/activity')
  async fetchMultichainNftActivity(
    @Body() payload: { walletAddress: TAddress; chainNames: TChainName[] }
  ): Promise<{
    allNftActivities: TNftTransferActivity[];
    nftActivityStats: TNFTActivityStats;
  }> {
    if (payload.chainNames.length === 0) throw new Error('No chain provided');
    return this.onchainBusterService.fetchMultichainNftActivity(
      payload.walletAddress,
      payload.chainNames
    );
  }

  @Post('/token/activity')
  async listMultichainTokenTransferActivities(
    @Body() payload: { walletAddress: TAddress; chainNames: TChainName[] }
  ): Promise<TMultichain<TTokenTransferActivity[]>> {
    if (payload.chainNames.length === 0) throw new Error('No chain provided');
    return this.evmChainService.listMultichainTokenTransferActivities(
      payload.walletAddress,
      payload.chainNames
    );
  }

  @Post('/activity-stats')
  async fetchActivityStats(
    @Body() payload: { walletAddress: TAddress; chainNames: TChainName[] }
  ): Promise<{
    longestHoldingTokenByChain: TLongestHoldingToken[];
    multichainTxs: TMultichain<TTokenTransferActivity[]>;
    chainStats: TChainStats;
    totalGasInETH: number;
    activityStats: TMultichain<TActivityStats>;
  }> {
    if (payload.chainNames.length === 0) throw new Error('No chain provided');
    return this.onchainBusterService.fetchActivityStats(payload.walletAddress, payload.chainNames);
  }
}
