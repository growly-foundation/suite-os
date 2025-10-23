'use client';

import { ImportConfirmationDialog } from '@/components/app-users/integrations/import-confirmation-dialog';
import { ImportProgress } from '@/components/app-users/integrations/import-progress';
import { UserLimitWarning } from '@/components/app-users/integrations/user-limit-warning';
import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { ChainSelector } from '@/components/chains/chain-selecter';
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
import { getChainsWithFeature } from '@/core/chain-features';
import { useChainConfig } from '@/hooks/use-chain-config';
import { useDashboardState } from '@/hooks/use-dashboard';
import { UserImportService } from '@/lib/services/user-import.service';
import { debounce } from '@/lib/utils';
import { ChainFeatureKey } from '@/types/chains';
import { detectAddressType } from '@/utils/contract';
import { InfoIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { mainnet } from 'viem/chains';

import { ImportContractUserOutput, ImportLimitCheckResult } from '@getgrowly/core';

interface ContractImportTabProps {
  onImportComplete?: () => void;
}

export function ContractImportTab({ onImportComplete }: ContractImportTabProps) {
  const router = useRouter();
  const { hasChainsConfigured } = useChainConfig();
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState<number>(mainnet.id);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [allContractUsers, setAllContractUsers] = useState<ImportContractUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const [limits, setLimits] = useState<ImportLimitCheckResult | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [showImportProgress, setShowImportProgress] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingImportUsers, setPendingImportUsers] = useState<ImportContractUserOutput[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 50; // Show 50 users per page for imports

  const { selectedOrganization } = useDashboardState();
  const [contractType, setContractType] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [validationCompleted, setValidationCompleted] = useState(false);

  // Filter supported chains to only include those that support contract imports
  const contractImportSupportedChainIds = useMemo(() => {
    const configuredIds = selectedOrganization?.supported_chain_ids;
    if (!configuredIds || configuredIds.length === 0) {
      // If no organization config, use chains that support contract imports
      return getChainsWithFeature(ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS);
    }

    // Filter configured chains to only include those that support contract imports
    return configuredIds.filter(id =>
      getChainsWithFeature(ChainFeatureKey.SUPPORTS_CONTRACT_IMPORTS).includes(id)
    );
  }, [selectedOrganization?.supported_chain_ids]);

  const validationSeq = useRef(0);
  useEffect(
    () => () => {
      validationSeq.current++;
    },
    []
  );
  const debouncedValidateContractAddress = useMemo(
    () =>
      debounce(async (address: string, chain: number) => {
        const seq = ++validationSeq.current;
        setLoading(true);

        if (address) {
          if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            setAddressError('Address must start with 0x');
            setContractType(null);
            setValidationCompleted(true);
            setLoading(false);
            return;
          } else {
            setAddressError(null);
          }
          try {
            const type = await detectAddressType(address as `0x${string}`, chain);
            if (seq !== validationSeq.current) return;
            if (type === 'Wallet (EOA)') {
              setAddressError(
                'Invalid contract address: Address not found or is an EOA (Externally Owned Account)'
              );
              setContractType(null);
              setValidationCompleted(true);
            } else {
              setContractType(type);
              setValidationCompleted(true);
            }
          } catch (error) {
            console.error('Error detecting address type:', error);
            if (seq !== validationSeq.current) return;
            setAddressError(
              'Error validating contract address. Please check the address and try again.'
            );
            setContractType(null);
            setValidationCompleted(true);
          }
        } else {
          setContractType(null);
          setAddressError(null);
          setValidationCompleted(true);
        }
        if (seq === validationSeq.current) setLoading(false);
      }, 500),
    [setLoading, setAddressError, setContractType, setValidationCompleted]
  );

  useEffect(() => {
    // Set initial chain to the first contract import supported chain or mainnet
    const firstContractChain = contractImportSupportedChainIds?.[0] ?? mainnet.id;
    setChainId(firstContractChain);
  }, [contractImportSupportedChainIds]);

  useEffect(() => {
    if (contractAddress) {
      setValidationCompleted(false);
      setAddressError(null);
      setContractType(null);
    }
    debouncedValidateContractAddress(contractAddress, chainId);
  }, [contractAddress, chainId, debouncedValidateContractAddress]);

  // Check organization limits when users are fetched or selected users change
  const checkOrganizationLimitsInternal = async () => {
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
  };

  const checkOrganizationLimits = useCallback(debounce(checkOrganizationLimitsInternal, 500), [
    selectedOrganization?.id,
    selectedUserIds,
  ]);

  // Check limits when selected users change
  useEffect(() => {
    checkOrganizationLimits();
  }, [checkOrganizationLimits]);

  // Handle configuration
  const handleConfigure = async () => {
    if (!contractAddress || !chainId || !contractType) {
      toast.error('Please provide both contract address and chain ID');
      return;
    }

    setConfiguring(true);
    try {
      // Fetch users
      await handleFetchUsers();
    } catch (error) {
      console.error('Error configuring contract:', error);
      toast.error(
        `Error configuring contract: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setConfiguring(false);
    }
  };

  // Fetch contract users
  const handleFetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserImportService.importContractUsers(contractAddress, chainId);
      setAllContractUsers(response);
      setConfigured(true);
    } catch (error) {
      console.error('Error fetching contract users:', error);
      toast.error(
        `Error fetching contract users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle user selection change
  const handleUserSelectionChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  // Import selected users
  const handleImport = async (usersToImport: ImportContractUserOutput[]) => {
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
  const executeImport = async (usersToImport: ImportContractUserOutput[]) => {
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
      console.error('Error importing contract users:', error);
      toast.error(
        `Error importing contract users: ${error instanceof Error ? error.message : String(error)}`
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
      onImportComplete?.();
      // Show summary if there were failures
      if (result.failedCount > 0) {
        toast.warning(
          `Import completed with ${result.failedCount} failures. Check the users page for details.`
        );
      }
      // Small delay to allow user to see the completion message
      setTimeout(() => {
        router.push('/dashboard/users');
      }, 1500);
    } else if (result.status === 'failed') {
      // Don't show toast here - ImportProgressDialog handles it
      // Just trigger the completion callback
      onImportComplete?.();
    }
  };

  // Pagination logic - show users progressively as user scrolls
  // This enables smooth infinite loading for large user lists (e.g., 1000 contract users)
  const displayedUsers = useMemo(() => {
    const endIndex = (currentPage + 1) * PAGE_SIZE;
    return allContractUsers.slice(0, endIndex);
  }, [allContractUsers, currentPage]);

  // Check if there are more users to load
  const hasMore = useMemo(() => {
    return displayedUsers.length < allContractUsers.length;
  }, [displayedUsers.length, allContractUsers.length]);

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

  return (
    <>
      <div className="space-y-6">
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-2">Smart Contract Integration</h2>
          <p className="text-muted-foreground text-sm">
            Import users who have interacted with your smart contract by entering the contract
            address and chain ID.
          </p>
        </div>

        <div className="px-4">
          <Alert variant="default">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Suite will fetch all users who have interacted with your contract on the specified
              chain.
              <br />
              <p className="text-muted-foreground text-sm mt-2 italic">
                At the current stage, only recent 10,000 transactions will be analyzed, and one
                organization can only have maximum 500 users. If you need more, contact us at{' '}
                <a href="mailto:team@getsuite.io" className="text-blue-500">
                  team@getsuite.io
                </a>
                .
              </p>
            </AlertDescription>
          </Alert>
        </div>

        {/* Organization limit warning - shows only when users are selected */}
        {limits && selectedUserIds.length > 0 && (
          <div className="px-4">
            <UserLimitWarning limits={limits} usersToImport={selectedUserIds.length} />
          </div>
        )}

        <div className="space-y-6">
          {!configured ? (
            <div className="space-y-4 px-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-address">
                    Contract Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="contract-address"
                      value={contractAddress}
                      onChange={e => setContractAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1"
                    />
                    {loading && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Validating...</span>
                      </>
                    )}
                  </div>
                  {addressError ? (
                    <p className="text-red-500 text-sm">{addressError}</p>
                  ) : (
                    contractType !== null && (
                      <p className="text-muted-foreground text-sm">
                        Detected Contract Type: {contractType}
                      </p>
                    )
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chain-id">
                    Chain ID <span className="text-red-500">*</span>
                  </Label>
                  <ChainSelector
                    value={chainId}
                    onChange={setChainId}
                    supportedChainIds={contractImportSupportedChainIds}
                  />
                  {!hasChainsConfigured && (
                    <p className="text-sm text-muted-foreground">
                      Please configure your blockchain networks in{' '}
                      <a
                        href="/dashboard/settings"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer">
                        Settings
                      </a>{' '}
                      to select a network.
                    </p>
                  )}
                </div>
              </div>
              {configuring ? (
                <Button
                  onClick={() => {
                    setConfigured(false);
                    setContractAddress('');
                    setConfiguring(false);
                    setChainId(contractImportSupportedChainIds?.[0] ?? mainnet.id);
                    setValidationCompleted(false);
                    setAddressError(null);
                    setContractType(null);
                  }}>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Stop and Reset
                </Button>
              ) : (
                <Button
                  onClick={handleConfigure}
                  disabled={
                    !contractAddress ||
                    !chainId ||
                    !!addressError ||
                    loading ||
                    !validationCompleted
                  }>
                  Configure Contract
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="h-[600px] overflow-hidden">
                <UserSelectionList
                  users={displayedUsers}
                  importButtonText={importing ? 'Starting Import...' : `Import Selected Users`}
                  isImporting={importing}
                  limits={limits}
                  // Pagination props
                  pageSize={PAGE_SIZE}
                  currentPage={currentPage + 1} // Convert to 1-based for DynamicTable
                  totalItems={allContractUsers.length}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  // Container height for proper scrolling
                  height="h-[600px]"
                  onImport={async (selectedUserIds: string[]) => {
                    const usersToImport = allContractUsers.filter(
                      user => user.walletAddress && selectedUserIds.includes(user.walletAddress)
                    );
                    await handleImport(usersToImport);
                  }}
                  onSelectionChange={handleUserSelectionChange}
                  additionalActions={
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setConfigured(false);
                          setAllContractUsers([]);
                          setSelectedUserIds([]);
                          setLimits(null);
                          setCurrentPage(0);
                          setValidationCompleted(false);
                          setAddressError(null);
                          setContractType(null);
                        }}>
                        Change Contract
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleFetchUsers}
                        disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Contract Users'}
                      </Button>
                    </div>
                  }
                />
              </div>
            </>
          )}
        </div>
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
          importType="contract users"
        />
      )}

      {/* Import Progress Dialog */}
      <Dialog open={showImportProgress} onOpenChange={setShowImportProgress}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Progress</DialogTitle>
            <DialogDescription>Importing contract users into your organization.</DialogDescription>
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
