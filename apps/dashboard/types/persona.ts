export enum PersonaTrait {
  OG = 'OG',
  DEFI_EXPERT = 'DeFi Expert',
  RISK_TAKER = 'Risk Taker',
  NEWBIE = 'Newbie',
  IDLE = 'Idle',
}

export enum WeightLevel {
  HIGH = 3,
  MEDIUM = 2,
  LOW = 1,
}

export interface TraitMetric {
  name: string;
  weight: WeightLevel;
  satisfied: boolean;
}

export interface TraitScore {
  trait: PersonaTrait;
  score: number;
  metrics: TraitMetric[];
}

export interface WalletMetrics {
  walletActiveDate: Date;
  totalPortfolioValue: number;
  tokenPortfolioValue: number;
  nftPortfolioValue: number;
  tokenAllocationPercentage: number;
  activeDaysLast90Days: number;
  defiTransactionsLast90Days: number;
  topAssetValue: number;
  topAssetType: 'token' | 'nft';
  ethHolding: number;
  topTokenSymbol?: string;
}

export interface PersonaAnalysis {
  dominantTrait: PersonaTrait;
  traitScores: TraitScore[];
  walletMetrics: WalletMetrics;
}
