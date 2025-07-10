'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ImportIcon, InfoIcon, Loader2, MailIcon, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ImportUserOutput, UserImportSource } from '@getgrowly/core';
import { RandomAvatar, WalletAddress } from '@getgrowly/ui';

import { HeadLabelWithIcon } from '../smart-tables/table-head-label';
import { AdvancedColumnType, SmartTableColumn, TableColumn } from '../types';

interface UserSelectionListProps<T extends ImportUserOutput = ImportUserOutput> {
  users: T[];
  title?: string;
  renderAdditionalInfo?: (user: T) => React.ReactNode;
  importButtonText?: string;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  isImporting?: boolean;
  columns?: SmartTableColumn<T>[];
}

export function UserSelectionList<T extends ImportUserOutput = ImportUserOutput>({
  users,
  title = 'Users',
  renderAdditionalInfo,
  importButtonText = 'Import Users',
  onImport,
  isImporting = false,
  columns = [],
}: UserSelectionListProps<T>) {
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Toggle selection of a single user
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Toggle select all users
  const toggleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    users.forEach(user => {
      newSelection[user.walletAddress!] = checked;
    });
    setSelectedUsers(newSelection);
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
      <div className="flex items-center justify-between">
        <Label>
          {title} ({users.length})
        </Label>
        <Label htmlFor="select-all-header" className="text-sm">
          Select All
        </Label>
      </div>

      <div className="border rounded-md h-[500px] overflow-y-auto">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <TableRow className="hover:bg-transparent">
                {columns.map(column => {
                  if (column.type === AdvancedColumnType.BATCH) {
                    // Handle BatchRenderTableColumn by flattening its columns
                    const batchColumns = column.batchRenderer();
                    return batchColumns.map(batchColumn => (
                      <TableHead
                        key={batchColumn.key}
                        className="h-10"
                        style={{ width: batchColumn.width }}>
                        {/* Render header with proper type checking */}
                        {batchColumn.header}
                      </TableHead>
                    ));
                  } else {
                    // Handle regular TableColumn
                    const tableColumn = column as TableColumn<T>;
                    return (
                      <TableHead
                        key={tableColumn.key}
                        className="h-10"
                        style={{ width: tableColumn.width }}>
                        {/* Render header with proper type checking */}
                        {tableColumn.header}
                      </TableHead>
                    );
                  }
                })}
                {renderAdditionalInfo && (
                  <TableHead className="h-10" style={{ width: '80px' }}></TableHead>
                )}
              </TableRow>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (renderAdditionalInfo ? 1 : 0)}
                    className="h-24 text-center">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <InfoIcon className="mr-2 h-4 w-4" />
                      No users found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.walletAddress!} className="hover:bg-muted cursor-pointer">
                    {columns.map(column => {
                      if (column.type === AdvancedColumnType.BATCH) {
                        // Handle BatchRenderTableColumn by flattening its columns
                        const batchColumns = column.batchRenderer(user);
                        return batchColumns.map(batchColumn => (
                          <TableCell
                            key={`${user.walletAddress}-${batchColumn.key}`}
                            className="py-2">
                            {typeof batchColumn.contentRenderer === 'function' &&
                            typeof batchColumn.dataExtractor === 'function'
                              ? batchColumn.contentRenderer(batchColumn.dataExtractor(user))
                              : null}
                          </TableCell>
                        ));
                      } else {
                        // Handle regular TableColumn
                        const tableColumn = column as TableColumn<T>;
                        return (
                          <TableCell
                            key={`${user.walletAddress}-${tableColumn.key}`}
                            className="py-2">
                            {typeof tableColumn.contentRenderer === 'function' &&
                            typeof tableColumn.dataExtractor === 'function'
                              ? tableColumn.contentRenderer(tableColumn.dataExtractor(user))
                              : null}
                          </TableCell>
                        );
                      }
                    })}
                    {renderAdditionalInfo && (
                      <TableCell className="py-2 text-right">
                        {renderAdditionalInfo(user)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
