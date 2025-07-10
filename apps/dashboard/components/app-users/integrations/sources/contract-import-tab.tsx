'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { createContractUserColumns } from '@/components/app-users/smart-tables/import-user-tables/contract-user-columns';
import { ChainSelector, SUPPORTED_CHAINS } from '@/components/chains/chain-selecter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Chain } from 'viem';

import { ImportUserOutput, UserImportSource } from '@getgrowly/core';

type SmartContract = {
  address: string;
  chainId: Chain['id'];
  name?: string;
  type?: string;
};
interface ContractImportTabProps {
  onImportComplete?: () => void;
}

export function ContractImportTab({ onImportComplete }: ContractImportTabProps) {
  const [selectedChain, setSelectedChain] = useState<Chain['id']>(1);
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<SmartContract | null>(null);
  const [contractUsers, setContractUsers] = useState<ImportUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'holders' | 'interactions'>('all');

  // Get users from a contract
  const handleSearch = async () => {
    if (!contractAddress) return;

    setLoading(true);
    try {
      // TODO: Set smart contract details
      setContract(null);

      const users: ImportUserOutput[] = [];
      if (users.length > 0) {
        setContractUsers(users);
      } else {
        toast.warning('No users found for this contract');
      }
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
  const handleImport = async (usersToImport: ImportUserOutput[]) => {
    if (!contractAddress || !selectedChain) return;

    if (usersToImport.length === 0) {
      toast.warning('Please select at least one user to import');
      return;
    }

    setImporting(true);
    try {
      // Import users in batch
      const result = await UserImportService.importBatch(UserImportSource.Contract, usersToImport);

      // Show success/failure messages
      if (result.success.length > 0) {
        toast.success(`Successfully imported ${result.success.length} contract users`);
      }

      if (result.failed.length > 0) {
        toast.error(`Failed to import ${result.failed.length} contract users`);
      }

      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) {
        onImportComplete?.();
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
    <div className="space-y-4">
      <Alert variant="default" className="bg-muted">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Import users who have interacted with or hold tokens from a smart contract.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <div className="flex gap-2 items-end">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input
              id="contract-address"
              placeholder="Enter smart contract address"
              value={contractAddress}
              onChange={e => setContractAddress(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Label htmlFor="chain-id">Chain</Label>
            <ChainSelector value={selectedChain} onChange={setSelectedChain} />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="filter-type">Filter Type</Label>
            <Select
              value={filterType}
              onValueChange={(value: 'all' | 'holders' | 'interactions') => setFilterType(value)}>
              <SelectTrigger id="filter-type">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="holders">Token Holders</SelectItem>
                <SelectItem value="interactions">Contract Interactions</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSearch} disabled={loading || !contractAddress}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {contract && (
          <div className="border rounded-md p-4">
            <h3 className="font-semibold">Contract Details</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="text-muted-foreground">Address:</div>
              <div className="font-mono">{contract.address}</div>
              <div className="text-muted-foreground">Chain ID:</div>
              <div>
                {contract.chainId} ({SUPPORTED_CHAINS.find(c => c.id === contract.chainId)?.name})
              </div>
              {contract.name && (
                <>
                  <div className="text-muted-foreground">Name:</div>
                  <div>{contract.name}</div>
                </>
              )}
              {contract.type && (
                <>
                  <div className="text-muted-foreground">Type:</div>
                  <div>{contract.type}</div>
                </>
              )}
            </div>
          </div>
        )}
        {contractUsers.length > 0 && (
          <UserSelectionList
            users={contractUsers}
            importButtonText={importing ? 'Importing...' : 'Import Users'}
            isImporting={importing}
            onImport={async (selectedUserIds: string[]) => {
              const usersToImport = contractUsers.filter(user =>
                selectedUserIds.includes(user.walletAddress!)
              );
              await handleImport(usersToImport);
            }}
            columns={createContractUserColumns()}
          />
        )}
      </div>
    </div>
  );
}
