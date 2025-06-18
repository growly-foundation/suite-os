import {
  ChainsmithSdk,
  adapters,
  initChainsmithSdk,
  plugins,
  rpc,
  types,
  utils,
} from '@getgrowly/chainsmith';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const COINMARKETCAP_API_BASE_URL = 'https://pro-api.coinmarketcap.com';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || '';
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY || '';

const ZERION_API_KEY = process.env.ZERION_API_KEY || '';
const ZERION_API_BASE_URL = 'https://api.zerion.io/v1';

export const Registry = {
  Adapters: {
    Alchemy: new adapters.AlchemyAdapter(ALCHEMY_API_KEY, new plugins.EvmTokenPlugin()),
    CoinMarketcap: new adapters.CoinMarketcapAdapter(
      COINMARKETCAP_API_BASE_URL,
      COINMARKETCAP_API_KEY
    ),
    DexScreener: new adapters.DexScreenerAdapter(),
    Evmscan: new adapters.EvmscanAdapter(ETHERSCAN_BASE_URL, ETHERSCAN_API_KEY),
    Reservoir: new adapters.ReservoirAdapter(RESERVOIR_API_KEY),
  },
  Plugins: {
    ZerionPortfolio: new plugins.ZerionPortfolioPlugin(ZERION_API_BASE_URL, ZERION_API_KEY),
  },
};

export const buildDefaultChains = (chainNames: types.TChainName[]): types.TChain[] =>
  utils.buildEvmChains(chainNames, rpc.alchemy(ALCHEMY_API_KEY));

export const chainsmithSdk = (chainNames: types.TChainName[] = []): ChainsmithSdk => {
  let chains: types.TChain[] = [];
  if (chainNames.length > 0) {
    chains = buildDefaultChains(chainNames);
  }
  return initChainsmithSdk(chains);
};
