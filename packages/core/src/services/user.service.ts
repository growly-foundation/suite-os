import {
  ImportedUserSourceData,
  ParsedUser,
  ParsedUserPersona,
  SessionStatus,
  User,
  UserImportSource,
} from '@/models';
import { normalizeWalletAddress } from '@/utils/wallet';

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

  async deleteUsers(userIds: string[]): Promise<void> {
    await this.userDatabaseService.deleteManyByIds(userIds);
    await this.userPersonaDatabaseService.deleteManyByIds(userIds);
  }

  async getUsersByAgentId(
    agent_id: string,
    limit?: number,
    offset?: number
  ): Promise<ParsedUser[]> {
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

    // Get unique user IDs from conversations
    const uniqueUserIds = [
      ...new Set(conversations.map(c => c.user_id).filter((id): id is string => Boolean(id))),
    ];

    // Apply pagination to unique user IDs
    const paginatedUserIds = offset
      ? uniqueUserIds.slice(offset, offset + (limit || uniqueUserIds.length))
      : limit
        ? uniqueUserIds.slice(0, limit)
        : uniqueUserIds;

    const users: ParsedUser[] = [];
    for (const userId of paginatedUserIds) {
      const user = await this.getUserById(userId);
      if (!user) continue;
      const parsedUser = await this.getUserWithPersona(user);
      users.push(parsedUser);
    }
    return users;
  }

  async getUsersByOrganizationIdCount(organization_id: string): Promise<number> {
    const userOrganizationAssociations = await this.userOrganizationDatabaseService.getAllByFields({
      organization_id,
    });
    return userOrganizationAssociations.length;
  }

  async getUsersByAgentIdCount(agent_id: string): Promise<number> {
    const conversations = await this.conversationDatabaseService.getAllByFields({
      agent_id,
    });
    // Count unique users from conversations
    const uniqueUserIds = [
      ...new Set(conversations.map(c => c.user_id).filter((id): id is string => Boolean(id))),
    ];
    return uniqueUserIds.length;
  }

  async getUserById(user_id: string): Promise<ParsedUser | null> {
    const user = await this.userDatabaseService.getById(user_id);
    if (!user) return null;
    return this.getUserWithPersona(user);
  }

  async getUsersByOrganizationId(
    organization_id: string,
    limit?: number,
    offset?: number
  ): Promise<ParsedUser[]> {
    // First, get all user-organization associations with pagination
    const userOrganizationAssociations = await this.userOrganizationDatabaseService.getAllByFields(
      {
        organization_id,
      },
      limit ? limit + (offset || 0) : undefined, // Get enough records to handle offset
      {
        field: 'created_at',
        ascending: false,
      }
    );

    // Apply client-side offset if needed (since database service doesn't support offset directly)
    const paginatedAssociations = offset
      ? userOrganizationAssociations.slice(
          offset,
          offset + (limit || userOrganizationAssociations.length)
        )
      : limit
        ? userOrganizationAssociations.slice(0, limit)
        : userOrganizationAssociations;

    if (paginatedAssociations.length === 0) {
      return [];
    }

    const users = await this.userDatabaseService.getManyByIds(
      paginatedAssociations.map(association => association.user_id)
    );
    return await Promise.all(users.map(user => this.getUserWithPersona(user)));
  }

  async getUserByWalletAddress(walletAddress: string): Promise<ParsedUser | null> {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    const users = await this.userDatabaseService.getAll();
    const parsedUser = users.find(user => {
      const userWalletAddress = (user.entities as { walletAddress: string }).walletAddress;
      return normalizeWalletAddress(userWalletAddress) === normalizedWalletAddress;
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
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    const user = await this.getUserByWalletAddress(normalizedWalletAddress);
    const isNative = importedSourceData.source === UserImportSource.Native;
    const now = new Date().toISOString();
    if (user) {
      // If existing user is native and original_joined_at is not set, set it to now.
      if (isNative && !user.original_joined_at) {
        const updatedUser = await this.userDatabaseService.update(user.id, {
          original_joined_at: now,
        });
        return { user: updatedUser as any as ParsedUser, persona: user.personaData, new: false };
      }
      return { user, persona: user.personaData, new: false };
    }
    // If user is not found, create a new user and add it to the organization.
    const newUser = await this.userDatabaseService.create({
      entities: {
        walletAddress: normalizedWalletAddress,
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
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    const userPersona = await this.createUserPersonaIfNotExist(normalizedWalletAddress);
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
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    try {
      const userPersona = await this.userPersonaDatabaseService.getById(normalizedWalletAddress);
      return userPersona as any as ParsedUserPersona;
    } catch (error) {
      const newUserPersona = await this.userPersonaDatabaseService.create({
        id: normalizedWalletAddress,
        identities: {},
        activities: {},
        portfolio_snapshots: {},
        imported_source_data: [],
      });
      return newUserPersona as any as ParsedUserPersona;
    }
  }
}
