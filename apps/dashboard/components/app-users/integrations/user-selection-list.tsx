'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { ImportIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ImportUserOutput } from '@getgrowly/core';

import { HyperSmartTable } from '../smart-tables/hyper-smart-table';
import { createIdentityColumns } from '../smart-tables/identity-columns';
import { AdvancedColumnType, SmartTableColumn } from '../types';

interface UserSelectionListProps<T extends ImportUserOutput = ImportUserOutput> {
  users: T[];
  importButtonText?: string;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  isImporting?: boolean;
  columns: SmartTableColumn<T>[];
}

export function UserSelectionList<T extends ImportUserOutput = ImportUserOutput>({
  users,
  importButtonText = 'Import Users',
  onImport,
  isImporting = false,
  columns,
}: UserSelectionListProps<T>) {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Toggle select all users
  const toggleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    users.forEach(user => {
      newSelection[user.walletAddress!] = checked;
    });
    console.log('toggleSelectAll', checked, newSelection);
    setSelectedUsers(newSelection);
  };

  const onCheckboxChange = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: checked,
    }));
  };

  // Handle import action
  const handleImport = async () => {
    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    await onImport(selectedUserIds);
  };

  // Count of selected users
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

  return (
    <div className="space-y-2">
      <HyperSmartTable
        columns={[
          {
            type: AdvancedColumnType.BATCH,
            batchRenderer: (user?: ImportUserOutput): any =>
              createIdentityColumns({
                item: {
                  id: user?.walletAddress,
                  walletAddress: user?.walletAddress,
                  name: user?.name,
                  truncateWalletAddress: false,
                  ...user,
                },
                onCheckboxChange,
                selectedUsers,
                onSelectAll: toggleSelectAll,
              } as any),
          },
          ...columns,
        ]}
        items={users.map(user => ({ id: user.walletAddress!, ...user }))}
        itemsPerPage={10}
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
