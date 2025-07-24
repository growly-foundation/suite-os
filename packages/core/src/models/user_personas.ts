import { Database, Tables } from '@/types/database.types';

import { types } from '@getgrowly/chainsmith';
import { TMultichain } from '@getgrowly/chainsmith/types';
import {
  PersonaTrait,
  TraitScore,
  WalletGuildData,
  WalletMetrics,
  WalletTalentData,
} from '@getgrowly/persona';

import { ImportedUserSourceData } from './user_importers';

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

    // Name service.
    nameService?: TMultichain<{
      name?: string;
      avatar?: string;
    }>;
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
  imported_source_data: ImportedUserSourceData[];
};

export type UserPersonaStatus = Database['public']['Enums']['sync_status'];
