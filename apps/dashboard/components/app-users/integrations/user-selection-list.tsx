'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ImportIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { ImportUserOutput } from '@getgrowly/core';

import { ImportedUserListItem } from '../imported-user-list-item';

interface UserSelectionListProps {
  users: ImportUserOutput[];
  title: string;
  importButtonText: string;
  isImporting: boolean;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  renderAdditionalInfo?: (user: ImportUserOutput) => React.ReactNode;
}

export function UserSelectionList({
  users,
  title,
  importButtonText,
  isImporting,
  onImport,
  renderAdditionalInfo,
}: UserSelectionListProps) {
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
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            className="border-gray-450"
            checked={users.length > 0 && selectedCount === users.length}
            onCheckedChange={checked => toggleSelectAll(!!checked)}
          />
          <Label htmlFor="select-all" className="text-sm">
            Select All
          </Label>
        </div>
      </div>
      <div className="border rounded-md divide-y h-60 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No users found</div>
        ) : (
          users.map(user => (
            <ImportedUserListItem
              key={user.walletAddress!}
              user={user}
              selected={!!selectedUsers[user.walletAddress!]}
              onUserSelect={user => toggleUserSelection(user.walletAddress!)}
              renderAdditionalInfo={renderAdditionalInfo}
            />
          ))
        )}
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
