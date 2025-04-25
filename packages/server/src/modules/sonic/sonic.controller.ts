import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { SonicService } from './sonic.service.ts';
import type {
  TAddress,
  TTokenTransferActivity,
  TTokenPortfolio,
  TNftBalance,
} from 'chainsmith-sdk/types';
import { TSonicEcosystemApp, TSonicUserPointsStats } from 'chainsmith-sdk/plugins';
import { AdapterRegistry } from '../../config/chainsmith.ts';
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
import { getChainIdByName } from 'chainsmith-sdk/utils';

@Controller('/sonic')
export class SonicController {
  constructor(@Inject(SonicService) private readonly service: SonicService) {}

  @Post('/portfolio')
  async getTokenPortfolio(@Body() payload: { walletAddress: TAddress }): Promise<TTokenPortfolio> {
    return this.service.getTokenPortfolio(payload.walletAddress);
  }

  @Post('/points')
  async getUserPointStats(
    @Body() payload: { walletAddress: TAddress }
  ): Promise<TSonicUserPointsStats> {
    return this.service.getUserPointStats(payload.walletAddress);
  }

  @Post('/nfts')
  async getNftCollectibles(@Body() payload: { walletAddress: TAddress }): Promise<TNftBalance[]> {
    return this.service.getNftCollectibles(payload.walletAddress);
  }

  @Post('/activity')
  async listTokenTransferActivities(
    @Body() payload: { walletAddress: TAddress }
  ): Promise<TTokenTransferActivity[]> {
    return this.service.listTokenTransferActivities(payload.walletAddress);
  }

  @Post('/beets/user')
  async getUserBeetsPools(@Body() payload: { walletAddress: TAddress }): Promise<TBeetsPool[]> {
    return AdapterRegistry.BeetsApi.getUserPoolsPositions(payload.walletAddress);
  }

  @Get('/apps')
  async getSonicActivePointsApps(): Promise<TSonicEcosystemApp[]> {
    return this.service.getSonicActivePointsApps();
  }

  @Get('/beets/pools')
  async getBeetsPools(): Promise<TBeetsPool[]> {
    return AdapterRegistry.BeetsApi.getPools();
  }

  @Get('/beets/staked')
  async getStakedSonicMarket(): Promise<TBeetsStakedSonicMarket> {
    return AdapterRegistry.BeetsApi.getStakedSonicMarket();
  }

  @Get('/shadow/mixed-pairs')
  async getShadowMixedPairs(): Promise<TShadowMixedPairs> {
    return AdapterRegistry.ShadowExchangeApi.getMixedPairs();
  }

  @Get('/shadow/epoch')
  async getShadowStatistics(): Promise<TShadowEpochData> {
    return AdapterRegistry.ShadowExchangeApi.getProtocolStatistics();
  }

  @Get('/silo/markets')
  async getSiloMarkets(): Promise<TSiloMarket[]> {
    return AdapterRegistry.SiloV2Api.getSiloMarkets();
  }

  @Get('/silo/metrics')
  async getSiloMetrics(): Promise<TSiloMetrics> {
    return AdapterRegistry.SiloV2Api.getSiloMetrics();
  }

  @Get('/metropolis/pools')
  async getV21Pools(): Promise<TMetropolisV21Pool[]> {
    return AdapterRegistry.MetropolisApi.getV21Pools();
  }

  @Get('/metropolis/stats')
  async getMetropolisProtocolStatistics(): Promise<TMetropolisAggregatedInfo> {
    return AdapterRegistry.MetropolisApi.getProtocolStatistics();
  }

  @Get('/metropolis/vaults')
  async getMetropolisVaults(): Promise<TMetropolisVault[]> {
    return AdapterRegistry.MetropolisApi.getVaults(getChainIdByName('sonic'));
  }

  @Get('/angles/market')
  async getAngles(): Promise<TAnglesMarket> {
    return AdapterRegistry.AnglesApi.getAnglesMarket();
  }

  @Post('/metropolis/stats')
  async getUserVaultPositions(
    @Body() payload: { walletAddress: TAddress }
  ): Promise<TMetropolisVaultPosition[]> {
    return AdapterRegistry.MetropolisApi.getUserVaultPositions(payload.walletAddress);
  }
}
