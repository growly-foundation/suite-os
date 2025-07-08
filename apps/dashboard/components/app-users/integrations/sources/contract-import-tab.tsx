'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
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
import {
  ContractUser,
  ContractUserService,
  SmartContract,
} from '@/lib/services/contract-user.service';
import { UserImportService } from '@/lib/services/user-import.service';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ContractImportTabProps {
  onImportComplete?: () => void;
}

export function ContractImportTab({ onImportComplete }: ContractImportTabProps) {
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState('1'); // Default to Ethereum Mainnet
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState<SmartContract | null>(null);
  const [contractUsers, setContractUsers] = useState<ContractUser[]>([]);
  const [importing, setImporting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'holders' | 'interactions'>('all');

  // Create a service instance
  const contractService = new ContractUserService();

  // Get users from a contract
  const handleSearch = async () => {
    if (!contractAddress) return;

    setLoading(true);
    try {
      // Get contract info
      const contractInfo = await contractService.getContractInfo(
        contractAddress,
        parseInt(chainId, 10)
      );

      if (!contractInfo) {
        toast.error('Could not retrieve contract information');
        return;
      }

      setContract(contractInfo);

      // Get users based on filter type
      const users = await contractService.getContractUsers(contractAddress, parseInt(chainId, 10), {
        tokenHolders: filterType === 'holders' || filterType === 'all',
        minTransactions: filterType === 'interactions' ? 1 : undefined,
      });

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
  const handleImport = async (usersToImport: ContractUser[]) => {
    if (!contractAddress || !chainId) return;

    if (usersToImport.length === 0) {
      toast.warning('Please select at least one user to import');
      return;
    }

    setImporting(true);
    try {
      // Import users in batch
      const result = await UserImportService.importBatch('contract', usersToImport, {
        contractAddress,
        chainId,
        filter: filterType,
      });

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

  // List of chains
  const chains = [
    { id: '1', name: 'Ethereum Mainnet' },
    { id: '137', name: 'Polygon' },
    { id: '56', name: 'BSC' },
    { id: '43114', name: 'Avalanche' },
    { id: '10', name: 'Optimism' },
    { id: '42161', name: 'Arbitrum' },
  ];

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
            <Select value={chainId} onValueChange={setChainId}>
              <SelectTrigger id="chain-id">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {chains.map(chain => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {contract.chainId} ({chains.find(c => c.id === String(contract.chainId))?.name})
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
            users={contractUsers.map(user => ({
              id: user.address,
              displayName: `${user.address.substring(0, 8)}...${user.address.substring(user.address.length - 4)}`,
              subtitle: user.tokenBalance
                ? `Balance: ${user.tokenBalance}`
                : user.transactionCount
                  ? `Txns: ${user.transactionCount}`
                  : '',
              metadata: user,
            }))}
            title="Contract Users"
            importButtonText={importing ? 'Importing...' : 'Import Users'}
            isImporting={importing}
            onImport={async (selectedUserIds: string[]) => {
              const usersToImport = contractUsers.filter(user =>
                selectedUserIds.includes(user.address)
              );
              await handleImport(usersToImport);
            }}
          />
        )}
      </div>
    </div>
  );
}
