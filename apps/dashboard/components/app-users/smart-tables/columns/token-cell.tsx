'use client';

import { Skeleton } from '@/components/ui/skeleton';

import { TContractToken } from '@getgrowly/chainsmith/types';
import { ParsedUser } from '@getgrowly/core';

import { useWalletData } from '../../../../hooks/use-wallet-data';
import { TokenStack } from '../../token-stack';

interface TokenPositionsCellProps {
  user: ParsedUser;
}

export function TokenPositionsCell({ user }: TokenPositionsCellProps) {
  const { fungiblePositions, fungibleLoading, fungibleError } = useWalletData(user);

  if (fungibleLoading) {
    return <Skeleton className="h-4 w-[100px] rounded-full" />;
  }

  if (fungibleError || !fungiblePositions) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const tokens: TContractToken[] = [];
  for (const position of fungiblePositions) {
    // Unified format (new standard)
    const value = position.value || 0;
    const symbol = position.symbol || '';
    const name = position.name || '';
    const logoURI = position.logo || undefined;
    const tokenAddress = position.tokenAddress;
    const decimals = position.decimals || 18;
    const balance = position.tokenBalanceFloat || 0;
    const chainId = parseInt(position.chainId) || 1;

    // Skip positions with no value
    if (!value || value <= 0) continue;

    // Skip if no address and not a native token
    if (!tokenAddress && !position.isNativeToken) continue;

    const address = (tokenAddress ?? '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') as `0x${string}`;

    tokens.push({
      address,
      type: undefined,
      chainId,
      name,
      symbol,
      decimals,
      logoURI,
      balance,
    });
  }

  const top = tokens.slice(0, 10);

  if (top.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return <TokenStack tokens={top} maxTokens={5} tokenSize={15} />;
}
