import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

import { RESOLVER_ADDRESSES_BY_CHAIN_ID } from '../../config/constants';
import type { GetAvatarParams, GetAvatarReturnType } from '../../types';
import { getPublicClientByChain, isBase, isEthereum } from '../../utils/client';

/**
 * An asynchronous function to fetch the Ethereum Name Service (ENS)
 * avatar for a given Ethereum name. It returns the ENS name if it exists,
 * or null if it doesn't or in case of an error.
 */
export const getAvatar = async ({
  ensName,
  chain = mainnet,
}: GetAvatarParams): Promise<GetAvatarReturnType> => {
  const chainIsBase = isBase(chain.id);
  const chainIsEthereum = isEthereum(chain.id);
  const chainSupportsUniversalResolver = chainIsEthereum || chainIsBase;

  if (!chainSupportsUniversalResolver) {
    return Promise.reject(
      'ChainId not supported, avatar resolution is only supported on Ethereum and Base.'
    );
  }

  let client = getPublicClientByChain(chain);
  let baseEnsAvatar = null;

  // 1. Try basename
  if (chainIsBase) {
    try {
      baseEnsAvatar = await client.getEnsAvatar({
        name: normalize(ensName),
        universalResolverAddress: RESOLVER_ADDRESSES_BY_CHAIN_ID[chain.id],
      });

      if (baseEnsAvatar) {
        return baseEnsAvatar;
      }
    } catch {
      // This is a best effort attempt, so we don't need to do anything here.
    }
  }

  // 2. Defaults to mainnet
  client = getPublicClientByChain(mainnet);
  const mainnetEnsAvatar = await client.getEnsAvatar({
    name: normalize(ensName),
  });

  if (mainnetEnsAvatar) {
    return mainnetEnsAvatar;
  }

  // 3. No avatars to display
  return null;
};
