'use client';

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
import { Separator } from '@/components/ui/separator';
import { useDashboardState } from '@/hooks/use-dashboard';
import { ImportLimitCheckResult, UserImportService } from '@/lib/services/user-import.service';
import { Download, InfoIcon, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { ImportUserOutput, UserImportSource } from '@getgrowly/core';

interface ManualImportTabProps {
  onImportComplete?: () => void;
}

export function ManualImportTab({ onImportComplete }: ManualImportTabProps) {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<ImportUserOutput[]>([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [importing, setImporting] = useState(false);
  const [limits, setLimits] = useState<ImportLimitCheckResult | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingImportUsers, setPendingImportUsers] = useState<ImportUserOutput[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 50; // Show 50 users per page for imports

  const { selectedOrganization } = useDashboardState();

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

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        // Parse CSV (assuming first line might be headers)
        const headers = lines[0]
          .toLowerCase()
          .split(',')
          .map(h => h.trim());
        const dataStartIndex =
          headers.includes('wallet') || headers.includes('address') || headers.includes('email')
            ? 1
            : 0;

        const newUsers: ImportUserOutput[] = [];

        for (let i = dataStartIndex; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length === 0 || !values[0]) continue;

          const user: ImportUserOutput = {
            walletAddress: values[0],
            email: values[1] || undefined,
            name: values[2] || undefined,
            source: UserImportSource.Manual,
          };

          if (user.walletAddress) {
            newUsers.push(user);
          }
        }

        // Add new users to the list, avoiding duplicates
        const existingWallets = new Set(allUsers.map(u => u.walletAddress));
        const uniqueNewUsers = newUsers.filter(u => !existingWallets.has(u.walletAddress));

        setAllUsers(prevUsers => [...prevUsers, ...uniqueNewUsers]);
        toast.success(`${uniqueNewUsers.length} users successfully added from CSV`);

        // Reset the file input
        event.target.value = '';
      } catch (error) {
        toast.error('Failed to parse CSV file. Please ensure it follows the correct format.');
        console.error('CSV parsing error:', error);
      }
    };

    reader.readAsText(file);
  };

  // Handle manual user addition
  const handleAddUser = () => {
    if (!walletAddress) {
      toast.warning('Wallet address is required');
      return;
    }

    // Check if the wallet address is already in the list
    if (allUsers.some(u => u.walletAddress === walletAddress)) {
      toast.warning('A user with this wallet address already exists');
      return;
    }

    const newUser: ImportUserOutput = {
      walletAddress,
      email: email || undefined,
      name: name || undefined,
      source: UserImportSource.Manual,
    };

    setAllUsers(prevUsers => [...prevUsers, newUser]);

    // Reset form
    setWalletAddress('');
    setEmail('');
    setName('');

    toast.success('User added successfully');
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csvContent = 'wallet_address,email,name\n0x1234567890abcdef,user@example.com,John Doe';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Import selected users
  const handleImport = async (usersToImport: ImportUserOutput[]) => {
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
  const executeImport = async (usersToImport: ImportUserOutput[]) => {
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
      console.error('Error importing users:', error);
      toast.error(
        `Error importing users: ${error instanceof Error ? error.message : String(error)}`
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

  // Pagination logic - show users progressively as user scrolls
  // This enables smooth infinite loading for large user lists (e.g., 1000+ manually added users)
  const displayedUsers = useMemo(() => {
    const endIndex = (currentPage + 1) * PAGE_SIZE;
    return allUsers.slice(0, endIndex);
  }, [allUsers, currentPage]);

  // Check if there are more users to load
  const hasMore = useMemo(() => {
    return displayedUsers.length < allUsers.length;
  }, [displayedUsers.length, allUsers.length]);

  // Handle loading more users when user scrolls near bottom
  const handleLoadMore = useCallback(async ({ page }: { page: number; pageSize: number }) => {
    try {
      setLoadingMore(true);
      // Small delay for smooth UX and to prevent rapid fire requests
      await new Promise(resolve => setTimeout(resolve, 300));
      setCurrentPage(page - 1); // Convert to 0-based indexing
    } finally {
      setLoadingMore(false);
    }
  }, []);

  // Remove a user from the list
  const handleRemoveUser = (walletAddress: string) => {
    setAllUsers(prevUsers => prevUsers.filter(u => u.walletAddress !== walletAddress));
    toast.success('User removed successfully');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-2">Manual Import</h2>
          <p className="text-muted-foreground text-sm">
            Add users manually or upload a CSV file with wallet addresses, emails, and names.
          </p>
        </div>

        <div className="px-4">
          <Alert variant="default">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You can add users one by one or upload a CSV file. The CSV should have columns for
              wallet address (required), email (optional), and name (optional).
            </AlertDescription>
          </Alert>
        </div>

        {/* Organization limit warning - shows only when users are selected */}
        {limits && selectedUserIds.length > 0 && (
          <div className="px-4">
            <UserLimitWarning limits={limits} usersToImport={selectedUserIds.length} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-md font-semibold">Add User Manually</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-address">
                  Wallet Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <Button onClick={handleAddUser} disabled={!walletAddress} className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-md font-semibold">Upload CSV</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with columns for wallet addresses, emails (optional), and names
              (optional).
            </p>

            <div className="space-y-4">
              <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-1" /> Download CSV Template
              </Button>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer border"
              />
            </div>
          </div>
        </div>
        <Separator />
        {allUsers.length > 0 ? (
          <div className="h-[600px] overflow-hidden">
            <UserSelectionList
              users={displayedUsers}
              importButtonText={importing ? 'Starting Import...' : 'Import Selected Users'}
              isImporting={importing}
              limits={limits}
              // Pagination props
              pageSize={PAGE_SIZE}
              currentPage={currentPage + 1} // Convert to 1-based for DynamicTable
              totalItems={allUsers.length}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
              // Container height for proper scrolling
              height="h-[600px]"
              onImport={async (selectedUserIds: string[]) => {
                const usersToImport = allUsers.filter(
                  user => user.walletAddress && selectedUserIds.includes(user.walletAddress)
                );
                await handleImport(usersToImport);
              }}
              onSelectionChange={handleUserSelectionChange}
            />
          </div>
        ) : (
          <Alert variant="default">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              No users added yet. Enter details manually or upload a CSV file.
            </AlertDescription>
          </Alert>
        )}
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
          importType="users"
        />
      )}

      {/* Import Progress Dialog */}
      <Dialog open={showImportProgress} onOpenChange={setShowImportProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Progress</DialogTitle>
            <DialogDescription>Importing users into your organization.</DialogDescription>
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
