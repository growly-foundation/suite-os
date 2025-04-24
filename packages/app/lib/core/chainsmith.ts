import { IEcosystemChainRegistry, TChainName } from 'chainsmith-sdk/types';

export const BackgroundChains: TChainName[] = [
  'mainnet',
  'base',
  'polygon',
  'berachain',
  'zksync',
  'abstract',
  'avalanche',
];

export const LocalEcosystemRegistry: IEcosystemChainRegistry = {
  evm: {
    chains: BackgroundChains,
  },
  svm: {
    chains: [],
  },
  other: {
    chains: [],
  },
};
