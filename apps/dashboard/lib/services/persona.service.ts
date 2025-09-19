import { base, mainnet } from 'viem/chains';

import { Address, getAvatar, getAvatars, getName, getNames } from '@getgrowly/persona';

export class PersonaService {
  // Single address avatar fetching (for individual components)
  static async getAvatar(address: Address, chain = mainnet): Promise<string> {
    const ensName = await getName({
      address,
      chain,
    });
    if (!ensName) return '';
    const avatar = await getAvatar({
      ensName,
      chain,
    });
    if (!avatar) return '';
    return avatar;
  }

  // Optimized single address identity fetching with parallel requests
  static async getAggregatedIdentity(address: Address): Promise<{
    mainnet: { name: string; avatar: string };
    base: { name: string; avatar: string };
  }> {
    // Use parallel requests for both chains
    const [baseIdentity, ethereumIdentity] = await Promise.all([
      getName({
        address,
        chain: base,
      }),
      getName({
        address,
        chain: mainnet,
      }),
    ]);

    const baseEnsName = baseIdentity || '';
    const ethereumEnsName = ethereumIdentity || '';

    // Fetch avatars in parallel only if names exist
    const [baseAvatar, ethereumAvatar] = await Promise.all([
      baseEnsName ? getAvatar({ ensName: baseEnsName, chain: base }) : Promise.resolve(''),
      ethereumEnsName
        ? getAvatar({ ensName: ethereumEnsName, chain: mainnet })
        : Promise.resolve(''),
    ]);

    return {
      mainnet: {
        name: ethereumEnsName,
        avatar: ethereumAvatar || '',
      },
      base: {
        name: baseEnsName,
        avatar: baseAvatar || '',
      },
    };
  }

  // Batch identity fetching using multicall (for lists of addresses)
  static async getAggregatedIdentities(addresses: Address[]): Promise<
    Record<
      Address,
      {
        mainnet: { name: string; avatar: string };
        base: { name: string; avatar: string };
      }
    >
  > {
    if (!addresses || addresses.length === 0) {
      return {};
    }

    // Use multicall to fetch names from both chains in parallel
    const [baseNames, mainnetNames] = await Promise.all([
      getNames({ addresses, chain: base }),
      getNames({ addresses, chain: mainnet }),
    ]);

    // Extract valid names for avatar fetching (filter out null values)
    const baseValidNames = baseNames.filter((name): name is string => Boolean(name));
    const mainnetValidNames = mainnetNames.filter((name): name is string => Boolean(name));

    // Batch fetch avatars for valid names
    const [baseAvatars, mainnetAvatars] = await Promise.all([
      baseValidNames.length > 0
        ? getAvatars({ ensNames: baseValidNames, chain: base })
        : Promise.resolve([]),
      mainnetValidNames.length > 0
        ? getAvatars({ ensNames: mainnetValidNames, chain: mainnet })
        : Promise.resolve([]),
    ]);

    // Create lookup maps for avatars
    const baseAvatarMap = new Map<string, string>();
    const mainnetAvatarMap = new Map<string, string>();

    baseValidNames.forEach((name, index) => {
      if (name && baseAvatars[index]) {
        baseAvatarMap.set(name, baseAvatars[index]);
      }
    });

    mainnetValidNames.forEach((name, index) => {
      if (name && mainnetAvatars[index]) {
        mainnetAvatarMap.set(name, mainnetAvatars[index]);
      }
    });

    // Build result object
    const result: Record<
      Address,
      { mainnet: { name: string; avatar: string }; base: { name: string; avatar: string } }
    > = {};

    addresses.forEach((address, index) => {
      const baseName = baseNames[index] || '';
      const mainnetName = mainnetNames[index] || '';

      result[address] = {
        mainnet: {
          name: mainnetName,
          avatar: mainnetName ? mainnetAvatarMap.get(mainnetName) || '' : '',
        },
        base: {
          name: baseName,
          avatar: baseName ? baseAvatarMap.get(baseName) || '' : '',
        },
      };
    });

    return result;
  }

  // Fast name-only fetching for individual components
  static async getNameOnly(address: Address, chain = mainnet): Promise<string> {
    const name = await getName({ address, chain });
    return name || '';
  }

  // Batch name-only fetching using multicall
  static async getNamesOnly(
    addresses: Address[],
    chain = mainnet
  ): Promise<Record<Address, string>> {
    if (!addresses || addresses.length === 0) {
      return {};
    }

    const names = await getNames({ addresses, chain });
    const result: Record<Address, string> = {};

    addresses.forEach((address, index) => {
      result[address] = names[index] || '';
    });

    return result;
  }
}
