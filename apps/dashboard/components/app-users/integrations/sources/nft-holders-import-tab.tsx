'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDashboardState } from '@/hooks/use-dashboard';
import { UserImportService } from '@/lib/services/user-import.service';
import { detectAddressType } from '@/utils/contract';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { base } from 'viem/chains';

import { ImportNftHoldersOutput } from '@getgrowly/core';

interface NftHoldersImportTabProps {
  onImportComplete?: () => void;
}

export function NftHoldersImportTab({ onImportComplete }: NftHoldersImportTabProps) {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState<number>(base.id);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [nftHoldersUsers, setNftHoldersUsers] = useState<ImportNftHoldersOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const { selectedOrganization } = useDashboardState();
  const [contractType, setContractType] = useState<string | null>('');
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    const validateContractAddress = async () => {
      setLoading(true);
      if (contractAddress) {
        if (!contractAddress.startsWith('0x')) {
          setAddressError('Address must start with 0x');
          setContractType(null);
          return;
        } else {
          setAddressError(null);
        }
        const type = await detectAddressType(contractAddress as `0x${string}`, chainId);
        if (type === 'Wallet (EOA)') {
          setAddressError(
            'Invalid contract address: Address not found or is an EOA (Externally Owned Account)'
          );
          setContractType(null);
        }

        if (type === 'ERC721' || type === 'ERC1155') {
          setContractType(type);
          setAddressError(null);
        } else {
          setAddressError(
            'Invalid contract address: Address not found or is not an ERC721 or ERC1155 contract'
          );
          setContractType(null);
        }
      } else {
        setContractType(null);
        setAddressError(null);
      }
      setLoading(false);
    };

    validateContractAddress();
  }, [contractAddress, chainId]);

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
      const response = await UserImportService.importNftHolders(contractAddress, chainId);
      console.log(response);
      setNftHoldersUsers(response);
      setConfigured(true);
    } catch (error) {
      console.error('Error fetching NFT holders users:', error);
      toast.error(
        `Error fetching NFT holders users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Import selected users
  const handleImport = async (usersToImport: ImportNftHoldersOutput[]) => {
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
        toast.success(`Successfully imported ${result.success.length} NFT holders users`);
      if (result.failed.length > 0)
        toast.error(`Failed to import ${result.failed.length} NFT holders users`);
      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) {
        onImportComplete?.();
        // Redirect to users page after successful import
        router.push('/dashboard/users');
      }
    } catch (error) {
      console.error('Error importing NFT holders users:', error);
      toast.error(
        `Error importing NFT holders users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-2">NFT Holders Integration</h2>
        <p className="text-muted-foreground text-sm">
          Import users who have held your NFTs by entering the contract address and chain ID.
        </p>
      </div>

      <div className="px-4">
        <Alert variant="default">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Suite will fetch all users who have held your NFTs on the specified chain.
            <br />
            <p className="text-muted-foreground text-sm mt-2 italic">
              At the current stage, maximum 1000 users can be imported. If you need more, contact us
              at{' '}
              <a href="mailto:team@getsuite.io" className="text-blue-500">
                team@getsuite.io
              </a>
              .
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        {!configured ? (
          <div className="space-y-4 px-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract-address">
                  Contract Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contract-address"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                  placeholder="0x..."
                />
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
                <select
                  id="chainId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={chainId}
                  onChange={e => setChainId(Number(e.target.value))}>
                  <option value="1">1 - Ethereum Mainnet</option>
                  <option value="8453">8453 - Base</option>
                </select>
              </div>
            </div>
            {configuring ? (
              <Button
                onClick={() => {
                  setConfigured(false);
                  setContractAddress('');
                  setConfiguring(false);
                  setChainId(0);
                }}>
                Stop and Reset
              </Button>
            ) : (
              <Button
                onClick={handleConfigure}
                disabled={!contractAddress || !chainId || !!addressError || loading}>
                Configure NFT Contract
              </Button>
            )}
          </div>
        ) : (
          <>
            <UserSelectionList
              users={nftHoldersUsers}
              importButtonText={importing ? 'Importing...' : `Import Users`}
              isImporting={importing}
              onImport={async (selectedUserIds: string[]) => {
                const usersToImport = nftHoldersUsers.filter(
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
                      setNftHoldersUsers([]);
                    }}>
                    Change NFT Contract
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleFetchUsers} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh NFT Holders'}
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
