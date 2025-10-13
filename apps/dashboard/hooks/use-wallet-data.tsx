'use client';

import {
  GET_FUNDED_INFO_CACHE_TIME,
  GET_FUNDED_INFO_GC_TIME,
  GET_FUNGIBLE_POSITIONS_CACHE_TIME,
  GET_FUNGIBLE_POSITIONS_GC_TIME,
  GET_NFT_POSITIONS_CACHE_TIME,
  GET_NFT_POSITIONS_GC_TIME,
  GET_TRANSACTIONS_CACHE_TIME,
  GET_TRANSACTIONS_GC_TIME,
} from '@/constants/cache';
import { SUPPORTED_CHAINS } from '@/core/chains';
import { useDashboardState } from '@/hooks/use-dashboard';
import { analyzePersonaFromZerion } from '@/lib/persona-classifier';
import { api } from '@/trpc/react';
import { EtherscanFundingInfo } from '@/types/etherscan';
import { PersonaAnalysis } from '@/types/persona';
import { ZerionFungiblePosition, ZerionNftPosition, ZerionTransaction } from '@/types/zerion';
import { useEffect, useMemo } from 'react';
import { mainnet } from 'viem/chains';

import { ParsedUser } from '@getgrowly/core';

import { useWalletTableContext } from './use-wallet-table-context';

export interface WalletData {
  // Fungible token positions (with precomputed total)
  fungibleTotalUsd: number;
  fungiblePositions: ZerionFungiblePosition[];
  fungibleLoading: boolean;
  fungibleError: boolean;

  // NFT positions (with precomputed total)
  nftTotalUsd: number;
  nftPositions: ZerionNftPosition[];
  nftLoading: boolean;
  nftError: boolean;

  // Transactions (last 30d via Zerion)
  transactionCount: number;
  transactionItems: ZerionTransaction[];
  transactionsLoading: boolean;
  transactionsError: boolean;

  // Latest activity derived from Zerion transactions
  latestActivity: any;
  activityLoading: boolean;
  activityError: boolean;

  // Funding info across chains (for activation date)
  walletFundedInfo?: Record<number, EtherscanFundingInfo>;
  walletFundedInfoLoading: boolean;
  walletFundedInfoError: boolean;

  // Persona analysis derived from wallet metrics
  personaAnalysis?: PersonaAnalysis;

  // Combined loading state
  isLoading: boolean;
  hasError: boolean;
}

export function useWalletData(user: ParsedUser): WalletData {
  const { updateWalletData } = useWalletTableContext();
  const walletAddress = user.wallet_address;
  const { selectedOrganization } = useDashboardState();

  // Common chain mapping for consistency
  const chainIds = useMemo(() => {
    // Prefer organization-configured chain IDs; fallback to all supported
    const configuredIds = selectedOrganization?.supported_chain_ids;
    const activeNames =
      configuredIds && configuredIds.length > 0
        ? configuredIds
            .map(id => SUPPORTED_CHAINS.find(c => c.id === id)?.name)
            .filter((n): n is string => !!n)
        : ['mainnet'];

    return activeNames
      .map(name => name.toLowerCase())
      .map(name => (name === 'mainnet' ? 'ethereum' : name))
      .map(name => (name === 'op mainnet' ? 'optimism' : name)) // TODO: handle proper name mapping for API services
      .join(',');
  }, [selectedOrganization?.supported_chain_ids]);

  // Fetch fungible positions with total (zerion)
  const {
    data: fungibleData,
    isLoading: fungibleLoading,
    error: fungibleError,
  } = api.zerion.fungiblePositionsWithTotal.useQuery(
    {
      address: walletAddress || '',
      chainIds,
      currency: 'usd',
      pageLimit: 10,
      pageSize: 200,
    },
    {
      staleTime: GET_FUNGIBLE_POSITIONS_CACHE_TIME,
      gcTime: GET_FUNGIBLE_POSITIONS_GC_TIME,
      refetchOnWindowFocus: false,
      enabled: !!walletAddress && walletAddress.length > 0,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Fetch NFT positions with total (zerion)
  const {
    data: nftData,
    isLoading: nftLoading,
    error: nftError,
  } = api.zerion.nftPositionsWithTotal.useQuery(
    {
      address: walletAddress || '',
      chainIds,
      currency: 'usd',
      pageLimit: 10,
      pageSize: 50, // Reduced page size to avoid API limits
    },
    {
      staleTime: GET_NFT_POSITIONS_CACHE_TIME,
      gcTime: GET_NFT_POSITIONS_GC_TIME,
      refetchOnWindowFocus: false,
      enabled: !!walletAddress,
      retry: (failureCount: number, error: any) => {
        // Don't retry on 400 errors (bad request)
        if ((error as any)?.message?.includes('400')) return false;
        return failureCount < 2;
      },
    }
  );

  // Get recent 3 months of transactions
  const {
    data: transactions,
    isLoading: txsLoading,
    error: txsError,
  } = api.zerion.transactions.useQuery(
    {
      address: walletAddress || '',
      currency: 'usd',
      chainIds,
      days: 90,
      pageSize: 50,
    },
    {
      staleTime: GET_TRANSACTIONS_CACHE_TIME,
      gcTime: GET_TRANSACTIONS_GC_TIME,
      refetchOnWindowFocus: false,
      enabled: !!walletAddress && walletAddress.length > 0,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  // Etherscan funding info across chains (mainnet, base, optimism)
  const {
    data: fundingInfo,
    isLoading: fundingLoading,
    error: fundingError,
  } = api.etherscan.getAddressFundedByAcrossChains.useQuery(
    {
      address: walletAddress || '',
      chainIds:
        selectedOrganization?.supported_chain_ids &&
        selectedOrganization.supported_chain_ids.length > 0
          ? selectedOrganization.supported_chain_ids
          : [mainnet.id],
    },
    {
      staleTime: GET_FUNDED_INFO_CACHE_TIME,
      gcTime: GET_FUNDED_INFO_GC_TIME,
      refetchOnWindowFocus: false,
      enabled: !!walletAddress && walletAddress.length > 0,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  const walletData = useMemo(() => {
    const transactionsLoading = !!txsLoading;
    const transactionsError = !!txsError;
    const activityLoading = !!txsLoading;
    const activityError = !!txsError;

    const isLoading =
      fungibleLoading || nftLoading || transactionsLoading || activityLoading || fundingLoading;
    const hasError =
      !!fungibleError || !!nftError || transactionsError || activityError || !!fundingError;

    // Compute wallet age (days) and activation date from earliest funded timestamp across chains
    let walletAgeDays: number | undefined;
    let walletActivationAt: Date | undefined;
    if (fundingInfo) {
      const timestamps = Object.values(fundingInfo)
        .filter(Boolean)
        .map((info: any) => parseInt(info.timeStamp, 10) * 1000)
        .filter((n: number) => Number.isFinite(n) && n > 0);
      const minTs = timestamps.length ? Math.min(...timestamps) : 0;
      walletActivationAt = minTs > 0 ? new Date(minTs) : undefined;
      walletAgeDays =
        minTs > 0 ? Math.floor((Date.now() - minTs) / (24 * 60 * 60 * 1000)) : undefined;
    }

    // Last active date from latest Zerion tx
    const lastActiveAt = transactions?.items?.[0]?.minedAt
      ? new Date((transactions as any).items[0].minedAt)
      : undefined;

    const personaAnalysis =
      !isLoading && !hasError
        ? analyzePersonaFromZerion(
            fungibleData?.totalUsdValue ?? 0,
            fungibleData?.positions ?? [],
            nftData?.totalUsdValue ?? 0,
            nftData?.nftPositions ?? [],
            transactions,
            { walletAgeDays, lastActiveAt, walletActivationAt }
          )
        : undefined;

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

      // funded info exposure
      walletFundedInfo: fundingInfo as Record<number, EtherscanFundingInfo>,
      walletFundedInfoLoading: !!fundingLoading,
      walletFundedInfoError: !!fundingError,

      personaAnalysis,

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
    fundingInfo,
    fundingLoading,
    fundingError,
  ]);

  useEffect(() => {
    if (walletAddress) {
      updateWalletData(walletAddress, walletData);
    }
  }, [walletAddress, walletData]);

  return walletData;
}
