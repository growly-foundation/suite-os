import { User as PrivyUser } from '@privy-io/server-auth';

export enum UserImportSource {
  Native = 'native',
  Privy = 'privy_import',
  Guildxyz = 'guild_import',
  Contract = 'contract_import',
  Manual = 'manual_import',
}
export interface ContractUser {
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

export type ImportContractUserOutput = ImportUserOutput<ContractUser>;

export type ImportedUserSourceData =
  | {
      source: UserImportSource;
      sourceData: {};
    }
  | ImportedPrivyUserSourceData
  | ImportedContractUserSourceData;

export type ImportedPrivyUserSourceData = {
  source: UserImportSource.Privy;
  sourceData: PrivyUser;
};

export type ImportedContractUserSourceData = {
  source: UserImportSource.Contract;
  sourceData: ContractUser;
};
