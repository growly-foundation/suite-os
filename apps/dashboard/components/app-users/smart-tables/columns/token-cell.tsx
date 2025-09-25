'use client';

import { Skeleton } from '@/components/ui/skeleton';

import { TChainName, TContractToken } from '@getgrowly/chainsmith/types';
import { getChainIdByName } from '@getgrowly/chainsmith/utils';
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
    const attrs = position?.attributes;
    const fungibleInfo = attrs?.fungible_info;
    const zerionChainId = position?.relationships?.chain?.data?.id;
    let chainName: TChainName = 'mainnet';
    switch (zerionChainId) {
      case 'ethereum':
        chainName = 'mainnet';
        break;
      case 'binance-smart-chain':
        chainName = 'bsc';
        break;
      default:
        chainName = zerionChainId as TChainName;
    }

    // Skip positions with no value
    if (!attrs?.value || attrs.value <= 0) continue;

    // Get token address from implementations
    let tokenAddress: string | null = null;
    const implementation = fungibleInfo?.implementations?.find(
      (impl: any) => impl.chain_id === zerionChainId
    );
    if (implementation?.address) {
      tokenAddress = implementation.address;
    }

    const address = tokenAddress as `0x${string}`;

    const chainId = getChainIdByName(chainName);

    tokens.push({
      address,
      type: undefined,
      chainId,
      name: fungibleInfo.name || '',
      symbol: fungibleInfo.symbol || '',
      decimals: implementation?.decimals || 18,
      logoURI: fungibleInfo.icon?.url,
      balance: Number(attrs?.quantity?.float || 0),
    });
  }

  const top = tokens.slice(0, 10);

  if (top.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return <TokenStack tokens={top} maxTokens={5} tokenSize={15} />;
}
