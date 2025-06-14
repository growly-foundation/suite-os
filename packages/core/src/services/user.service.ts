import { ParsedUser, SessionStatus, User } from '@/models';
import { Tables } from '@/types/database.types';

import { PublicDatabaseService } from './database.service';

export class UserService {
  constructor(
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private userDatabaseService: PublicDatabaseService<'users'>,
    private conversationDatabaseService: PublicDatabaseService<'conversation'>
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
      avatar: undefined,
      status: SessionStatus.Online,
      lastMessageTime: user.created_at,
      online: true,
      unread: false,
      stats: {
        totalTransactions: 12450,
        totalVolume: 1234,
        nftCount: 89,
        tokenCount: 67,
        daysActive: 1825,
      },
      tokens: [
        { symbol: 'ETH', balance: 234.5, value: 469000, change24h: 2.1 },
        { symbol: 'USDC', balance: 50000, value: 50000, change24h: 0.1 },
        { symbol: 'UNI', balance: 2500, value: 17500, change24h: -0.8 },
      ],
      recentActivity: [
        {
          type: 'receive',
          description: 'Received support payment',
          timestamp: '1 hour ago',
          value: 0.5,
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
    const conversations = await this.conversationDatabaseService.getAllByFields(
      {
        agent_id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
    const users: ParsedUser[] = [];
    for (const conversation of conversations) {
      if (!conversation.user_id) continue;
      const user = await this.getUserById(conversation.user_id);
      if (!user) continue;
      users.push(user);
    }
    return users;
  }

  async getUserById(agent_id: string): Promise<ParsedUser | null> {
    const user = await this.userDatabaseService.getById(agent_id);
    if (!user) return null;
    return this.fillMockData(user) as ParsedUser;
  }

  async getUsersByOrganizationId(organization_id: string): Promise<ParsedUser[]> {
    const agents = await this.agentDatabaseService.getAllByFields({
      organization_id,
    });
    const conversations = await this.conversationDatabaseService.getManyByFields(
      'agent_id',
      agents.map(agent => agent.id)
    );
    const users: ParsedUser[] = await this.userDatabaseService
      .getManyByIds(
        conversations
          .filter(conversation => conversation.user_id)
          .map(conversation => conversation.user_id!)
      )
      .then(users => users.map(user => this.fillMockData(user) as ParsedUser));
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
