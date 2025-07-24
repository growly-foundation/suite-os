'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardState } from '@/hooks/use-dashboard';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { ImportPrivyUserOutput } from '@getgrowly/core';

interface PrivyImportTabProps {
  onImportComplete?: () => void;
}

export function PrivyImportTab({ onImportComplete }: PrivyImportTabProps) {
  const router = useRouter();
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [privyUsers, setPrivyUsers] = useState<ImportPrivyUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const { selectedOrganization } = useDashboardState();

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
    if (!selectedOrganization?.id) {
      toast.error('No organization selected');
      return;
    }
    if (usersToImport.length === 0) {
      toast.warning('Please select at least one user to import');
      return;
    }

    setImporting(true);
    try {
      // Import users in batch
      const result = await UserImportService.commitImportedUsers(
        usersToImport,
        selectedOrganization?.id
      );
      // Show success/failure messages
      if (result.success.length > 0)
        toast.success(`Successfully imported ${result.success.length} Privy users`);
      if (result.failed.length > 0)
        toast.error(`Failed to import ${result.failed.length} Privy users`);
      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) {
        onImportComplete?.();
        // Redirect to users page after successful import
        router.push('/dashboard/users');
      }
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
    <div className="space-y-6">
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-2">Privy Integration</h2>
        <p className="text-muted-foreground text-sm">
          Import users from your Privy application by entering your App ID and App Secret.
        </p>
      </div>

      <div className="px-4">
        <Alert variant="default">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Suite does not store your credentials and this import is one-time.
          </AlertDescription>
        </Alert>
      </div>
      <div className="space-y-6">
        {!configured ? (
          <div className="space-y-4 px-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-id">Privy App ID</Label>
                <Input
                  id="app-id"
                  value={appId}
                  required
                  aria-describedby="app-id-error"
                  onChange={e => setAppId(e.target.value)}
                  placeholder="Enter your Privy App ID"
                />
                {!appId && (
                  <span id="app-id-error" className="text-xs text-red-500">
                    App ID is required
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-secret">Privy App Secret</Label>
                <Input
                  id="app-secret"
                  type="password"
                  value={appSecret}
                  required
                  aria-describedby="app-secret-error"
                  onChange={e => setAppSecret(e.target.value)}
                  placeholder="Enter your Privy App Secret"
                />
                {!appSecret && (
                  <span id="app-secret-error" className="text-xs text-red-500">
                    App Secret is required
                  </span>
                )}
              </div>
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
            <UserSelectionList
              users={privyUsers}
              importButtonText={importing ? 'Importing...' : `Import Users`}
              isImporting={importing}
              onImport={async (selectedUserIds: string[]) => {
                const usersToImport = privyUsers.filter(
                  user => user.walletAddress && selectedUserIds.includes(user.walletAddress)
                );
                await handleImport(usersToImport);
              }}
              additionalActions={
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
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
