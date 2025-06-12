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

export interface GuildMembershipData {
  guild: Guild;
  membership: MembershipResult;
  roleData: Record<number, { rewards: RoleReward[]; requirements: Requirement[]; role: Role }>;
  guildRewards: GuildReward[];
  guildPlatformId: number;
  rankInGuild: LeaderboardItem;
}

export interface GuildRoleData {
  rewards: RoleReward[];
  requirements: Requirement[];
  role: Role;
}

export interface WalletGuildData {
  profile: PublicUserProfile;
  membershipData: Record<number, GuildMembershipData>;
}
