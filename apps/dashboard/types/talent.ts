/** TalentProtocol Account Sources */
export type TalentAccountSource =
  | 'wallet'
  | 'farcaster'
  | 'github'
  | 'x_twitter'
  | 'linkedin'
  | 'talent_protocol';

/** TalentProtocol Query Params */
export interface TalentQueryParams {
  /** Talent ID, wallet address or account identifier */
  id: string;
  /** The source of the account */
  account_source?: TalentAccountSource;
  /** The slug of the data issuer to filter the credentials */
  slug?: string;
  /** The slug of the scorer to filter the credentials. Default is the builder score scorer */
  scorer_slug?: string;
}

export interface TalentCredential {
  account_source: string;
  calculating_score: boolean;
  category: string;
  data_issuer_name: string;
  data_issuer_slug: string;
  description: string;
  external_url: string;
  immutable: boolean;
  last_calculated_at: string;
  max_score: number;
  name: string;
  points: number;
  points_calculation_logic: any;
  slug: string;
  uom: string;
  updated_at: string;
}

export interface TalentUser {
  admin: boolean;
  builder_plus: boolean;
  created_at: string;
  email: string | null;
  email_confirmed: boolean;
  email_accounts: string[];
  human_checkmark: boolean;
  id: string;
  main_wallet: string;
  merged: boolean;
  onchain_id: number;
  rank_position: number;
  total_email_count: number | null;
}

export interface TalentAccount {
  identifier: string;
  source: string;
  owned_since: string | null;
  imported_from: string | null;
  connected_at: string;
  username: string | null;
}

export interface TalentProfile {
  accounts?: TalentAccount[];
  bio: string;
  display_name: string;
  ens: string | null;
  human_checkmark: boolean;
  id: string;
  image_url: string;
  location: string;
  name: string;
  onchain_id: number;
  onchain_since: string;
  socials_refreshed_at: string;
  tags?: string[];
  user: TalentUser;
  /** Additional fields observed in payload */
  main_wallet_address?: string;
  farcaster_primary_wallet_address?: string;
  rank_position?: number;
}

export interface TalentScore {
  calculating_score: boolean;
  calculating_score_enqueued_at: string | null;
  last_calculated_at: string;
  points: number;
}

// Service Configuration
export interface TalentConfig {
  apiKey: string;
  timeout?: number;
}
