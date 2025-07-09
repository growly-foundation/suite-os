import { User as PrivyUser } from '@privy-io/server-auth';

export enum UserImportSource {
  Privy = 'privy',
  Guildxyz = 'guildxyz',
  Contract = 'contract',
  Csv = 'csv',
}

export type ImportUserOutput<T = Record<string, any>> = {
  walletAddress?: string;
  email?: string;
  name?: string;
  extra?: T;
};

export type ImportPrivyUserOutput = ImportUserOutput<PrivyUser>;
