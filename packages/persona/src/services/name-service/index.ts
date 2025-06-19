import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

import { TAddress } from '@getgrowly/chainsmith/types';

import { getBasename, getBasenameAvatar } from './basename';

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
    const basename = await getBasename(walletAddress);

    if (basename) {
      const basenameAvatar = await getBasenameAvatar(basename);

      return {
        name: normalize(basename),
        avatar: basenameAvatar || '',
      };
    }

    return { name: '', avatar: '' };
  }
}
