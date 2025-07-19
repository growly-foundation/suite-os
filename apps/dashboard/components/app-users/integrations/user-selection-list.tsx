'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
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
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    await onImport(selectedUserIds);
  };

  // Count of selected users
  const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

  // Create columns for the dynamic table
  const columns = createDynamicColumns(users as TableUserData[]);

  return (
    <div className="space-y-2">
      <DynamicTable
        data={users as TableUserData[]}
        columns={columns}
        emptyMessage="No users found"
        emptyDescription="No users to import."
        enableColumnResizing={true}
        enableColumnReordering={true}
        enableColumnVisibility={true}
        enableSorting={true}
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
