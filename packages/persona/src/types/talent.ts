/** TalentProtocol Account Sources */
export type TalentAccountSource = 'wallet' | 'farcaster' | 'github';

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
  human_checkmark: boolean;
  id: string;
  main_wallet: string;
  merged: boolean;
  onchain_id: number;
  rank_position: number;
}

export interface TalentAccount {
  identifier: string;
  source: string;
  owned_since: string | null;
  connected_at: string;
  username: string | null;
}

export interface TalentProfile {
  account: TalentAccount | null;
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
  refreshing_socials: boolean;
  socials_refreshed_at: string;
  tags: string[];
  user: TalentUser;
}

export interface TalentScore {
  calculating_score: boolean;
  calculating_score_enqueued_at: string | null;
  last_calculated_at: string;
  points: number;
}
