import { User as PrivyUser } from '@privy-io/server-auth';

export enum UserImportSource {
  Native = 'native',
  Privy = 'privy_import',
  Guildxyz = 'guild_import',
  Contract = 'contract_import',
  NftHolders = 'nft_holders_import',
  Manual = 'manual_import',
}
export interface ContractInteractionMetadata {
  contractAddress: string;
  chainId: number;
  transactionCount?: number;
  firstInteraction?: string;
  lastInteraction?: string;
}

export interface NftHoldersMetadata {
  contractAddress: string;
  chainId: number;
  tokenBalances: { tokenId: string; balance: number }[];
  totalTokensOwned: number;
  uniqueTokensOwned: number;
}

export type ImportUserOutput<T = Record<string, any>> = {
  walletAddress?: string;
  email?: string;
  name?: string;
  extra?: T;
  source: UserImportSource;
  imported?: boolean;
};

export type ImportPrivyUserOutput = ImportUserOutput<PrivyUser>;

export type ImportContractUserOutput = ImportUserOutput<ContractInteractionMetadata>;

export type ImportNftHoldersOutput = ImportUserOutput<NftHoldersMetadata>;

export type ImportedUserSourceData =
  | {
      source: UserImportSource;
      sourceData: Record<string, unknown>; // Explicitly empty object
    }
  | ImportedPrivyUserSourceData
  | ImportedContractUserSourceData
  | ImportedNftHoldersSourceData;

export type ImportedPrivyUserSourceData = {
  source: UserImportSource.Privy;
  sourceData: PrivyUser;
};

export type ImportedContractUserSourceData = {
  source: UserImportSource.Contract;
  sourceData: ContractInteractionMetadata;
};

export type ImportedNftHoldersSourceData = {
  source: UserImportSource.NftHolders;
  sourceData: NftHoldersMetadata;
};
