import {
  ImportedUserSourceData,
  ParsedUser,
  ParsedUserPersona,
  SessionStatus,
  User,
  UserImportSource,
} from '@/models';

import { Address } from '@getgrowly/persona';

import { PublicDatabaseService } from './database.service';
import { UserPersonaService } from './user-persona.service';

export class UserService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userOrganizationDatabaseService: PublicDatabaseService<'users_organizations'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>,
    private conversationDatabaseService: PublicDatabaseService<'conversation'>,
    private userPersonaService: UserPersonaService
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
    const userOrganizationAssociations = await this.userOrganizationDatabaseService.getAllByFields(
      {
        organization_id,
      },
      undefined,
      {
        field: 'created_at',
        ascending: false,
      }
    );
    const users = await this.userDatabaseService.getManyByIds(
      userOrganizationAssociations.map(association => association.user_id)
    );
    const parsedUsers = await Promise.all(
      users.map(user => {
        try {
          return this.getUserWithPersona(user);
        } catch (error) {
          console.error(error);
          return null;
        }
      })
    );
    return parsedUsers.filter(user => user !== null) as ParsedUser[];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<ParsedUser | null> {
    const users = await this.userDatabaseService.getAll();
    const parsedUser = users.find(user => {
      return (user.entities as { walletAddress: string }).walletAddress === walletAddress;
    });
    if (!parsedUser) return null;
    return this.getUserWithPersona(parsedUser);
  }

  /**
   * Create a user if it doesn't exist. Then update the user persona with the imported source data.
   * @param walletAddress - The wallet address of the user
   * @param importedSourceData - The source data of the user
   * @returns The user and the persona with the imported source data
   */
  async createUserFromAddressIfNotExist(
    walletAddress: string,
    organizationId: string,
    importedSourceData: ImportedUserSourceData = { source: UserImportSource.Native, sourceData: {} }
  ): Promise<{ user: ParsedUser; persona: ParsedUserPersona | null; new: boolean }> {
    const user = await this.getUserByWalletAddress(walletAddress);
    const isNative = importedSourceData.source === UserImportSource.Native;
    const now = new Date().toISOString();
    if (user) {
      // If existing user is native and original_joined_at is not set, set it to now.
      if (isNative && !user.original_joined_at) {
        await this.userDatabaseService.update(user.id, {
          original_joined_at: now,
        });
      }
      return { user, persona: user.personaData, new: false };
    }
    // If user is not found, create a new user and add it to the organization.
    const newUser = await this.userDatabaseService.create({
      entities: {
        walletAddress,
      },
      original_joined_at: isNative ? now : null,
    });
    const existingAssociation = await this.userOrganizationDatabaseService.getOneByFields({
      user_id: newUser.id,
      organization_id: organizationId,
    });
    if (!existingAssociation) {
      // If the user is not associated with the organization, add it to the organization.
      await this.userOrganizationDatabaseService.create({
        user_id: newUser.id,
        organization_id: organizationId,
      });
    }
    // Create a new persona for the user.
    const persona = await this.createUserPersonaIfNotExist(walletAddress);
    const personaWithSource: ParsedUserPersona =
      await this.userPersonaService.updateImportedSourceData(persona.id, importedSourceData);
    return {
      user: this.mapUserWithPersona(newUser, personaWithSource),
      persona: personaWithSource,
      new: true,
    };
  }

  async getUserWithPersona(user: User): Promise<ParsedUser> {
    const walletAddress = (user.entities as { walletAddress: string }).walletAddress as Address;
    const userPersona = await this.createUserPersonaIfNotExist(walletAddress);
    return this.mapUserWithPersona(user, userPersona);
  }

  mapUserWithPersona(user: User, persona: ParsedUserPersona): ParsedUser {
    const walletAddress = (user.entities as { walletAddress: string }).walletAddress as Address;
    return {
      ...user,
      entities: {
        walletAddress,
      },
      personaData: persona,
      offchainData: {
        company: '',
        description: '',
      },
      chatSession: {
        status: SessionStatus.Online,
        unread: false,
      },
    };
  }

  async createUserPersonaIfNotExist(walletAddress: string): Promise<ParsedUserPersona> {
    const userPersona = await this.userPersonaDatabaseService.getById(walletAddress);
    if (userPersona) return userPersona as any as ParsedUserPersona;
    const newUserPersona = await this.userPersonaDatabaseService.create({
      id: walletAddress,
      identities: {},
      activities: {},
      portfolio_snapshots: {},
      imported_source_data: [],
    });
    return newUserPersona as any as ParsedUserPersona;
  }
}
