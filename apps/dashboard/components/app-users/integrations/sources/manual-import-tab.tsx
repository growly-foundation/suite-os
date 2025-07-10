'use client';

import { UserSelectionList } from '@/components/app-users/integrations/user-selection-list';
import { createManualUserColumns } from '@/components/app-users/smart-tables/import-user-tables/manual-user-columns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserImportService } from '@/lib/services/user-import.service';
import { Download, InfoIcon, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { ImportUserOutput, UserImportSource } from '@getgrowly/core';

interface ManualImportTabProps {
  onImportComplete?: () => void;
}

// Define the structure for a manually entered user
interface ManualUser {
  walletAddress: string;
  email?: string;
  name?: string;
}

export function ManualImportTab({ onImportComplete }: ManualImportTabProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ImportUserOutput[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  // Form state for manual entry
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');

        // Skip header row and parse each line
        const newUsers: ImportUserOutput[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const [walletAddress, email, name] = line.split(',').map(item => item.trim());

          if (walletAddress) {
            newUsers.push({
              walletAddress,
              email: email || undefined,
              name: name || undefined,
              source: UserImportSource.Manual,
            });
          }
        }

        if (newUsers.length === 0) {
          toast.warning('No valid users found in the CSV file');
          return;
        }

        // Add new users to the list, avoiding duplicates
        const existingWallets = new Set(users.map(u => u.walletAddress));
        const uniqueNewUsers = newUsers.filter(u => !existingWallets.has(u.walletAddress));

        setUsers(prevUsers => [...prevUsers, ...uniqueNewUsers]);
        toast.success(`${uniqueNewUsers.length} users successfully added from CSV`);

        // Reset the file input
        event.target.value = '';
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error(`Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
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
    if (users.some(u => u.walletAddress === walletAddress)) {
      toast.warning('A user with this wallet address already exists');
      return;
    }

    const newUser: ImportUserOutput = {
      walletAddress,
      email: email || undefined,
      name: name || undefined,
      source: UserImportSource.Manual,
    };

    setUsers(prevUsers => [...prevUsers, newUser]);

    // Reset form
    setWalletAddress('');
    setEmail('');
    setName('');

    toast.success('User added successfully');
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const header = 'walletAddress,email,name\n';
    const exampleRow = '0x123abc...,user@example.com,Example User';
    const content = header + exampleRow;

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import selected users
  const handleImport = async (selectedUserIds: string[]) => {
    if (selectedUserIds.length === 0) {
      toast.warning('Please select at least one user to import');
      return;
    }

    setImporting(true);
    try {
      const usersToImport = users.filter(user => selectedUserIds.includes(user.walletAddress!));

      // Import users in batch
      const result = await UserImportService.importBatch(UserImportSource.Manual, usersToImport);

      // Show success/failure messages
      if (result.success.length > 0)
        toast.success(`Successfully imported ${result.success.length} users`);
      if (result.failed.length > 0) toast.error(`Failed to import ${result.failed.length} users`);

      // If all successful, trigger completion callback
      if (result.failed.length === 0 && result.success.length > 0) onImportComplete?.();
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error(
        `Error importing users: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setImporting(false);
    }
  };

  // Remove a user from the list
  const handleRemoveUser = (walletAddress: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.walletAddress !== walletAddress));
    toast.success('User removed successfully');
  };

  return (
    <div className="space-y-4">
      <Alert variant="default">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Import users manually by entering their details below or by uploading a CSV file.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Add User Manually</h3>

            <div className="space-y-3">
              <div className="grid gap-2">
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

              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="User Name"
                />
              </div>

              <Button onClick={handleAddUser} disabled={!walletAddress} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add User
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">Upload CSV</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with columns for wallet addresses, emails (optional), and names
              (optional).
            </p>

            <div className="space-y-4">
              <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-1" /> Download CSV Template
              </Button>

              <div className="grid gap-2">
                <Label htmlFor="csv-file">Upload User CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {users.length > 0 ? (
          <UserSelectionList
            users={users}
            title="Manual Import"
            importButtonText={importing ? 'Importing...' : 'Import Users'}
            isImporting={importing}
            onImport={async selectedUserIds => await handleImport(selectedUserIds)}
            columns={createManualUserColumns({
              onCheckboxChange: (userId, checked) => {
                setSelectedUsers(prev => ({
                  ...prev,
                  [userId]: checked,
                }));
              },
              selectedUsers,
            })}
            renderAdditionalInfo={user => (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveUser(user.walletAddress!)}>
                <Trash className="h-4 w-4" />
              </Button>
            )}
          />
        ) : (
          <Alert variant="default">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              No users added yet. Enter details manually or upload a CSV file.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
