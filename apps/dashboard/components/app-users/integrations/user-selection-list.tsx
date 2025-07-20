'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { consumePersona } from '@/core/persona';
import { ImportIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ImportUserOutput } from '@getgrowly/core';

import { TableUserData } from '../smart-tables/column-formatters';
import { createDynamicColumns } from '../smart-tables/dynamic-columns';
import { DynamicTable } from '../smart-tables/dynamic-table';

interface UserSelectionListProps<T extends ImportUserOutput = ImportUserOutput> {
  users: T[];
  importButtonText?: string;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  isImporting?: boolean;
}

export function UserSelectionList<T extends ImportUserOutput = ImportUserOutput>({
  users,
  importButtonText = 'Import Users',
  onImport,
  isImporting = false,
}: UserSelectionListProps<T>) {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Handle import action
  const handleImport = async () => {
    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    await onImport(selectedUserIds);
  };

  // Count of selected users
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

  // Create columns for the dynamic table
  const columns = createDynamicColumns(users as TableUserData[]);

  // Footer data calculation - Notion style aggregation
  const getFooterValue = (key: string) => {
    switch (key) {
      case 'identity':
        return `${users.length} users`;
      case 'talentProtocolCheckmark':
        const verifiedCount = users.reduce((sum, user) => {
          if ('personaData' in user) {
            const persona = consumePersona(user as any);
            return sum + (persona.getHumanCheckmark() ? 1 : 0);
          }
          return sum;
        }, 0);
        return `${verifiedCount} verified`;
      case 'firstSignedIn':
        if (users.length === 0) return '';
        const dates = users
          .filter(user => 'created_at' in user)
          .map(user => new Date((user as any).created_at).getTime());
        if (dates.length === 0) return '';
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));
        return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
      case 'trait':
        const traits = users.reduce(
          (acc, user) => {
            if ('personaData' in user) {
              const persona = consumePersona(user as any);
              const trait = persona.dominantTrait()?.toString();
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
        const totalValue = users.reduce((sum, user) => {
          if ('personaData' in user) {
            const value = (user as any).personaData?.portfolio_snapshots?.totalValue || 0;
            return sum + value;
          }
          return sum;
        }, 0);
        return totalValue > 0 ? totalValue : '';
      case 'transactions':
        const totalTransactions = users.reduce((sum, user) => {
          if ('personaData' in user) {
            const persona = consumePersona(user as any);
            return sum + persona.universalTransactions().length;
          }
          return sum;
        }, 0);
        return totalTransactions > 0 ? totalTransactions : '';
      case 'tokens':
        const totalTokens = users.reduce((sum, user) => {
          if ('personaData' in user) {
            const portfolio = (user as any).personaData.portfolio_snapshots.tokenPortfolio
              ?.chainRecordsWithTokens;
            const tokenCount = Object.values(portfolio || {}).reduce(
              (chainSum: number, chain: any) => chainSum + chain.tokens.length,
              0
            );
            return sum + tokenCount;
          }
          return sum;
        }, 0);
        return totalTokens > 0 ? totalTokens : '';
      case 'activity':
        const activeUsers = users.reduce((sum, user) => {
          if ('personaData' in user) {
            const persona = consumePersona(user as any);
            const hasActivity = persona.getLatestActivity() !== null;
            return sum + (hasActivity ? 1 : 0);
          }
          return sum;
        }, 0);
        return `${activeUsers} active`;
      case 'walletCreatedAt':
        if (users.length === 0) return '';
        const walletDates = users
          .filter(user => 'personaData' in user)
          .map(user => {
            const persona = consumePersona(user as any);
            return persona.walletCreatedAt()?.getTime();
          })
          .filter(Boolean);
        if (walletDates.length === 0) return '';
        const earliestWallet = new Date(Math.min(...(walletDates as number[])));
        const latestWallet = new Date(Math.max(...(walletDates as number[])));
        return `${earliestWallet.toLocaleDateString()} - ${latestWallet.toLocaleDateString()}`;
      case 'email':
        const emailCount = users.reduce((sum, user) => {
          return sum + ('email' in user && user.email ? 1 : 0);
        }, 0);
        return `${emailCount} with email`;
      case 'contractData':
        const contractUsers = users.reduce((sum, user) => {
          if ('extra' in user && user.extra && typeof user.extra === 'object') {
            const extra = user.extra as Record<string, any>;
            return sum + (extra.interactionCount || 0);
          }
          return sum;
        }, 0);
        return contractUsers > 0 ? `${contractUsers} interactions` : '';
      case 'source':
        const sources = users.reduce(
          (acc, user) => {
            if ('source' in user && user.source) {
              acc[user.source] = (acc[user.source] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>
        );
        const topSource = Object.entries(sources).sort(([, a], [, b]) => b - a)[0];
        return topSource ? `${topSource[0]} (${topSource[1]})` : '';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <DynamicTable
        data={users as TableUserData[]}
        columns={columns}
        emptyMessage="No users found"
        emptyDescription="No users to import."
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableSorting={true}
        enableRowSelection={true}
        selectedRows={selectedUsers}
        onRowSelectionChange={setSelectedUsers}
        getRowId={row => (row as any).walletAddress || (row as any).id}
        enableFooter={true}
        getFooterValue={getFooterValue}
        initialSorting={[{ id: 'identity', desc: true }]}
      />
      <div className="flex justify-between items-center pt-2">
        <span className="text-sm">
          {selectedCount} of {users.length} selected
        </span>
        <PrimaryButton onClick={handleImport} disabled={isImporting || selectedCount === 0}>
          {isImporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImportIcon className="mr-1 h-4 w-4" />
          )}
          {isImporting ? 'Importing...' : importButtonText || `Import ${selectedCount} Users`}
        </PrimaryButton>
      </div>
    </div>
  );
}
