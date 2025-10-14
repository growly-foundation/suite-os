import { WalletTableContext } from '@/hooks/use-wallet-table-context';

// CSS variables for layout calculations
export const TOOLBAR_HEIGHT = '4rem';
export const FOOTER_HEIGHT = '3rem';
export const HEADER_HEIGHT = '3rem';

// Custom sorting functions for different data types
export const createCustomSortingFns = (walletContext: WalletTableContext) => ({
  // Portfolio value sorting - uses wallet context data
  portfolioSorting: (rowA: any, rowB: any, columnId: string) => {
    const walletAddressA = rowA.getValue(columnId);
    const walletAddressB = rowB.getValue(columnId);

    const walletDataA = walletContext?.getWalletData?.(walletAddressA);
    const walletDataB = walletContext?.getWalletData?.(walletAddressB);

    const valueA = walletDataA?.fungibleTotalUsd || 0;
    const valueB = walletDataB?.fungibleTotalUsd || 0;

    return valueA - valueB;
  },

  // Transaction count sorting - uses wallet context data
  transactionSorting: (rowA: any, rowB: any, columnId: string) => {
    const walletAddressA = rowA.getValue(columnId);
    const walletAddressB = rowB.getValue(columnId);

    const walletDataA = walletContext?.getWalletData?.(walletAddressA);
    const walletDataB = walletContext?.getWalletData?.(walletAddressB);

    const countA = walletDataA?.transactionCount || 0;
    const countB = walletDataB?.transactionCount || 0;

    return countA - countB;
  },

  // Date sorting - handles timestamps and date strings
  dateSorting: (rowA: any, rowB: any, columnId: string) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);

    // Convert to timestamps for comparison
    const timeA = typeof a === 'string' ? new Date(a).getTime() : typeof a === 'number' ? a : 0;
    const timeB = typeof b === 'string' ? new Date(b).getTime() : typeof b === 'number' ? b : 0;

    return timeA - timeB;
  },

  // Numeric sorting - handles numbers, currency, and numeric strings
  numericSorting: (rowA: any, rowB: any, columnId: string) => {
    const a = rowA.getValue(columnId);
    const b = rowB.getValue(columnId);

    // Convert to numbers for comparison
    const numA =
      typeof a === 'string'
        ? parseFloat(a.replace(/[^0-9.-]/g, '')) || 0
        : typeof a === 'number'
          ? a
          : 0;
    const numB =
      typeof b === 'string'
        ? parseFloat(b.replace(/[^0-9.-]/g, '')) || 0
        : typeof b === 'number'
          ? b
          : 0;

    return numA - numB;
  },

  // String sorting - case insensitive
  stringSorting: (rowA: any, rowB: any, columnId: string) => {
    const a = String(rowA.getValue(columnId) || '').toLowerCase();
    const b = String(rowB.getValue(columnId) || '').toLowerCase();

    return a.localeCompare(b);
  },

  tokensSorting: (rowA: any, rowB: any, columnId: string) => {
    const walletAddressA = rowA.getValue(columnId);
    const walletAddressB = rowB.getValue(columnId);

    const aFungiblePositions =
      walletContext.getWalletData(walletAddressA)?.fungiblePositions.length || 0;
    const bFungiblePositions =
      walletContext.getWalletData(walletAddressB)?.fungiblePositions.length || 0;

    return aFungiblePositions - bFungiblePositions;
  },
});

export type CustomSortingFns = ReturnType<typeof createCustomSortingFns>;
