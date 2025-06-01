// TODO: Moved to core later
export interface User {
  id: string;
  ensName: string;
  address: string;
  company: string;
  bio: string;
  joinedDate: string;
  avatar: string;
  status: string;
  lastMessageTime: string;
  online: boolean;
  unread: boolean;
  stats: {
    totalTransactions: number;
    totalVolume: string;
    nftCount: number;
    tokenCount: number;
    daysActive: number;
  };
  topTokens: Array<{
    symbol: string;
    balance: string;
    value: string;
    change24h: number;
  }>;
  recentActivity: Array<{
    type: 'send' | 'receive' | 'swap' | 'vote';
    description: string;
    timestamp: string;
    value?: string;
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
}
