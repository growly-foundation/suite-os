import { data, rpc, utils } from '@getgrowly/chainsmith';

function alchemyRpcUrl(chainId: string) {
  return `https://${chainId}.g.alchemy.com`;
}

const ALCHEMY_CHAIN_ENDPOINT = {
  [data.Chains.EvmChainList.mainnet.id]: alchemyRpcUrl('eth-mainnet'),
  [data.Chains.EvmChainList.base.id]: alchemyRpcUrl('base-mainnet'),
};

export const alchemy: (apiKey: string) => rpc.GetChainRpcEndpoint = (apiKey: string) => chain => {
  const endpoint = (ALCHEMY_CHAIN_ENDPOINT as any)[chain.id];
  if (!endpoint) return utils.getChainDefaultRpcUrl(chain) || '';
  return `${endpoint}/v2/${apiKey}`;
};
