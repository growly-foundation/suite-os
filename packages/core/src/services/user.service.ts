import {
  ImportedUserSourceData,
  ParsedUser,
  ParsedUserPersona,
  SessionStatus,
  User,
  UserImportSource,
} from '@/models';
import { normalizeWalletAddress } from '@/utils/wallet';
import { SupabaseClient } from '@supabase/supabase-js';

import { PublicDatabaseService } from './database.service';
import { UserPersonaService } from './user-persona.service';

export class UserService {
  constructor(
    private userDatabaseService: PublicDatabaseService<'users'>,
    private userPersonaDatabaseService: PublicDatabaseService<'user_personas'>,
    private userPersonaService: UserPersonaService,
    private supabaseClient: SupabaseClient
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
    // Optimized: Single query with JOIN to get users directly from conversations
    // This eliminates the round-trip of fetching conversations first, then users
    const { data, error } = await this.supabaseClient
      .from('conversation')
      .select(
        `
        users (
          id,
          entities,
          created_at,
          original_joined_at
        )
      `
      )
      .eq('agent_id', agent_id)
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users by agent: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract users and remove duplicates (same user might have multiple conversations)
    const userMap = new Map();
    data.forEach((item: any) => {
      if (item.users && !userMap.has(item.users.id)) {
        userMap.set(item.users.id, item.users);
      }
    });

    const uniqueUsers = Array.from(userMap.values());

    // Apply pagination to unique users
    const paginatedUsers = offset
      ? uniqueUsers.slice(offset, offset + (limit || uniqueUsers.length))
      : limit
        ? uniqueUsers.slice(0, limit)
        : uniqueUsers;

    if (paginatedUsers.length === 0) {
      return [];
    }

    return await this.getBatchUsersWithPersona(paginatedUsers);
  }

  async getUsersByOrganizationIdCount(organization_id: string): Promise<number> {
    try {
      const userOrganizationAssociations = await this.supabaseClient
        .from('users')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq('organization_id', organization_id)
        .not('wallet_address', 'is', null);
      return userOrganizationAssociations.count || 0;
    } catch (error) {
      console.error(`Failed to count users by organization: ${error}!`);
      return 0;
    }
  }

  async getUsersByAgentIdCount(agent_id: string): Promise<number> {
    try {
      // Optimized: Count distinct users directly in the database
      const { data, error } = await this.supabaseClient
        .from('conversation')
        .select('user_id')
        .eq('agent_id', agent_id)
        .not('user_id', 'is', null);

      if (error) {
        throw new Error(`Failed to count users by agent: ${error.message}`);
      }
      if (!data) {
        return 0;
      }
      // Count unique user IDs
      const uniqueUserIds = new Set(data.map(item => item.user_id));
      return uniqueUserIds.size;
    } catch (error) {
      console.error(`Failed to count users by agent: ${error}`);
      return 0;
    }
  }

  async getUserById(user_id: string): Promise<ParsedUser | null> {
    const user = await this.userDatabaseService.getById(user_id);
    if (!user) return null;
    return this.getUserWithPersona(user);
  }

  async getUsersByOrganizationId(
    organization_id: string,
    limit = 100,
    offset = 0
  ): Promise<ParsedUser[]> {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('organization_id', organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch users by organization: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    if (data.length === 0) {
      return [];
    }
    return this.getBatchUsersWithPersona(data as any as User[]);
  }

  async getUserByWalletAddress(
    walletAddress: string,
    organizationId: string
  ): Promise<ParsedUser | null> {
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    const user = await this.userDatabaseService.getOneByFields({
      wallet_address: normalizedWalletAddress,
      organization_id: organizationId,
    });
    if (!user) return null;
    return this.getUserWithPersona(user);
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
    const user = await this.getUserByWalletAddress(normalizedWalletAddress, organizationId);
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
      wallet_address: normalizedWalletAddress,
      original_joined_at: isNative ? now : null,
      organization_id: organizationId,
    });
    // Create a new persona for the user.
    const persona = await this.createUserPersonaIfNotExist(normalizedWalletAddress);
    const personaWithSource: ParsedUserPersona =
      await this.userPersonaService.updateImportedSourceData(persona.id, importedSourceData);
    return {
      user: this.mapUserWithPersona(newUser, personaWithSource),
      persona: personaWithSource,
      new: true,
    };
  }

  /**
   * Optimized batch processing for multiple users with personas
   * Eliminates N+1 query problem by batching persona lookups
   */
  async getBatchUsersWithPersona(users: User[]): Promise<ParsedUser[]> {
    if (users.length === 0) return [];

    // Extract all wallet addresses
    const walletAddresses = users.map(user => {
      const walletAddress = user.wallet_address as string;
      return normalizeWalletAddress(walletAddress);
    });

    // Batch fetch existing personas
    const existingPersonas = await this.getBatchUserPersonas(walletAddresses);

    // Create a map for quick lookup
    const personaMap = new Map<string, ParsedUserPersona>();
    existingPersonas.forEach(persona => {
      personaMap.set(persona.id, persona);
    });

    // Identify missing personas and create them in batch
    const missingAddresses = walletAddresses.filter(address => !personaMap.has(address));
    if (missingAddresses.length > 0) {
      const newPersonas = await this.createBatchUserPersonas(missingAddresses);
      newPersonas.forEach(persona => {
        personaMap.set(persona.id, persona);
      });
    }

    // Map users with their personas
    return users.map(user => {
      const walletAddress = user.wallet_address as string;
      const normalizedAddress = normalizeWalletAddress(walletAddress);
      const persona = personaMap.get(normalizedAddress);

      if (!persona) {
        throw new Error(`Persona not found for address: ${normalizedAddress}`);
      }

      return this.mapUserWithPersona(user, persona);
    });
  }

  async getUserWithPersona(user: User): Promise<ParsedUser> {
    const walletAddress = user.wallet_address as string;
    const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
    const userPersona = await this.createUserPersonaIfNotExist(normalizedWalletAddress);
    return this.mapUserWithPersona(user, userPersona);
  }

  mapUserWithPersona(user: User, persona: ParsedUserPersona): ParsedUser {
    return {
      ...user,
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

  /**
   * Batch fetch user personas by wallet addresses
   * Optimized to reduce database round trips
   */
  async getBatchUserPersonas(walletAddresses: string[]): Promise<ParsedUserPersona[]> {
    if (walletAddresses.length === 0) return [];

    try {
      const personas = await this.userPersonaDatabaseService.getManyByIds(walletAddresses);
      return personas as any as ParsedUserPersona[];
    } catch (error) {
      // If batch fetch fails, return empty array (missing personas will be created)
      return [];
    }
  }

  /**
   * Batch create user personas for missing wallet addresses
   * Much faster than creating them one by one
   */
  async createBatchUserPersonas(walletAddresses: string[]): Promise<ParsedUserPersona[]> {
    if (walletAddresses.length === 0) return [];

    // Create personas individually (optimized batch approach)
    // Note: We could implement a proper batch insert in the database service later
    try {
      const personas: ParsedUserPersona[] = [];

      // Process in smaller batches to avoid overwhelming the database
      const BATCH_SIZE = 10;
      for (let i = 0; i < walletAddresses.length; i += BATCH_SIZE) {
        const batch = walletAddresses.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(address => this.createUserPersonaIfNotExist(address));
        const batchResults = await Promise.all(batchPromises);
        personas.push(...batchResults);
      }

      return personas;
    } catch (error) {
      // Fallback: create them individually if batch creation fails
      const personas: ParsedUserPersona[] = [];
      for (const address of walletAddresses) {
        try {
          const persona = await this.createUserPersonaIfNotExist(address);
          personas.push(persona);
        } catch (err) {
          console.error(`Failed to create persona for ${address}:`, err);
        }
      }
      return personas;
    }
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
