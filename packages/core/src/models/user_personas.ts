import { Database, Tables } from '@/types/database.types';

import { types } from '@getgrowly/chainsmith';
import {
  PersonaTrait,
  TraitScore,
  WalletGuildData,
  WalletMetrics,
  WalletTalentData,
} from '@getgrowly/persona';

export type UserPersona = Tables<'user_personas'>;
type OmittedUserPersona = Omit<UserPersona, 'identities' | 'activities' | 'portfolio_snapshots'>;
export type ParsedUserPersona = OmittedUserPersona & UserPersonaMetadata;

export type UserPersonaMetadata = {
  identities: {
    dominantTrait?: PersonaTrait;
    traitScores?: TraitScore[];
    walletMetrics?: WalletMetrics;

    // Third-party data.
    talentProtocol?: WalletTalentData;
    guildXyz?: WalletGuildData;
  };
  activities: {
    totalTransactions?: number;
    daysActive?: number;
    longestHoldingPeriodMonths?: number;
    tokenActivity?: types.TMultichain<types.TTokenTransferActivity[]>;
  };
  portfolio_snapshots: {
    totalValue?: number;
    tokenValue?: number;
    nftValue?: number;
    tokenAllocationPercentage?: number;
    topAssetValue?: number;
    topAssetType?: 'nft' | 'token';
    topTokenSymbol?: string;
    ethHolding?: number;
    tokenPortfolio?: types.TTokenPortfolio;
    nftPortfolio?: types.TNftPortfolio;
  };
};

export type UserPersonaStatus = Database['public']['Enums']['sync_status'];
