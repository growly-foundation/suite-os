import type { Address, Chain } from 'viem';

/**
 * Note: exported as public Type
 */
export type AddressProps = {
  /** The Ethereum address to render. */
  address?: Address | null;
  /** Optional className override for top span element. */
  className?: string;
  /** Determines if the displayed address should be sliced. (defaults: true) */
  isSliced?: boolean;
  /** Defaults to true. Optional boolean to disable copy address on click functionality. */
  hasCopyAddressOnClick?: boolean;
};

/**
 * Note: exported as public Type
 */
export type BaseMainnetName = `${string}.base.eth`;

/**
 * Note: exported as public Type
 */
export type Basename = BaseMainnetName | BaseSepoliaName;

/**
 * Note: exported as public Type
 */
export type BaseSepoliaName = `${string}.basetest.eth`;

export type GetSocialsReturnType = {
  /** Twitter handle */
  twitter: string | null;
  /** GitHub username */
  github: string | null;
  /** Farcaster username */
  farcaster: string | null;
  /** Website URL */
  website: string | null;
};

/**
 * Ethereum Attestation Service (EAS) Schema Uid
 * The schema identifier associated with the EAS attestation.
 *
 * Note: exported as public Type
 */
export type EASSchemaUid = `0x${string}`;

/**
 * Ethereum Attestation Service (EAS) Chain Definition
 * The definition of a blockchain chain supported by EAS attestations.
 *
 * Note: exported as public Type
 */
export type EASChainDefinition = {
  /** EAS GraphQL API endpoint */
  easGraphqlAPI: string;
  /** blockchain source id */
  id: number;
  /** Array of EAS Schema UIDs */
  schemaUids: EASSchemaUid[];
};

/**
 * Note: exported as public Type
 */
export type EthBalanceProps = {
  /** Ethereum address */
  address?: Address;
  /** Optional className override */
  className?: string;
};

/**
 * Note: exported as public Type
 */
export type GetAddressParams = {
  /** Name to resolve */
  name: string | Basename;
  /** Optional chain for domain resolution */
  chain?: Chain;
};

/**
 * Note: exported as public Type
 */
export type GetAddressesParams = {
  /** Array of names to resolve addresses for */
  names: Array<string | Basename>;
};

/**
 * Note: exported as public Type
 */
export type GetAddressReturnType = Address | null;

/**
 * Note: exported as public Type
 */
export type GetAttestationsParams = {
  /** Array of schema UIDs to filter by */
  schemas?: EASSchemaUid[];
  /** Filter by revocation status */
  revoked?: boolean;
  /** Filter by expiration time */
  expirationTime?: number;
  /** Limit number of results */
  limit?: number;
};

/**
 * Note: exported as public Type
 */
export type GetAvatarParams = {
  /** The ENS or Basename to fetch the avatar for. */
  ensName: string;
  /** Optional chain for domain resolution */
  chain?: Chain;
};

/**
 * Note: exported as public Type
 */
export type GetAvatarReturnType = string | null;

/**
 * Note: exported as public Type
 */
export type GetAvatarsParams = {
  /** Array of ENS or Basenames to resolve avatars for */
  ensNames: string[];
  /** Optional chain for domain resolution */
  chain?: Chain;
};

/**
 * Note: exported as public Type
 */
export type GetNameParams = {
  /** Ethereum address to resolve */
  address?: Address;
  /** Optional chain for domain resolution */
  chain?: Chain;
};

/**
 * Note: exported as public Type
 */
export type GetNameReturnType = string | Basename | null;

/**
 * Note: exported as public Type
 */
export type GetNamesParams = {
  /** Array of Ethereum addresses to resolve names for */
  addresses: Address[];
  /** Optional chain for domain resolution */
  chain?: Chain;
};

export type ResolverAddressesByChainIdMap = Record<number, Address>;
