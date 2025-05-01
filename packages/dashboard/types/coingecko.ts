export interface CoingeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: Date;
  atl: number;
  atl_change_percentage: number;
  atl_date: Date;
  roi: Roi | null;
  last_updated: Date;
  sparkline_in_7d: SparklineIn7D;
}

export interface Roi {
  times: number;
  currency: Currency;
  percentage: number;
}

export enum Currency {
  Btc = 'btc',
  Eth = 'eth',
  Usd = 'usd',
}

export interface SparklineIn7D {
  price: number[];
}
