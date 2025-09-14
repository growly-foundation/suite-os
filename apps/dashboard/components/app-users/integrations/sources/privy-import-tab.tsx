'use client';

import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';
import { ImportConfirmationDialog } from '@/components/app-users/integrations/import-confirmation-dialog';
import { ImportProgress } from '@/components/app-users/integrations/import-progress';
import { UserLimitWarning } from '@/components/app-users/integrations/user-limit-warning';
import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loadable } from '@/components/ui/loadable';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useOrganizationUsersQuery } from '@/hooks/use-dashboard-queries';
import { ImportLimitCheckResult, UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Address } from 'viem';

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
  const [limits, setLimits] = useState<ImportLimitCheckResult | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingImportUsers, setPendingImportUsers] = useState<ImportPrivyUserOutput[]>([]);
  const { selectedOrganization } = useDashboardState();
  const { data: userData, isLoading: isLoadingUsers } = useOrganizationUsersQuery(
    selectedOrganization?.id
  );

  // Check organization limits when users are selected
  const checkOrganizationLimits = useCallback(async () => {
    if (!selectedOrganization?.id) return;

    const usersToImport = selectedUserIds.length;
    if (usersToImport === 0) {
      setLimits(null);
      return;
    }

    try {
      const limitsResult = await UserImportService.checkOrganizationLimits(
        selectedOrganization.id,
        usersToImport
      );
      setLimits(limitsResult);
    } catch (error) {
      console.error('Error checking organization limits:', error);
      toast.error('Failed to check organization limits');
    }
  }, [selectedOrganization?.id, selectedUserIds.length]);

  // Check limits when selected users change
  useEffect(() => {
    checkOrganizationLimits();
  }, [checkOrganizationLimits]);

  // Handle user selection change
  const handleUserSelectionChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

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
      const userMap = new Map(userData?.map(user => [user.entities?.['walletAddress'], user]));
      const response = await UserImportService.importPrivyUsers(appId, appSecret);
      setPrivyUsers(
        response.map(user => ({
          ...user,
          imported: userMap.has(user.walletAddress as Address),
        }))
      );
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
      toast.error('Please select at least one user to import');
      return;
    }

    // Check limits before attempting import
    if (!limits) {
      toast.error('Unable to check organization limits. Please try again.');
      return;
    }

    if (!limits.canImport) {
      toast.error(
        `Organization has reached the maximum limit of ${limits.maxUsers} users. Cannot import any additional users.`
      );
      return;
    }

    if (limits.exceedsLimit) {
      if (limits.maxAllowedImports === 0) {
        toast.error(
          `Cannot import any users. Organization is at capacity (${limits.currentUserCount}/${limits.maxUsers}).`
        );
        return;
      }

      // Show confirmation dialog for partial import
      setPendingImportUsers(usersToImport);
      setShowConfirmationDialog(true);
      return;
    }

    // Proceed with import
    await executeImport(usersToImport);
  };

  // Execute the actual import
  const executeImport = async (usersToImport: ImportPrivyUserOutput[]) => {
    setImporting(true);
    try {
      // Start async import
      const result = await UserImportService.commitImportedUsersAsync(
        usersToImport,
        selectedOrganization!.id
      );

      // Set job ID and show progress dialog
      setImportJobId(result.jobId);
      setShowImportProgress(true);

      toast.success(
        `Import started for ${usersToImport.length} users! Check the progress dialog for updates.`
      );
    } catch (error) {
      console.error('Error importing Privy users:', error);
      toast.error(
        `Error importing Privy users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  // Handle confirmation dialog
  const handleConfirmImport = () => {
    if (pendingImportUsers.length > 0 && limits) {
      // Limit the users to import
      const limitedUsers = pendingImportUsers.slice(0, limits.maxAllowedImports);
      toast.info(`Import limited to ${limits.maxAllowedImports} users due to organization limits.`);
      executeImport(limitedUsers);
    }
    setPendingImportUsers([]);
  };

  // Handle import completion
  const handleImportComplete = (result: any) => {
    if (result.status === 'completed') {
      // Don't show toast here - ImportProgressDialog handles it
      onImportComplete?.();
      // Redirect to users page after successful import
      router.push('/dashboard/users');
    } else if (result.status === 'failed') {
      // Don't show toast here - ImportProgressDialog handles it
      // Just trigger the completion callback
      onImportComplete?.();
    }
  };

  const handleReset = () => {
    setAppId('');
    setAppSecret('');
    setConfigured(false);
    setPrivyUsers([]);
    setSelectedUserIds([]);
    setLimits(null);
  };

  return (
    <>
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

        {/* Organization limit warning - shows only when users are selected */}
        {limits && selectedUserIds.length > 0 && (
          <div className="px-4">
            <UserLimitWarning limits={limits} usersToImport={selectedUserIds.length} />
          </div>
        )}

        <Loadable loading={isLoadingUsers} fallback={<AnimatedLoadingSmall />}>
          <div className="space-y-6">
            {!configured ? (
              <div className="space-y-4 px-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-id">
                      Privy App ID <span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="app-secret">
                      Privy App Secret <span className="text-red-500">*</span>
                    </Label>
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
                      setConfiguring(false);
                    }}>
                    Stop and Reset
                  </Button>
                ) : (
                  <Button
                    onClick={handleConfigure}
                    disabled={!appId || !appSecret || loading || configuring}>
                    Configure Privy
                  </Button>
                )}
              </div>
            ) : (
              <>
                <UserSelectionList
                  users={privyUsers}
                  importButtonText={importing ? 'Starting Import...' : `Import Selected Users`}
                  isImporting={importing}
                  limits={limits}
                  onImport={async (selectedUserIds: string[]) => {
                    const usersToImport = privyUsers.filter(
                      user => user.walletAddress && selectedUserIds.includes(user.walletAddress)
                    );
                    await handleImport(usersToImport);
                  }}
                  onSelectionChange={handleUserSelectionChange}
                  additionalActions={
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        Reset Configuration
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchUsers}
                        disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Privy Users'}
                      </Button>
                    </div>
                  }
                />
              </>
            )}
          </div>
        </Loadable>
      </div>

      {/* Import Confirmation Dialog */}
      {limits && (
        <ImportConfirmationDialog
          isOpen={showConfirmationDialog}
          onClose={() => {
            setShowConfirmationDialog(false);
            setPendingImportUsers([]);
          }}
          onConfirm={handleConfirmImport}
          selectedCount={pendingImportUsers.length}
          limits={limits}
          importType="Privy users"
        />
      )}

      {/* Import Progress Dialog */}
      <Dialog open={showImportProgress} onOpenChange={setShowImportProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Progress</DialogTitle>
            <DialogDescription>Importing Privy users into your organization.</DialogDescription>
          </DialogHeader>
          {importJobId && (
            <ImportProgress
              jobId={importJobId}
              onComplete={handleImportComplete}
              onClose={() => setShowImportProgress(false)}
              showClose={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
