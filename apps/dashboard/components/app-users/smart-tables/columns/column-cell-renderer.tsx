import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityPreview } from '@/components/user/activity-preview';
import { useWalletData } from '@/hooks/use-wallet-data';
import { getTraitColor } from '@/lib/color.utils';
import { formatAssetValue } from '@/lib/number.utils';
import { cn } from '@/lib/utils';
import { PersonaTrait } from '@/types/persona';

import { ParsedUser } from '@getgrowly/core';

export function TraitBadgeCell({ user }: { user: ParsedUser }) {
  const { personaAnalysis, isLoading, hasError } = useWalletData(user);
  if (isLoading) {
    return <Skeleton className="h-4 w-[50px] rounded-full" />;
  }
  const dominantTrait = !hasError ? personaAnalysis?.dominantTrait?.toString() || '' : '';
  return (
    <Badge className={cn(getTraitColor(dominantTrait as PersonaTrait), 'rounded-full')}>
      {dominantTrait || '—'}
    </Badge>
  );
}

// Shared cell components that use the wallet data hook
export function PortfolioValueCell({ user }: { user: ParsedUser }) {
  const { fungibleTotalUsd, fungibleLoading, fungibleError } = useWalletData(user);

  if (fungibleLoading) {
    return <Skeleton className="h-4 w-[100px] rounded-full" />;
  }

  if (fungibleError) {
    return <span className="text-xs text-destructive">—</span>;
  }

  return <span className="text-xs">${formatAssetValue(fungibleTotalUsd)}</span>;
}

export function TransactionCountCell({ user }: { user: ParsedUser }) {
  const { transactionCount, transactionsLoading, transactionsError } = useWalletData(user);

  if (transactionsLoading) {
    return <Skeleton className="h-4 w-[100px] rounded-full" />;
  }

  if (transactionsError) {
    return <span className="text-xs text-destructive">—</span>;
  }

  return <span className="text-xs">{formatAssetValue(transactionCount)}</span>;
}

export function ActivityCell({ user }: { user: ParsedUser }) {
  const { latestActivity, activityLoading, activityError } = useWalletData(user);

  if (activityLoading) {
    return <Skeleton className="h-4 w-[150px] rounded-full" />;
  }

  if (activityError || !latestActivity) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const lastActivity = {
    from: latestActivity.from,
    to: latestActivity.to,
    value: latestActivity.value,
    symbol: latestActivity.symbol,
    tokenDecimal: latestActivity.tokenDecimal,
    timestamp: latestActivity.timestamp,
  };

  return (
    <div className="flex items-center gap-2">
      <ActivityPreview activity={lastActivity} userId={user.id} />
    </div>
  );
}
