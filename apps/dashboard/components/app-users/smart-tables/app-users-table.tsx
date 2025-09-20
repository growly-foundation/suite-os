'use client';

import { consumePersona } from '@/core/persona';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { ParsedUser } from '@getgrowly/core';

import { ResizableSheet } from '../../ui/resizable-sheet';
import { UserDetails } from '../app-user-details';
import { TableUserData } from './columns/column-formatters';
import { createUserColumns } from './columns/create-user-columns';
import { DynamicTable } from './dynamic-table';

/**
 * Displays a paginated, sortable table of users with selectable rows and a detail panel.
 *
 * Integrates sorting, selection, and pagination controls, allowing users to view, select, and inspect user details in a side panel.
 *
 * @param users - The list of users to display in the table.
 */
export function UsersTable({
  loading,
  users,
  tableLabel,
  searchQuery,
  setSearchQuery,
  additionalActions,
  selectedRows,
  setSelectedRows,
  hasMoreUsers,
  isLoadingMore,
  onLoadMore,
  totalUsers,
}: {
  loading?: boolean;
  users: ParsedUser[];
  tableLabel?: string;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  additionalActions?: ReactNode;
  selectedRows?: Record<string, boolean>;
  setSelectedRows?: (rows: Record<string, boolean>) => void;
  hasMoreUsers?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  totalUsers?: number;
}) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  // Optimize: Only compute personas when needed for footer calculations
  // Most of the time, users already have persona data attached
  const personas = useMemo(() => {
    // Only compute personas if we need them for footer calculations
    // and if users don't already have persona data
    return users.map(user => {
      // If user already has persona data, create a lightweight persona object
      if (user.personaData) {
        return {
          dominantTrait: () => user.personaData?.identities?.dominantTrait || null,
          totalPortfolioValue: () => {
            const snapshots = user.personaData?.portfolio_snapshots;
            if (!snapshots) return null;
            return Object.values(snapshots).reduce((sum: number, snapshot: any) => {
              return sum + (snapshot?.totalValue || 0);
            }, 0);
          },
          universalTransactions: () => {
            const activities = user.personaData?.activities;
            return activities ? Object.values(activities).flat() : [];
          },
          universalTokenList: () => user.personaData?.portfolio_snapshots || {},
          dayActive: () => {
            const activities = user.personaData?.activities;
            if (!activities) return false;
            // Simple check for recent activity
            return Object.keys(activities).length > 0;
          },
        };
      }
      // Fallback to full persona computation if needed
      return consumePersona(user as ParsedUser);
    });
  }, [users]);

  // User interaction handlers
  const handleUserClick = useCallback((user: ParsedUser) => {
    // Defer state updates to next frame
    requestAnimationFrame(() => {
      setSelectedUser(user.id);
      setOpen(true);
    });
  }, []);

  const handleCloseUserDetails = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Handle row selection change
  const handleRowSelectionChange = (newSelection: Record<string, boolean>) => {
    setSelectedRows?.(newSelection);
  };

  // Get row ID for selection
  const getRowId = (row: TableUserData) => {
    if ('personaData' in row) return row.id;
    if ('email' in row) return row.email || String(row);
    return String(row);
  };

  // Footer data calculation - Notion style aggregation
  const getFooterValue = (key: string) => {
    switch (key) {
      case 'identity':
        return `${users.length}${totalUsers ? ` of ${totalUsers}` : ''} users`;
      case 'firstSignedIn': {
        if (users.length === 0) return '';
        const dates = users
          .filter(user => user.created_at)
          .map(user => new Date(user.created_at).getTime());
        if (dates.length === 0) return '';
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));
        return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
      }
      case 'trait': {
        const traits = personas.reduce(
          (acc, persona) => {
            if (persona.dominantTrait()) {
              const trait = persona.dominantTrait();
              if (trait) {
                acc[trait] = (acc[trait] || 0) + 1;
              }
            }
            return acc;
          },
          {} as Record<string, number>
        );
        const topTrait = Object.entries(traits).sort(([, a], [, b]) => b - a)[0];
        return topTrait ? `${topTrait[0]} (${topTrait[1]})` : '';
      }
      case 'portfolioValue': {
        const totalValue = personas.reduce((sum, persona) => {
          if (persona.totalPortfolioValue()) {
            return sum + persona.totalPortfolioValue()!;
          }
          return sum;
        }, 0);
        return totalValue > 0 ? totalValue : '';
      }
      case 'transactions': {
        const totalTransactions = personas.reduce((sum, persona) => {
          if (persona.universalTransactions()) {
            return sum + persona.universalTransactions().length;
          }
          return sum;
        }, 0);
        return totalTransactions > 0 ? totalTransactions : '';
      }
      case 'tokens': {
        const totalTokens = personas.reduce((sum, persona) => {
          if (persona.universalTokenList()) {
            const portfolio = persona.universalTokenList();
            const tokenCount = Object.values(portfolio).reduce(
              (tokenCount: number, tokenList: any) => tokenCount + tokenList.length,
              0
            );
            return sum + tokenCount;
          }
          return sum;
        }, 0);
        return totalTokens > 0 ? totalTokens : '';
      }
      case 'activity': {
        const activeUsers = personas.reduce((sum, persona) => {
          if (persona.dayActive()) {
            return sum + 1;
          }
          return sum;
        }, 0);
        return `${activeUsers} active`;
      }
      case 'walletCreatedAt': {
        if (users.length === 0) return '';
        const walletDates = users
          .filter(user => user.personaData?.identities.walletMetrics?.walletCreationDate)
          .map(user =>
            new Date(user.personaData!.identities.walletMetrics!.walletCreationDate).getTime()
          );
        if (walletDates.length === 0) return '';
        const earliestWallet = new Date(Math.min(...walletDates));
        const latestWallet = new Date(Math.max(...walletDates));
        return `${earliestWallet.toLocaleDateString()} - ${latestWallet.toLocaleDateString()}`;
      }
      default:
        return '';
    }
  };

  // Create columns for the dynamic table
  const columns = useMemo(() => createUserColumns(users as ParsedUser[]), [users]);

  return (
    <>
      <DynamicTable<ParsedUser>
        data={users as ParsedUser[]}
        columns={columns}
        isLoading={loading}
        pageSize={users.length} // Show all loaded users
        emptyMessage="No users found"
        emptyDescription="There are no users in your organization. Users will appear here once they sign up."
        onRowClick={user => {
          // Type guard to ensure we only handle ParsedUser
          if ('personaData' in user) {
            handleUserClick(user as ParsedUser);
          }
        }}
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableSorting={true}
        enableFooter={true}
        getFooterValue={getFooterValue}
        // Auto-sort by First Signed In (newest first)
        initialSorting={[{ id: 'firstSignedIn', desc: true }]}
        // Enable row selection to show frozen column
        enableRowSelection={true}
        selectedRows={selectedRows}
        onRowSelectionChange={handleRowSelectionChange}
        getRowId={getRowId}
        // Toolbar props
        tableLabel={tableLabel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search ENS or address"
        additionalActions={additionalActions}
        // Infinite loading props
        hasMore={hasMoreUsers}
        loadingMore={isLoadingMore}
        onLoadMore={onLoadMore ? () => onLoadMore() : undefined}
      />
      <ResizableSheet
        side="right"
        className="w-full"
        open={open}
        onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails userId={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
