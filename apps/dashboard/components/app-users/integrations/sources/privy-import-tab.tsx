'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { createPrivyUserColumns } from '@/components/app-users/smart-tables/import-user-tables/privy-user-columns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { ImportPrivyUserOutput, UserImportSource } from '@getgrowly/core';

interface PrivyImportTabProps {
  onImportComplete?: () => void;
}

export function PrivyImportTab({ onImportComplete }: PrivyImportTabProps) {
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [privyUsers, setPrivyUsers] = useState<ImportPrivyUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Handle configuration
  const handleConfigure = async () => {
    if (!appId || !appSecret) {
      toast.error('Please provide both App ID and App Secret');
      return;
    }

    setConfiguring(true);
    try {
      // Fetch users
      await handleFetchUsers();
    } catch (error) {
      console.error('Error configuring Privy:', error);
      toast.error(
        `Error configuring Privy: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setConfiguring(false);
    }
  };

  // Fetch Privy users
  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserImportService.importPrivyUsers(appId, appSecret);
      setPrivyUsers(response);
      setConfigured(true);
    } catch (error) {
      console.error('Error fetching Privy users:', error);
      toast.error(
        `Error fetching Privy users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Import selected users
  const handleImport = async (usersToImport: ImportPrivyUserOutput[]) => {
    if (usersToImport.length === 0) {
      toast.warning('Please select at least one user to import');
      return;
    }

    setImporting(true);
    try {
      // Import users in batch
      const result = await UserImportService.importBatch(UserImportSource.Privy, usersToImport);
      // Show success/failure messages
      if (result.success.length > 0)
        toast.success(`Successfully imported ${result.success.length} Privy users`);
      if (result.failed.length > 0)
        toast.error(`Failed to import ${result.failed.length} Privy users`);
      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) onImportComplete?.();
    } catch (error) {
      console.error('Error importing Privy users:', error);
      toast.error(
        `Error importing Privy users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="default">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Import users from your Privy application by entering your App ID and App Secret.
        </AlertDescription>
      </Alert>
      <div className="space-y-4">
        {!configured ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="app-id">Privy App ID</Label>
              <Input
                id="app-id"
                value={appId}
                onChange={e => setAppId(e.target.value)}
                placeholder="Enter your Privy App ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="app-secret">Privy App Secret</Label>
              <Input
                id="app-secret"
                type="password"
                value={appSecret}
                onChange={e => setAppSecret(e.target.value)}
                placeholder="Enter your Privy App Secret"
              />
            </div>
            {configuring ? (
              <Button
                onClick={() => {
                  setConfigured(false);
                  setAppId('');
                  setAppSecret('');
                }}>
                Stop and Reset
              </Button>
            ) : (
              <Button onClick={handleConfigure} disabled={!appId || !appSecret}>
                Configure Privy
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Privy Connected</h3>
                <p className="text-sm text-muted-foreground">{privyUsers.length} users found</p>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfigured(false);
                    setPrivyUsers([]);
                  }}>
                  Change Credentials
                </Button>
                <Button variant="outline" size="sm" onClick={handleFetchUsers} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh Users'}
                </Button>
              </div>
            </div>

            {privyUsers.length > 0 ? (
              <UserSelectionList
                users={privyUsers}
                title="Privy Users"
                importButtonText={importing ? 'Importing...' : `Import Users`}
                isImporting={importing}
                onImport={async (selectedUserIds: string[]) => {
                  const usersToImport = privyUsers.filter(user =>
                    selectedUserIds.includes(user.walletAddress!)
                  );
                  await handleImport(usersToImport);
                }}
                columns={createPrivyUserColumns({
                  onCheckboxChange: (userId, checked) => {
                    setSelectedUsers(prev => ({
                      ...prev,
                      [userId]: checked,
                    }));
                  },
                  selectedUsers,
                })}
              />
            ) : (
              <Alert variant="default">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>No users found</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}
