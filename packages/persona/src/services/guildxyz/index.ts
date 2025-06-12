import { Address } from '@/types';
import { GuildMembershipData, GuildRoleData, WalletGuildData } from '@/types/guild';
import { GuildClient, createGuildClient } from '@guildxyz/sdk';
import {
  Guild,
  GuildReward,
  LeaderboardItem,
  MembershipResult,
  PublicUserProfile,
  Requirement,
  Role,
  RoleReward,
} from '@guildxyz/types';

export class GuildXyzClientService {
  private readonly guildClient: GuildClient;

  constructor() {
    this.guildClient = createGuildClient('@getgrowly/persona');
  }

  async fetchGuild(guildIdOrUrlName: number | string): Promise<Guild | undefined> {
    return this.guildClient.guild.get(guildIdOrUrlName);
  }

  async fetchGuilds(guildIds: number[]): Promise<Guild[]> {
    return this.guildClient.guild.getMany(guildIds);
  }

  async fetchRoleName(guildId: number, roleId: number): Promise<Role | undefined> {
    return this.guildClient.guild.role.get(guildId, roleId) as any;
  }

  async fetchRoleNames(guildId: number): Promise<Role[]> {
    return this.guildClient.guild.role.getAll(guildId) as any;
  }

  async fetchRoleRewards(guildId: number, roleId: number): Promise<RoleReward[]> {
    return this.guildClient.guild.role.reward.getAll(guildId, roleId) as any;
  }

  async fetchRoleRequirements(guildId: number, roleId: number): Promise<Requirement[]> {
    return this.guildClient.guild.role.requirement.getAll(guildId, roleId) as any;
  }

  async fetchGuildRewards(guildId: number): Promise<GuildReward[]> {
    return this.guildClient.guild.reward.getAll(guildId) as any;
  }

  async fetchUserProfile(address: Address): Promise<PublicUserProfile | undefined> {
    return this.guildClient.user.getProfile(address);
  }

  async fetchUserMembership(address: Address): Promise<MembershipResult[]> {
    return this.guildClient.user.getMemberships(address);
  }

  async fetchUserGuildMembership(
    address: Address,
    guildId: number
  ): Promise<MembershipResult | undefined> {
    const memberships = await this.fetchUserMembership(address);
    return memberships.find(item => item.guildId === guildId);
  }

  async fetchRankInGuild(
    address: Address,
    guildId: number,
    guildPlatformId: number
  ): Promise<LeaderboardItem> {
    return this.guildClient.user.getRankInGuild(address, guildId, guildPlatformId);
  }
}

export class GuildXyzService extends GuildXyzClientService {
  constructor() {
    super();
  }

  async getAggregatedWalletData(walletAddress: Address): Promise<WalletGuildData> {
    // Fetch user profile
    const profile = await this.fetchUserProfile(walletAddress);
    if (!profile) throw new Error('Profile not found');

    const membershipData: Record<number, GuildMembershipData> = {};
    // Fetch all guild memberships for the address
    const memberships = await this.fetchUserMembership(walletAddress);
    for (const membership of memberships) {
      const guildMembershipData = await this.getGuildMembershipData(
        walletAddress,
        membership.guildId
      );
      membershipData[membership.guildId] = guildMembershipData;
    }
    return {
      profile,
      membershipData,
    };
  }

  async getGuildRoleData(guildId: number): Promise<Record<number, GuildRoleData>> {
    const roles = await this.fetchRoleNames(guildId);
    const roleData: Record<number, GuildRoleData> = {};
    for (const role of roles) {
      const rewards = await this.fetchRoleRewards(guildId, role.id);
      const requirements = await this.fetchRoleRequirements(guildId, role.id);
      roleData[role.id] = {
        rewards,
        requirements,
        role,
      };
    }
    return roleData;
  }

  async getGuildMembershipData(
    walletAddress: Address,
    guildId: number
  ): Promise<GuildMembershipData> {
    const membership = await this.fetchUserGuildMembership(walletAddress, guildId);
    if (!membership) throw new Error('Membership not found');

    const guild = await this.fetchGuild(guildId);
    if (!guild) throw new Error('Guild not found');

    const roleData = await this.getGuildRoleData(guildId);
    const guildRewards = await this.fetchGuildRewards(guildId);
    const guildPlatformId = 1;
    const rankInGuild = await this.fetchRankInGuild(walletAddress, guildId, guildPlatformId);
    return {
      guild,
      membership,
      roleData,
      guildRewards,
      guildPlatformId,
      rankInGuild,
    };
  }
}
