import {
  PersonaAnalysis,
  PersonaTrait,
  TraitMetric,
  TraitScore,
  WalletMetrics,
  WeightLevel,
} from '@/types/persona';
import { ZerionFungiblePosition, ZerionNftPosition, ZerionTransaction } from '@/types/zerion';

function toDateOnlyKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildWalletMetrics(params: {
  fungibleTotalUsd: number;
  fungiblePositions: ZerionFungiblePosition[];
  nftTotalUsd: number;
  nftPositions: ZerionNftPosition[];
  transactions:
    | { items: Array<{ minedAt?: string; operationType?: string }>; totalCount: number }
    | undefined;
  activationAt?: Date;
}): WalletMetrics {
  const {
    fungibleTotalUsd,
    fungiblePositions,
    nftTotalUsd,
    nftPositions,
    transactions,
    activationAt,
  } = params;

  const totalPortfolioValue = getNumber(fungibleTotalUsd) + getNumber(nftTotalUsd);
  const tokenAllocationPercentage =
    totalPortfolioValue > 0 ? (getNumber(fungibleTotalUsd) / totalPortfolioValue) * 100 : 0;

  // active days and defi txs over last 90 days using provided transactions
  const activeDayKeys = new Set<string>();
  let defiTransactionsLast90Days = 0;
  let latestTxDate: Date | undefined;
  let earliestTxDate: Date | undefined;

  const defiOps = new Set([
    'deposit',
    'withdraw',
    'borrow',
    'repay',
    'stake',
    'unstake',
    'trade',
    'claim',
    'approve',
    'execute',
  ]);

  (transactions?.items || []).forEach(tx => {
    const minedAt = tx.minedAt ? new Date(tx.minedAt) : undefined;
    if (minedAt && !isNaN(minedAt.getTime())) {
      activeDayKeys.add(toDateOnlyKey(minedAt));
      if (!latestTxDate || minedAt > latestTxDate) {
        latestTxDate = minedAt;
      }
      if (!earliestTxDate || minedAt < earliestTxDate) {
        earliestTxDate = minedAt;
      }
    }
    if (tx.operationType && defiOps.has(tx.operationType as any)) {
      defiTransactionsLast90Days += 1;
    }
  });

  const activeDaysLast90Days = activeDayKeys.size;

  // top asset detection
  let topAssetValue = 0;
  let topAssetType: 'token' | 'nft' = 'token';
  let topTokenSymbol: string | undefined = undefined;

  // From fungible positions by USD value
  for (const p of fungiblePositions || []) {
    const value = getNumber(p.attributes?.value);
    if (value > topAssetValue) {
      topAssetValue = value;
      topAssetType = 'token';
      topTokenSymbol = p.attributes?.fungible_info?.symbol;
    }
  }

  // From NFT positions by USD value
  for (const p of nftPositions || []) {
    const value = getNumber(p.attributes?.value);
    if (value > topAssetValue) {
      topAssetValue = value;
      topAssetType = 'nft';
      topTokenSymbol = undefined;
    }
  }

  // ETH holding from fungible positions quantity where symbol === 'ETH'
  let ethHolding = 0;
  for (const p of fungiblePositions || []) {
    const symbol = p.attributes?.fungible_info?.symbol;
    if (symbol === 'ETH') {
      ethHolding += getNumber(p.attributes?.quantity?.float, 0);
    }
  }

  // Activation date: prefer provided activationAt (funded time), else earliest observed tx, else now
  const walletActiveDate = activationAt || earliestTxDate || new Date();

  return {
    walletActiveDate,
    totalPortfolioValue,
    tokenPortfolioValue: getNumber(fungibleTotalUsd),
    nftPortfolioValue: getNumber(nftTotalUsd),
    tokenAllocationPercentage,
    activeDaysLast90Days,
    defiTransactionsLast90Days,
    topAssetValue,
    topAssetType,
    ethHolding,
    topTokenSymbol,
  };
}

function score(metrics: TraitMetric[]): number {
  return metrics.reduce((sum, m) => sum + (m.satisfied ? m.weight : 0), 0);
}

function calcEarlyAdopter(metrics: WalletMetrics): TraitScore {
  const ms: TraitMetric[] = [
    {
      name: 'Active on 30+ days in last 90',
      weight: WeightLevel.HIGH,
      satisfied: metrics.activeDaysLast90Days >= 30,
    },
    {
      name: 'Some staking/claiming behavior',
      weight: WeightLevel.MEDIUM,
      satisfied: metrics.defiTransactionsLast90Days >= 5,
    },
    {
      name: 'Balanced token allocation 40%-80%',
      weight: WeightLevel.LOW,
      satisfied: metrics.tokenAllocationPercentage >= 40 && metrics.tokenAllocationPercentage <= 80,
    },
  ];
  return { trait: PersonaTrait.OG, score: score(ms), metrics: ms };
}

function calcDeFiExpert(metrics: WalletMetrics): TraitScore {
  const ms: TraitMetric[] = [
    {
      name: 'DeFi txs >= 20 in last 90',
      weight: WeightLevel.HIGH,
      satisfied: metrics.defiTransactionsLast90Days >= 20,
    },
    {
      name: 'Token allocation > 60%',
      weight: WeightLevel.MEDIUM,
      satisfied: metrics.tokenAllocationPercentage > 60,
    },
    {
      name: 'Active on 45+ days in last 90',
      weight: WeightLevel.LOW,
      satisfied: metrics.activeDaysLast90Days >= 45,
    },
  ];
  return { trait: PersonaTrait.DEFI_EXPERT, score: score(ms), metrics: ms };
}

function calcRiskTaker(metrics: WalletMetrics, opts?: { walletAgeDays?: number }): TraitScore {
  const walletAgeDays = opts?.walletAgeDays;

  // Fresh wallets should not be marked Risk Taker
  const ageGateSatisfied = walletAgeDays === undefined ? false : walletAgeDays > 60;

  const ms: TraitMetric[] = [
    {
      name: 'High activity (>= 30 active days)',
      weight: WeightLevel.MEDIUM,
      satisfied: ageGateSatisfied && metrics.activeDaysLast90Days >= 30,
    },
    {
      name: 'DeFi usage (>= 10 txs in 90d)',
      weight: WeightLevel.HIGH,
      satisfied: ageGateSatisfied && metrics.defiTransactionsLast90Days >= 10,
    },
    {
      name: 'Concentrated token exposure (> 75%) and token top asset',
      weight: WeightLevel.LOW,
      satisfied:
        ageGateSatisfied &&
        metrics.tokenAllocationPercentage > 75 &&
        metrics.topAssetType === 'token',
    },
  ];
  return { trait: PersonaTrait.RISK_TAKER, score: score(ms), metrics: ms };
}

function calcNewbie(metrics: WalletMetrics, opts?: { walletAgeDays?: number }): TraitScore {
  // Derive recent wallet based on provided age or activation date (fallback handles missing funding info)
  const walletAgeDays =
    opts?.walletAgeDays ??
    Math.floor((Date.now() - metrics.walletActiveDate.getTime()) / (24 * 60 * 60 * 1000));
  const ms: TraitMetric[] = [
    {
      name: 'Recent wallet (<= 60 days)',
      weight: WeightLevel.HIGH,
      satisfied: walletAgeDays <= 60,
    },
    {
      name: 'Very low activity (< 5 days active)',
      weight: WeightLevel.MEDIUM,
      satisfied: metrics.activeDaysLast90Days < 5,
    },
    {
      name: 'Low portfolio (< $1,000)',
      weight: WeightLevel.LOW,
      satisfied: metrics.totalPortfolioValue < 1000,
    },
  ];
  return { trait: PersonaTrait.NEWBIE, score: score(ms), metrics: ms };
}

function calcIdle(metrics: WalletMetrics, opts?: { lastActiveDaysAgo?: number }): TraitScore {
  const lastActiveDaysAgo = opts?.lastActiveDaysAgo ?? Number.POSITIVE_INFINITY;
  const ms: TraitMetric[] = [
    {
      name: 'Has activity in last 90 days',
      weight: WeightLevel.HIGH,
      satisfied: metrics.activeDaysLast90Days > 0,
    },
    {
      name: 'No activity in last 30 days',
      weight: WeightLevel.MEDIUM,
      satisfied: lastActiveDaysAgo >= 30,
    },
    {
      name: 'Moderate DeFi usage (>= 3 in 90d)',
      weight: WeightLevel.LOW,
      satisfied: metrics.defiTransactionsLast90Days >= 3,
    },
  ];
  return { trait: PersonaTrait.IDLE, score: score(ms), metrics: ms };
}

export function analyzePersonaFromZerion(
  fungibleTotalUsd: number,
  fungiblePositions: ZerionFungiblePosition[],
  nftTotalUsd: number,
  nftPositions: ZerionNftPosition[],
  transactions: { items: ZerionTransaction[]; totalCount: number } | undefined,
  options?: { walletAgeDays?: number; lastActiveAt?: Date; walletActivationAt?: Date }
): PersonaAnalysis {
  const walletMetrics = buildWalletMetrics({
    fungibleTotalUsd,
    fungiblePositions,
    nftTotalUsd,
    nftPositions,
    transactions: transactions
      ? {
          items: transactions.items.map(tx => ({
            minedAt: (tx as any).minedAt,
            operationType: (tx as any).operationType,
          })),
          totalCount: transactions.totalCount,
        }
      : undefined,
    activationAt: options?.walletActivationAt,
  });

  const now = Date.now();
  const lastActiveAt =
    options?.lastActiveAt ??
    (transactions?.items?.[0]
      ? new Date((transactions as any).items[0].minedAt)
      : walletMetrics.walletActiveDate);
  const lastActiveDaysAgo = Math.floor((now - lastActiveAt.getTime()) / (24 * 60 * 60 * 1000));

  // Derive wallet age days if not provided, based on activation date
  const derivedWalletAgeDays =
    options?.walletAgeDays ??
    Math.floor((now - walletMetrics.walletActiveDate.getTime()) / (24 * 60 * 60 * 1000));

  const traitScores = [
    calcEarlyAdopter(walletMetrics),
    calcDeFiExpert(walletMetrics),
    calcRiskTaker(walletMetrics, { walletAgeDays: derivedWalletAgeDays }),
    calcNewbie(walletMetrics, { walletAgeDays: derivedWalletAgeDays }),
    calcIdle(walletMetrics, { lastActiveDaysAgo }),
  ];

  const dominantTrait = traitScores.reduce((prev, cur) =>
    cur.score > prev.score ? cur : prev
  ).trait;

  return {
    dominantTrait,
    traitScores,
    walletMetrics,
  };
}
