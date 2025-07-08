import axios from 'axios';

import { ParsedUser } from '@getgrowly/core';

import { ContractUser, SmartContract } from './contract-user.service';
import { Guild, GuildMember } from './guildxyz.service';
import { PrivyUser } from './privy.service';

export type ImportSource = 'privy' | 'guildxyz' | 'contract';

/**
 * Service for handling user imports from external sources
 */
export const UserImportService = {
  /**
   * Import a user from Privy
   * Sends the Privy user data to the server-side API endpoint
   */
  async importPrivyUser(privyUser: PrivyUser): Promise<ParsedUser | null> {
    try {
      const response = await axios.post('/api/users/import-privy', {
        privyUser,
      });

      if (response.data?.success && response.data?.user) {
        return response.data.user as ParsedUser;
      }

      return null;
    } catch (error) {
      console.error('Error importing Privy user:', error);
      throw new Error(
        `Failed to import Privy user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Import a user from GuildXYZ
   * Sends the Guild member data to the server-side API endpoint
   */
  async importGuildMember(member: GuildMember, guild: Guild): Promise<ParsedUser | null> {
    try {
      const response = await axios.post('/api/users/import-guild', {
        member,
        guild,
      });

      if (response.data?.success && response.data?.user) {
        return response.data.user as ParsedUser;
      }

      return null;
    } catch (error) {
      console.error('Error importing Guild member:', error);
      throw new Error(
        `Failed to import Guild member: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Import a user from a smart contract
   * Sends the contract user data to the server-side API endpoint
   */
  async importContractUser(
    user: ContractUser,
    contract: SmartContract
  ): Promise<ParsedUser | null> {
    try {
      const response = await axios.post('/api/users/import-contract', {
        user,
        contract,
      });

      if (response.data?.success && response.data?.user) {
        return response.data.user as ParsedUser;
      }

      return null;
    } catch (error) {
      console.error('Error importing contract user:', error);
      throw new Error(
        `Failed to import contract user: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Import multiple users in batch
   * @param source The source of the import (privy, guildxyz, contract)
   * @param users The users to import
   * @param sourceInfo Additional info needed for import (guild or contract details)
   */
  async importBatch<T>(
    source: ImportSource,
    users: T[],
    sourceInfo?: any
  ): Promise<{ success: ParsedUser[]; failed: T[] }> {
    const results = {
      success: [] as ParsedUser[],
      failed: [] as T[],
    };

    for (const user of users) {
      try {
        let importedUser: ParsedUser | null = null;

        switch (source) {
          case 'privy':
            importedUser = await this.importPrivyUser(user as unknown as PrivyUser);
            break;
          case 'guildxyz':
            if (!sourceInfo) throw new Error('Guild information required for guild import');
            importedUser = await this.importGuildMember(user as unknown as GuildMember, sourceInfo);
            break;
          case 'contract':
            if (!sourceInfo) throw new Error('Contract information required for contract import');
            importedUser = await this.importContractUser(
              user as unknown as ContractUser,
              sourceInfo
            );
            break;
        }

        if (importedUser) {
          results.success.push(importedUser);
        } else {
          results.failed.push(user);
        }
      } catch (error) {
        console.error(`Error importing ${source} user:`, error);
        results.failed.push(user);
      }
    }

    return results;
  },
};
