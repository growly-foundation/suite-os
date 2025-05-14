import { Tables } from '@/types/database.types';

export type User = Tables<'users'>;
export type ParsedUser = User & {
  entities: {
    walletAddress: `0x${string}`;
  };
};
