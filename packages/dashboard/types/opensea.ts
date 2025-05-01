export interface OpenSeaCollectionStats {
  total: Total;
  intervals: Interval[];
}
export interface OpenSeaCollection {
  collection: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  safelist_status: string;
  category: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  trait_offers_enabled: boolean;
  collection_offers_enabled: boolean;
  opensea_url: string;
  project_url: string;
  wiki_url: string;
  discord_url: string;
  telegram_url: string;
  twitter_username: string;
  instagram_username: string;
  contracts: Contract[];
  editors: string[];
  fees: Fee[];
  rarity: Rarity;
  payment_tokens: PaymentToken[];
  total_supply: number;
  created_date: Date;
}

export interface Interval {
  interval: string;
  volume: number;
  volume_diff: number;
  volume_change: number;
  sales: number;
  sales_diff: number;
  average_price: number;
}

export interface Total {
  volume: number;
  sales: number;
  average_price: number;
  num_owners: number;
  market_cap: number;
  floor_price: number;
  floor_price_symbol: string;
}

export interface Contract {
  address: string;
  chain: string;
}

export interface Fee {
  fee: number;
  recipient: string;
  required: boolean;
}

export interface PaymentToken {
  symbol: string;
  address: string;
  chain: string;
  image: string;
  name: string;
  decimals: number;
  eth_price: string;
  usd_price: string;
}

export interface Rarity {
  strategy_id: string;
  strategy_version: string;
  calculated_at: Date;
  max_rank: number;
  tokens_scored: number;
}
