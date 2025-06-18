import { ConfigService } from '@nestjs/config';

import {
  ChainsmithSdk,
  adapters,
  initChainsmithSdk,
  plugins,
  rpc,
  types,
  utils,
} from '@getgrowly/chainsmith';

const initEnvs = (configService: ConfigService) => {
  return {
    ALCHEMY_API_KEY: configService.get('ALCHEMY_API_KEY') || '',
    ETHERSCAN_BASE_URL: 'https://api.etherscan.io/v2/api',
    ETHERSCAN_API_KEY: configService.get('ETHERSCAN_API_KEY') || '',
    ZERION_API_KEY: configService.get('ZERION_API_KEY') || '',
    ZERION_API_BASE_URL: 'https://api.zerion.io/v1',
  };
};

export const initializeChainsmith = (configService: ConfigService) => {
  const env = initEnvs(configService);
  const registry = {
    Adapters: {
      Alchemy: new adapters.AlchemyAdapter(env.ALCHEMY_API_KEY, new plugins.EvmTokenPlugin()),
      Evmscan: new adapters.EvmscanAdapter(env.ETHERSCAN_BASE_URL, env.ETHERSCAN_API_KEY),
    },
    Plugins: {
      ZerionPortfolio: new plugins.ZerionPortfolioPlugin(
        env.ZERION_API_BASE_URL,
        env.ZERION_API_KEY
      ),
    },
  };
  const buildDefaultChains = (chainNames: types.TChainName[]): types.TChain[] =>
    utils.buildEvmChains(chainNames, rpc.alchemy(env.ALCHEMY_API_KEY));

  const sdk = (chainNames: types.TChainName[] = []): ChainsmithSdk => {
    let chains: types.TChain[] = [];
    if (chainNames.length > 0) {
      chains = buildDefaultChains(chainNames);
    }
    return initChainsmithSdk(chains);
  };

  return {
    registry,
    sdk,
  };
};
