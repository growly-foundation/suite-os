import { User as PrivyUser } from '@privy-io/server-auth';

export enum UserImportSource {
  Privy = 'privy',
  Guildxyz = 'guildxyz',
  Contract = 'contract',
  Manual = 'manual',
}

export type ImportUserOutput<T = Record<string, any>> = {
  walletAddress?: string;
  email?: string;
  name?: string;
  extra?: T;
  source: UserImportSource;
};

export type ImportPrivyUserOutput = ImportUserOutput<PrivyUser>;
