import { ParsedUser, SessionStatus, User } from '@/models';
import { Tables } from '@/types/database.types';

import { PublicDatabaseService } from './database.service';

export class UserService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private messageDatabaseService: PublicDatabaseService<'messages'>
  ) {}

  // TODO: Remove this later
  private fillMockData(user: Tables<'users'>): User {
    const walletAddress = (user.entities as { walletAddress: string }).walletAddress as any;
    return {
      ...user,
      ensName: 'admin.eth',
      address: walletAddress,
      company: 'Web3 Support',
      description: 'Blockchain support specialist helping users navigate DeFi and Web3.',
      avatar: '/placeholder.svg?height=40&width=40',
      status: SessionStatus.Online,
      lastMessageTime: user.created_at,
      online: true,
      unread: false,
      stats: {
        totalTransactions: 12450,
        totalVolume: '1,234 ETH',
        nftCount: 89,
        tokenCount: 67,
        daysActive: 1825,
      },
      topTokens: [
        { symbol: 'ETH', balance: '234.5', value: '$469,000', change24h: 2.1 },
        { symbol: 'USDC', balance: '50,000', value: '$50,000', change24h: 0.1 },
        { symbol: 'UNI', balance: '2,500', value: '$17,500', change24h: -0.8 },
      ],
      recentActivity: [
        {
          type: 'receive',
          description: 'Received support payment',
          timestamp: '1 hour ago',
          value: '0.5 ETH',
        },
        { type: 'send', description: 'Helped user with transaction', timestamp: '3 hours ago' },
      ],
      nfts: [
        {
          collection: 'Support Badge',
          name: 'Expert Helper',
          image: '/placeholder.svg?height=60&width=60',
        },
      ],
      reputation: {
        score: 95,
        level: 'Expert',
        badges: ['Support Expert', 'Community Helper', 'Trusted Agent'],
      },
    };
  }

  async getUsersByAgentId(agent_id: string): Promise<ParsedUser[]> {
    const messages = await this.messageDatabaseService.getAllByFields({
      agent_id,
    });
    const visitedUsers = new Set<string>();
    const users: ParsedUser[] = [];
    for (const message of messages) {
      if (!message.user_id) continue;
      if (visitedUsers.has(message.user_id)) continue;
      const user = await this.userDatabaseService.getById(message.user_id);
      if (!user) continue;
      visitedUsers.add(message.user_id);
      users.push(this.fillMockData(user) as ParsedUser);
    }
    return users;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<ParsedUser | null> {
    const users = await this.userDatabaseService.getAll();
    const parsedUser = users.find(user => {
      return (user.entities as { walletAddress: string }).walletAddress === walletAddress;
    });
    if (!parsedUser) return null;
    return this.fillMockData(parsedUser) as ParsedUser;
  }

  async createUserFromAddressIfNotExist(walletAddress: string): Promise<ParsedUser | null> {
    const user = await this.getUserByWalletAddress(walletAddress);
    if (user) return user;
    const newUser = await this.userDatabaseService.create({
      entities: {
        walletAddress,
      },
    });
    return this.fillMockData(newUser) as ParsedUser;
  }
}
