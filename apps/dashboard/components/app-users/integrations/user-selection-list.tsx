'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export interface UserItemProps {
  id: string;
  displayName: string;
  subtitle?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

interface UserSelectionListProps {
  users: UserItemProps[];
  title: string;
  importButtonText: string;
  isImporting: boolean;
  onImport: (selectedUserIds: string[]) => Promise<void>;
  renderAdditionalInfo?: (user: UserItemProps) => React.ReactNode;
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
      newSelection[user.id] = checked;
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
            <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-muted">
              <Checkbox
                id={`user-${user.id}`}
                checked={!!selectedUsers[user.id]}
                onCheckedChange={() => toggleUserSelection(user.id)}
              />
              <Label
                htmlFor={`user-${user.id}`}
                className="flex-1 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span>{user.displayName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.subtitle && (
                    <span className="text-xs text-muted-foreground">{user.subtitle}</span>
                  )}
                  {renderAdditionalInfo && renderAdditionalInfo(user)}
                </div>
              </Label>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm">
          {selectedCount} of {users.length} selected
        </span>
        <Button onClick={handleImport} disabled={isImporting || selectedCount === 0}>
          {isImporting ? 'Importing...' : importButtonText || `Import ${selectedCount} Users`}
        </Button>
      </div>
    </div>
  );
}
