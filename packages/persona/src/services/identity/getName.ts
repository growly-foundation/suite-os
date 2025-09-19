import { base, mainnet } from 'viem/chains';

import { RESOLVER_ADDRESSES_BY_CHAIN_ID } from '../../config/constants';
import type { Basename, GetNameParams, GetNameReturnType } from '../../types';
import { getPublicClientByChain, isBase, isEthereum } from '../../utils/client';
import L2ResolverAbi from './abis/L2ResolverAbi';
import { convertReverseNodeToBytes } from './convertReverseNodeToBytes';
import { getAddress } from './getAddress';

/**
 * An asynchronous function to fetch the Ethereum Name Service (ENS)
 * name for a given Ethereum address. It returns the ENS name if it exists,
 * or null if it doesn't or in case of an error.
 */
export const getName = async ({
  address,
  chain = mainnet,
}: GetNameParams): Promise<GetNameReturnType> => {
  const chainIsBase = isBase(chain.id);
  const chainIsEthereum = isEthereum(chain.id);
  const chainSupportsUniversalResolver = chainIsEthereum || chainIsBase;

  if (!chainSupportsUniversalResolver) {
    return Promise.reject(
      'ChainId not supported, name resolution is only supported on Ethereum and Base.'
    );
  }

  if (!address) {
    return null;
  }

  const client = getPublicClientByChain(chain);

  if (chainIsBase) {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    try {
      const basename = (await client.readContract({
        abi: L2ResolverAbi,
        address: RESOLVER_ADDRESSES_BY_CHAIN_ID[chain.id],
        functionName: 'name',
        args: [addressReverseNode],
      })) as Basename;

      // Verify basename with forward resolution
      if (basename) {
        try {
          const resolvedAddress = await getAddress({
            name: basename,
          });

          if (resolvedAddress && resolvedAddress.toLowerCase() === address.toLowerCase()) {
            return basename;
          }
        } catch (error) {
          console.error('Error during basename forward resolution verification:', error);
        }
      }
    } catch {
      // This is a best effort attempt, so we don't need to do anything here.
    }
  }

  // Default fallback to mainnet
  // ENS resolution is not well-supported on Base, so want to ensure that we fall back to mainnet
  const fallbackClient = getPublicClientByChain(mainnet);

  try {
    // ENS username
    const ensName = await fallbackClient.getEnsName({
      address,
      gatewayUrls: ['https://ccip.ens.xyz'],
    });

    // Verify ENS name with forward resolution
    if (ensName) {
      try {
        const resolvedAddress = await getAddress({
          name: ensName,
        });

        if (resolvedAddress && resolvedAddress.toLowerCase() === address.toLowerCase()) {
          return ensName;
        }
      } catch (error) {
        console.error('Error during ENS forward resolution verification:', error);
      }
    }
  } catch {
    // This is a best effort attempt, so we don't need to do anything here.
  }

  return null;
};
