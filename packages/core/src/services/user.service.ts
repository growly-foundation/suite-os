import { ParsedUser, ParsedUserPersona, SessionStatus, User, UserChatSession } from '@/models';

import { Address } from '@getgrowly/persona';

import { PublicDatabaseService } from './database.service';

export class UserService {
  constructor(
    private agentDatabaseService: PublicDatabaseService<'agents'>,
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>,
    private conversationDatabaseService: PublicDatabaseService<'conversation'>,
    private messageDatabaseService: PublicDatabaseService<'messages'>
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
    const lastConversation = await this.getLastConversation(user.id);

    return {
      ...user,
      entities: {
        walletAddress,
      },
      onchainData: userPersona,
      offchainData: {
        company: '',
        description: '',
      },
      chatSession: {
        status: SessionStatus.Online,
        lastConversation,
        unread: false,
      },
    };
  }

  async getLastConversation(
    user_id: string
  ): Promise<UserChatSession['lastConversation'] | undefined> {
    try {
      const message = await this.messageDatabaseService.getOneByFields(
        {
          sender_id: user_id,
        },
        {
          field: 'created_at',
          ascending: false,
        }
      );
      if (!message || !message.conversation_id) return undefined;
      const lastAgentId = await this.conversationDatabaseService.getOneByFields({
        id: message.conversation_id,
      });
      if (!lastAgentId || !lastAgentId.agent_id) return undefined;
      const agent = await this.agentDatabaseService.getById(lastAgentId.agent_id);
      if (!agent) return undefined;
      return {
        conversationId: message.conversation_id,
        agentId: agent.id,
        messageId: message.id,
      };
    } catch (error) {
      console.log(`Error getting last conversation of ${user_id}:`, error);
      return undefined;
    }
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
