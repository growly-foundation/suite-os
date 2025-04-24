import { ChainsmithSdk, initChainsmithSdk } from 'chainsmith-sdk';
import {
  AlchemyAdapter,
  UniswapSdkAdapter,
  EvmscanAdapter,
  DexScreenerAdapter,
  CoinMarketcapAdapter,
  OriginApiAdapter,
  ReservoirAdapter,
  BeetsApiAdapter,
  SiloV2ApiAdapter,
  MetropolisApiAdapter,
  PaintSwapAdapter,
  ShadowExchangeAdapter,
  ShadowExchangeApiAdapter,
  AnglesApiAdapter,
} from 'chainsmith-sdk/adapters';
import { EvmTokenPlugin } from 'chainsmith-sdk/plugins';
import { alchemy } from 'chainsmith-sdk/rpc';
import { TChain, TChainName } from 'chainsmith-sdk/types';
import { buildEvmChains } from 'chainsmith-sdk/utils';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const COINMARKETCAP_API_BASE_URL = 'https://pro-api.coinmarketcap.com';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY || '';

export const AdapterRegistry = {
  Alchemy: new AlchemyAdapter(ALCHEMY_API_KEY, new EvmTokenPlugin()),
  AnglesApi: new AnglesApiAdapter(),
  BeetsApi: new BeetsApiAdapter(),
  CoinMarketcap: new CoinMarketcapAdapter(COINMARKETCAP_API_BASE_URL, COINMARKETCAP_API_KEY),
  DexScreener: new DexScreenerAdapter(),
  Evmscan: new EvmscanAdapter(ETHERSCAN_BASE_URL, ETHERSCAN_API_KEY),
  MetropolisApi: new MetropolisApiAdapter(),
  OriginApi: new OriginApiAdapter(),
  PaintSwap: new PaintSwapAdapter(),
  Reservoir: new ReservoirAdapter(RESERVOIR_API_KEY),
  ShadowExchangeApi: new ShadowExchangeApiAdapter(),
  ShadowExchange: new ShadowExchangeAdapter(new EvmTokenPlugin()),
  SiloV2Api: new SiloV2ApiAdapter(),
  Uniswap: new UniswapSdkAdapter(alchemy(ALCHEMY_API_KEY)),
};

export const buildDefaultChains = (chainNames: TChainName[]): TChain[] =>
  buildEvmChains(chainNames, alchemy(ALCHEMY_API_KEY));

export const chainsmithSdk = (chainNames: TChainName[] = []): ChainsmithSdk => {
  let chains = [];
  if (chainNames.length > 0) {
    chains = buildDefaultChains(chainNames);
  }
  return initChainsmithSdk(chains);
};
