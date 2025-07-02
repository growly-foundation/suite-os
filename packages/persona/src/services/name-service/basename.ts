// source: https://gist.github.com/hughescoin/95b680619d602782396fa954e981adae
import { L2_RESOLVER_ABI } from '@/config/abis';
import { Address, createPublicClient, encodePacked, http, keccak256, namehash } from 'viem';
import { base, mainnet } from 'viem/chains';

export type Basename = `${string}.base.eth`;

export const BASENAME_L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

const baseClient = createPublicClient({
  chain: base,
  transport: http('https://base.llamarpc.com'),
});

// TODO: Viem always fail for now :/
export async function getBasenameAvatar(basename: Basename) {
  try {
    const baseEnsAvatar = await baseClient.getEnsAvatar({
      name: basename,
      universalResolverAddress: BASENAME_L2_RESOLVER_ADDRESS,
    });

    if (baseEnsAvatar) {
      return baseEnsAvatar;
    }
  } catch {
    // This is a best effort attempt, so we don't need to do anything here.
    console.error('Error getting basename avatar for', basename);
    return '';
  }
}

/**
 * Convert an chainId to a coinType hex for reverse chain resolution
 */
export const convertChainIdToCoinType = (chainId: number): string => {
  // L1 resolvers to addr
  if (chainId === mainnet.id) {
    return 'addr';
  }

  const cointype = (0x80000000 | chainId) >>> 0;
  return cointype.toString(16).toLocaleUpperCase();
};

/**
 * Convert an address to a reverse node for ENS resolution
 */
export const convertReverseNodeToBytes = (address: Address, chainId: number) => {
  const addressFormatted = address.toLocaleLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.substring(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(`${chainCoinType.toLocaleUpperCase()}.reverse`);
  const addressReverseNode = keccak256(
    encodePacked(['bytes32', 'bytes32'], [baseReverseNode, addressNode])
  );
  return addressReverseNode;
};

export async function getBasename(address: Address) {
  try {
    const addressReverseNode = convertReverseNodeToBytes(address, base.id);
    const basename = await baseClient.readContract({
      abi: L2_RESOLVER_ABI,
      address: BASENAME_L2_RESOLVER_ADDRESS,
      functionName: 'name',
      args: [addressReverseNode],
    });
    if (basename) {
      return basename as Basename;
    }
  } catch (error) {
    console.error(error);
    return '';
  }
}
