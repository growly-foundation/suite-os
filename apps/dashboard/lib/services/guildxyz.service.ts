import { ParsedUser } from '@getgrowly/core';
import { Address, GuildXyzClientService } from '@getgrowly/persona';

export interface GuildMember {
  id: string;
  address: string;
  name?: string;
  roles: Array<{
    id: number;
    name: string;
  }>;
}

export interface Guild {
  id: number;
  name: string;
  urlName: string;
  imageUrl?: string;
  description?: string;
  memberCount?: number;
}

/**
 * Service for interacting with Guild XYZ API
 * Provides methods to fetch guilds, members, and import users from Guild XYZ
 */
export class GuildXyzService {
  private readonly guildClient: GuildXyzClientService;

  constructor() {
    this.guildClient = new GuildXyzClientService();
  }

  /**
   * Get guild details by ID or URL name
   */
  async getGuild(guildIdOrUrlName: number | string): Promise<Guild | null> {
    try {
      const guild = await this.guildClient.fetchGuild(guildIdOrUrlName);
      if (!guild) return null;

      return {
        id: guild.id,
        name: guild.name,
        urlName: guild.urlName,
        imageUrl: guild.imageUrl,
        description: guild.description,
        memberCount: guild.memberCount,
      };
    } catch (error) {
      console.error('Failed to fetch guild:', error);
      return null;
    }
  }

  /**
   * Search for guilds by name
   */
  async searchGuilds(query: string): Promise<Guild[]> {
    try {
      // This is a placeholder since the persona library might not expose this directly
      // In a real implementation, you would call the search endpoint or filter fetched guilds
      const guilds = await this.guildClient.fetchGuilds([]);

      return guilds
        .filter(
          guild =>
            guild.name.toLowerCase().includes(query.toLowerCase()) ||
            guild.urlName.toLowerCase().includes(query.toLowerCase())
        )
        .map(guild => ({
          id: guild.id,
          name: guild.name,
          urlName: guild.urlName,
          imageUrl: guild.imageUrl,
          description: guild.description,
          memberCount: guild.memberCount,
        }));
    } catch (error) {
      console.error('Failed to search guilds:', error);
      return [];
    }
  }

  /**
   * Get members of a specific guild
   */
  async getGuildMembers(guildId: number | string): Promise<GuildMember[]> {
    try {
      // This would require a specific API call to get all members
      // This is a placeholder implementation
      // In a real implementation, you would call the appropriate endpoint

      // Simulating fetching guild members
      const members: GuildMember[] = [];
      // Implementation would depend on the actual API

      return members;
    } catch (error) {
      console.error('Failed to fetch guild members:', error);
      return [];
    }
  }

  /**
   * Convert a Guild XYZ member to app user format
   */
  convertGuildMemberToAppUser(member: GuildMember, guildInfo: Guild): Partial<ParsedUser> {
    return {
      name: member.name || `Guild Member ${member.address.substring(0, 8)}`,

      // Basic user information in offchainData
      offchainData: {
        description: `Member of ${guildInfo.name} Guild`,
        source: 'guildxyz',
        sourceId: member.id,
        importedAt: new Date().toISOString(),
        sourceData: {
          address: member.address,
          guildId: guildInfo.id,
          guildName: guildInfo.name,
          roles: member.roles,
        },
      },

      // If wallet address available, include it for wallet linking
      onchainData: {
        id: member.address,
        // Add other required fields with placeholder values
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any, // Type assertion to bypass strict checking
    };
  }

  /**
   * Import a guild member as a user
   */
  async importGuildMember(member: GuildMember, guildInfo: Guild): Promise<ParsedUser | null> {
    try {
      const userData = this.convertGuildMemberToAppUser(member, guildInfo);

      // Here you would typically:
      // 1. Check if user already exists (by wallet address)
      // 2. Create or update the user in your database
      // 3. Return the created/updated user

      // Placeholder for API call
      // const response = await fetch('/api/users/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userData }),
      // });
      // return await response.json();

      return {
        id: `imported-${member.id}`,
        ...userData,
        // Add other required ParsedUser fields here
      } as unknown as ParsedUser;
    } catch (error) {
      console.error('Failed to import guild member:', error);
      return null;
    }
  }
}
