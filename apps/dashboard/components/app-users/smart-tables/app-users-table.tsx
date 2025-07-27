'use client';

import { consumePersona } from '@/core/persona';
import { ReactNode, useState } from 'react';

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
  users,
  tableLabel,
  searchQuery,
  setSearchQuery,
  additionalActions,
}: {
  users: ParsedUser[];
  tableLabel?: string;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  additionalActions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ParsedUser | null>(null);
  const personas = users.map(user => consumePersona(user as ParsedUser));

  // Row selection state
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // User interaction handlers
  const handleUserClick = (user: ParsedUser) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleCloseUserDetails = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // Handle row selection change
  const handleRowSelectionChange = (newSelection: Record<string, boolean>) => {
    setSelectedRows(newSelection);
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
        return `${users.length} users`;
      case 'talentProtocolCheckmark':
        const verifiedCount = users.reduce((sum, user) => {
          if ('personaData' in user) {
            // For ParsedUser, we can access personaData directly
            const persona = user.personaData;
            return sum + (persona?.identities.talentProtocol?.profile.human_checkmark ? 1 : 0);
          }
          return sum;
        }, 0);
        return `${verifiedCount} verified`;
      case 'firstSignedIn':
        if (users.length === 0) return '';
        const dates = users
          .filter(user => user.created_at)
          .map(user => new Date(user.created_at).getTime());
        if (dates.length === 0) return '';
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));
        return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
      case 'trait':
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
      case 'portfolioValue':
        const totalValue = personas.reduce((sum, persona) => {
          if (persona.totalPortfolioValue()) {
            return sum + persona.totalPortfolioValue()!;
          }
          return sum;
        }, 0);
        return totalValue > 0 ? totalValue : '';
      case 'transactions':
        const totalTransactions = personas.reduce((sum, persona) => {
          if (persona.universalTransactions()) {
            return sum + persona.universalTransactions().length;
          }
          return sum;
        }, 0);
        return totalTransactions > 0 ? totalTransactions : '';
      case 'tokens':
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
      case 'activity':
        const activeUsers = personas.reduce((sum, persona) => {
          if (persona.dayActive()) {
            return sum + 1;
          }
          return sum;
        }, 0);
        return `${activeUsers} active`;
      case 'walletCreatedAt':
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
      default:
        return '';
    }
  };

  // Create columns for the dynamic table
  const columns = createUserColumns(users as ParsedUser[]);

  return (
    <>
      <DynamicTable<ParsedUser>
        data={users as ParsedUser[]}
        columns={columns}
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
        // Enable pagination
        enablePagination={true}
        pageSize={30} // Show 30 users per page
        // Toolbar props
        tableLabel={tableLabel}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search ENS or address"
        additionalActions={additionalActions}
      />
      <ResizableSheet
        side="right"
        className="w-full"
        open={open}
        onOpenChange={handleCloseUserDetails}>
        {selectedUser && <UserDetails user={selectedUser} />}
      </ResizableSheet>
    </>
  );
}
