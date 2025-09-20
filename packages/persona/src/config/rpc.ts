import { data, rpc, utils } from '@getgrowly/chainsmith';

export const alchemyRpcUrl = (chainId: string) => `https://${chainId}.g.alchemy.com/v2`;

export const ALCHEMY_CHAIN_ENDPOINT = {
  [data.Chains.EvmChainList.mainnet.id]: alchemyRpcUrl('eth-mainnet'),
  [data.Chains.EvmChainList.base.id]: alchemyRpcUrl('base-mainnet'),
};

export const alchemy: (apiKey: string) => rpc.GetChainRpcEndpoint = (apiKey: string) => chain => {
  const endpoint = (ALCHEMY_CHAIN_ENDPOINT as any)[chain.id];
  if (!endpoint) return utils.getChainDefaultRpcUrl(chain) || '';
  return `${endpoint}/${apiKey}`;
};
