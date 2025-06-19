import { ParsedUser, ParsedUserPersona, SessionStatus, User } from '@/models';

import { Address } from '@getgrowly/persona';

import { PublicDatabaseService } from './database.service';

export class UserService {
  constructor(
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>,
    private conversationDatabaseService: PublicDatabaseService<'conversation'>
  ) {}

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
      const parsedUser = await this.getUserWithPersona(user);
      users.push(parsedUser);
    }
    return users;
  }

  async getUserById(user_id: string): Promise<ParsedUser | null> {
    const user = await this.userDatabaseService.getById(user_id);
    if (!user) return null;
    return this.getUserWithPersona(user);
  }

  async getUsersByOrganizationId(organization_id: string): Promise<ParsedUser[]> {
    const agents = await this.agentDatabaseService.getAllByFields({
      organization_id,
    });
    const conversations = await this.conversationDatabaseService.getManyByFields(
      'agent_id',
      agents.map(agent => agent.id)
    );
    const users = await this.userDatabaseService
      .getManyByIds(
        conversations
          .filter(conversation => conversation.user_id)
          .map(conversation => conversation.user_id!)
      )
      .then(users => users.map(user => this.getUserWithPersona(user)));
    return await Promise.all(users);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<ParsedUser | null> {
    const users = await this.userDatabaseService.getAll();
    const parsedUser = users.find(user => {
      return (user.entities as { walletAddress: string }).walletAddress === walletAddress;
    });
    if (!parsedUser) return null;
    return this.getUserWithPersona(parsedUser);
  }

  async createUserFromAddressIfNotExist(
    walletAddress: string
  ): Promise<{ user: ParsedUser | null; new: boolean }> {
    const user = await this.getUserByWalletAddress(walletAddress);
    if (user) return { user, new: false };
    const newUser = await this.userDatabaseService.create({
      entities: {
        walletAddress,
      },
    });
    await this.createUserPersonaIfNotExist(walletAddress);
    const userWithPersona = await this.getUserWithPersona(newUser);
    return {
      user: userWithPersona,
      new: true,
    };
  }

  async getUserWithPersona(user: User): Promise<ParsedUser> {
    const walletAddress = (user.entities as { walletAddress: string }).walletAddress as Address;
    const userPersona = await this.createUserPersonaIfNotExist(walletAddress);
    return {
      ...user,
      entities: {
        walletAddress,
      },
      onchainData: {
        ensName: 'admin.eth',
        avatar: undefined,
        ...userPersona,
      },
      offchainData: {
        company: 'Web3 Support',
        description: 'Blockchain support specialist helping users navigate DeFi and Web3.',
      },
      chatSession: {
        status: SessionStatus.Online,
        lastMessageTime: user.created_at,
        online: true,
        unread: false,
      },
    };
  }

  async createUserPersonaIfNotExist(walletAddress: string): Promise<ParsedUserPersona> {
    const userPersona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (userPersona) return userPersona as ParsedUserPersona;
    const newUserPersona = await this.userPersonaDatabaseService.create({
      id: walletAddress,
      identities: {},
      activities: {},
      portfolio_snapshots: {},
    });
    return newUserPersona as ParsedUserPersona;
  }
}
