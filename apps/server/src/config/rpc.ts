import { Chains } from 'chainsmith-sdk/data';
import { GetChainRpcEndpoint } from 'chainsmith-sdk/rpc';
import { getChainDefaultRpcUrl } from 'chainsmith-sdk/utils';

function alchemyRpcUrl(chainId: string) {
  return `https://${chainId}.g.alchemy.com`;
}

const ALCHEMY_CHAIN_ENDPOINT = {
  [Chains.EvmChainList.mainnet.id]: alchemyRpcUrl('eth-mainnet'),
  [Chains.EvmChainList.base.id]: alchemyRpcUrl('base-mainnet'),
  [Chains.EvmChainList.polygon.id]: alchemyRpcUrl('polygon-mainnet'),
  [Chains.EvmChainList.sonic.id]: alchemyRpcUrl('sonic-mainnet'),
  [Chains.EvmChainList.berachain.id]: alchemyRpcUrl('berachain-mainnet'),
  [Chains.EvmChainList.zksync.id]: alchemyRpcUrl('zksync-mainnet'),
  [Chains.EvmChainList.abstract.id]: alchemyRpcUrl('abstract-mainnet'),
  [Chains.EvmChainList.avalanche.id]: alchemyRpcUrl('avax-mainnet'),
};

export const alchemy: (apiKey: string) => GetChainRpcEndpoint = (apiKey: string) => chain => {
  const endpoint = (ALCHEMY_CHAIN_ENDPOINT as any)[chain.id];
  if (!endpoint) return getChainDefaultRpcUrl(chain) || '';
  return `${endpoint}/v2/${apiKey}`;
};
