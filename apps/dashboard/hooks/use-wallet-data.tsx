'use client';

import { SUPPORTED_CHAINS } from '@/core/persona';
import { trpc } from '@/trpc/client';
import { useMemo } from 'react';

import { ParsedUser } from '@getgrowly/core';

export interface WalletData {
  // Fungible token positions (with precomputed total)
  fungibleTotalUsd: number;
  fungiblePositions: any[];
  fungibleLoading: boolean;
  fungibleError: boolean;

  // NFT positions (with precomputed total)
  nftTotalUsd: number;
  nftPositions: any[];
  nftLoading: boolean;
  nftError: boolean;

  // Transactions (last 30d via Zerion)
  transactionCount: number;
  transactionItems: any[];
  transactionsLoading: boolean;
  transactionsError: boolean;

  // Latest activity derived from Zerion transactions
  latestActivity: any;
  activityLoading: boolean;
  activityError: boolean;

  // Combined loading state
  isLoading: boolean;
  hasError: boolean;
}

export function useWalletData(user: ParsedUser): WalletData {
  const walletAddress = user?.entities?.walletAddress;

  // Common chain mapping for consistency
  const chainIds = useMemo(() => {
    return SUPPORTED_CHAINS.map(chain => chain.toLowerCase())
      .map(chain => (chain === 'mainnet' ? 'ethereum' : chain))
      .join(',');
  }, []);

  // Fetch fungible positions with total (zerion)
  const {
    data: fungibleData,
    isLoading: fungibleLoading,
    error: fungibleError,
  } = trpc.zerion.fungiblePositionsWithTotal.useQuery(
    {
      address: walletAddress || '',
      chainIds,
      currency: 'usd',
      pageLimit: 10,
      pageSize: 200,
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: !!walletAddress && walletAddress.length > 0,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Fetch NFT positions with total (zerion)
  const {
    data: nftData,
    isLoading: nftLoading,
    error: nftError,
  } = trpc.zerion.nftPositionsWithTotal.useQuery(
    {
      address: walletAddress || '',
      chainIds,
      currency: 'usd',
      pageLimit: 10,
      pageSize: 50, // Reduced page size to avoid API limits
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      enabled: !!walletAddress,
      retry: (failureCount, error) => {
        // Don't retry on 400 errors (bad request)
        if ((error as any)?.message?.includes('400')) return false;
        return failureCount < 2;
      },
    }
  );

  // Fetch recent transactions (30d) via unified Zerion endpoint
  const {
    data: transactions,
    isLoading: txsLoading,
    error: txsError,
  } = trpc.zerion.transactions.useQuery(
    {
      address: walletAddress || '',
      currency: 'usd',
      chainIds,
      days: 30,
      pageSize: 50,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for transactions
      refetchOnWindowFocus: false,
      enabled: !!walletAddress && walletAddress.length > 0,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  return useMemo(() => {
    const transactionsLoading = !!txsLoading;
    const transactionsError = !!txsError;
    const activityLoading = !!txsLoading;
    const activityError = !!txsError;

    const isLoading = fungibleLoading || nftLoading || transactionsLoading || activityLoading;
    const hasError = !!fungibleError || !!nftError || transactionsError || activityError;

    return {
      fungibleTotalUsd: fungibleData?.totalUsdValue ?? 0,
      fungiblePositions: fungibleData?.positions ?? [],
      fungibleLoading,
      fungibleError: !!fungibleError,

      nftTotalUsd: nftData?.totalUsdValue ?? 0,
      nftPositions: nftData?.nftPositions ?? [],
      nftLoading,
      nftError: !!nftError,

      transactionCount: transactions?.totalCount ?? 0,
      transactionItems: transactions?.items ?? [],
      transactionsLoading,
      transactionsError,

      latestActivity: transactions?.latestActivity,
      activityLoading,
      activityError,

      isLoading,
      hasError,
    };
  }, [
    fungibleData,
    fungibleLoading,
    fungibleError,
    nftData,
    nftLoading,
    nftError,
    transactions,
    txsLoading,
    txsError,
  ]);
}
