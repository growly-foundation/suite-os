import { createPublicClient, http } from 'viem';
import { base, mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

import { TAddress } from '@getgrowly/chainsmith/types';

import { getAvatar, getName } from '../identity';

export class NameService {
  constructor() {}

  async getEthereumNameService(walletAddress: TAddress): Promise<{ name: string; avatar: string }> {
    const mainnetClient = createPublicClient({
      chain: mainnet,
      transport: http('https://eth.llamarpc.com'),
    });

    const ensName = await mainnetClient.getEnsName({
      address: walletAddress,
      gatewayUrls: ['https://ccip.ens.xyz'],
    });

    if (ensName) {
      const ensAvatar = await mainnetClient.getEnsAvatar({
        name: normalize(ensName),
      });

      return {
        name: normalize(ensName),
        avatar: ensAvatar || '',
      };
    }

    return { name: '', avatar: '' };
  }

  async getBaseNameService(walletAddress: TAddress): Promise<{ name: string; avatar: string }> {
    const basename = await getName({ address: walletAddress, chain: base });

    if (basename) {
      const basenameAvatar = await getAvatar({ ensName: basename, chain: base });

      return {
        name: normalize(basename),
        avatar: basenameAvatar || '',
      };
    }

    return { name: '', avatar: '' };
  }
}
