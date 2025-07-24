import { User as PrivyUser } from '@privy-io/server-auth';

export enum UserImportSource {
  Native = 'native',
  Privy = 'privy_import',
  Guildxyz = 'guild_import',
  Contract = 'contract_import',
  Manual = 'manual_import',
}
export interface ContractInteractionMetadata {
  contractAddress: string;
  chainId: number;
  transactionCount?: number;
  firstInteraction?: string;
  lastInteraction?: string;
}

export type ImportUserOutput<T = Record<string, any>> = {
  walletAddress?: string;
  email?: string;
  name?: string;
  extra?: T;
  source: UserImportSource;
};

export type ImportPrivyUserOutput = ImportUserOutput<PrivyUser>;

export type ImportContractUserOutput = ImportUserOutput<ContractInteractionMetadata>;

export type ImportedUserSourceData =
  | {
      source: UserImportSource;
      sourceData: Record<string, unknown>; // Explicitly empty object
    }
  | ImportedPrivyUserSourceData
  | ImportedContractUserSourceData;

export type ImportedPrivyUserSourceData = {
  source: UserImportSource.Privy;
  sourceData: PrivyUser;
};

export type ImportedContractUserSourceData = {
  source: UserImportSource.Contract;
  sourceData: ContractInteractionMetadata;
};
