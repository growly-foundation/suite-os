'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardState } from '@/hooks/use-dashboard';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { ImportPrivyUserOutput } from '@getgrowly/core';

interface ContractImportTabProps {
  onImportComplete?: () => void;
}

export function ContractImportTab({ onImportComplete }: ContractImportTabProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [contractUsers, setContractUsers] = useState<ImportPrivyUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const { selectedOrganization } = useDashboardState();

  // Handle configuration
  const handleConfigure = async () => {
    if (!contractAddress || !chainId) {
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
      setContractUsers(response);
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
        toast.success(`Successfully imported ${result.success.length} contract users`);
      if (result.failed.length > 0)
        toast.error(`Failed to import ${result.failed.length} contract users`);
      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) {
        onImportComplete?.();
        // Redirect to users page after successful import
        window.location.href = '/dashboard/users';
      }
    } catch (error) {
      console.error('Error importing contract users:', error);
      toast.error(
        `Error importing contract users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-2">Smart Contract Integration</h2>
        <p className="text-muted-foreground text-sm">
          Import users who have interacted with your smart contract by entering the contract address
          and chain ID.
        </p>
      </div>

      <div className="px-4">
        <Alert variant="default">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Suite will fetch all users who have interacted with your contract on the specified
            chain.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {!configured ? (
          <div className="space-y-4 px-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chain-id">Chain ID</Label>
                <Input
                  id="chain-id"
                  type="number"
                  value={chainId}
                  onChange={e => setChainId(Number(e.target.value))}
                  placeholder="1 (Ethereum), 137 (Polygon), etc."
                />
              </div>
            </div>
            {configuring ? (
              <Button
                onClick={() => {
                  setConfigured(false);
                  setContractAddress('');
                  setChainId(0);
                }}>
                Stop and Reset
              </Button>
            ) : (
              <Button onClick={handleConfigure} disabled={!contractAddress || !chainId}>
                Configure Contract
              </Button>
            )}
          </div>
        ) : (
          <>
            <UserSelectionList
              users={contractUsers}
              importButtonText={importing ? 'Importing...' : `Import Users`}
              isImporting={importing}
              onImport={async (selectedUserIds: string[]) => {
                const usersToImport = contractUsers.filter(user =>
                  selectedUserIds.includes(user.walletAddress!)
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
                      setContractUsers([]);
                    }}>
                    Change Contract
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
