import { Tables } from '@/types/database.types';

export type User = Tables<'users'> & UserOnchainData & UserOffchainData & UserChatSession;

export type ParsedUser = User & {
  // TODO: Need to be associated table.
  entities: {
    walletAddress: `0x${string}`;
  };
};

// TODO: Need to be fields in the database
export enum SessionStatus {
  Online = 'Online',
  Offline = 'Offline',
}

export type UserOnchainStats = {
  stats: {
    totalTransactions: number;
    totalVolume: number;
    nftCount: number;
    tokenCount: number;
    daysActive: number;
  };
  tokens: Array<{
    symbol: string;
    balance: number;
    value: number;
    change24h: number;
  }>;
  recentActivity: Array<{
    type: 'send' | 'receive' | 'swap' | 'vote';
    description: string;
    timestamp: string;
    value?: number;
  }>;
  nfts: Array<{
    collection: string;
    name: string;
    image: string;
  }>;
  reputation: {
    score: number;
    level: string;
    badges: string[];
  };
};

export type UserOnchainData = {
  ensName?: string;
  address: `0x${string}`;
  avatar?: string;
} & UserOnchainStats;

export type UserOffchainData = {
  company: string;
  description: string;
};

export type UserChatSession = {
  status: SessionStatus;
  lastMessageTime: string;
  online: boolean;
  unread: boolean;
};
