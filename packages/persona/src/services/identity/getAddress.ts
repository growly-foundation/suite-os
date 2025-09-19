import { mainnet } from 'viem/chains';

import type { GetAddressParams, GetAddressReturnType } from '../../types';
import { publicClientByChain } from '../../utils/client';

/**
 * Get address from ENS name or Basename.
 */
export const getAddress = async ({ name }: GetAddressParams): Promise<GetAddressReturnType> => {
  const mainnetClient = publicClientByChain[mainnet.id];

  // Gets address for ENS name.
  const address = await mainnetClient.getEnsAddress({
    name,
  });

  return address ?? null;
};
