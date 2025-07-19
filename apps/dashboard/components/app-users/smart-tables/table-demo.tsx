'use client';

import { useState } from 'react';

import { ImportPrivyUserOutput, ImportUserOutput, UserImportSource } from '@getgrowly/core';

import { Button } from '../../ui/button';
import { TableUserData } from './column-formatters';
import {
  EnhancedContractUserTable,
  EnhancedPrivyUserTable,
  EnhancedUserTable,
} from './enhanced-user-table';

// Mock data for demonstration
const mockPrivyUsers: ImportPrivyUserOutput[] = [
  {
    walletAddress: '0x1111111111111111111111111111111111111111',
    email: 'user1@example.com',
    source: UserImportSource.Privy,
  },
  {
    walletAddress: '0x2222222222222222222222222222222222222222',
    email: 'user2@example.com',
    source: UserImportSource.Privy,
  },
];

const mockContractUsers: ImportUserOutput[] = [
  {
    walletAddress: '0x3333333333333333333333333333333333333333',
    source: UserImportSource.Contract,
    extra: {
      interactionCount: 5,
      lastInteraction: '2024-01-15T00:00:00Z',
      tokenBalance: '1000 USDC',
    },
  },
  {
    walletAddress: '0x4444444444444444444444444444444444444444',
    source: UserImportSource.Contract,
    extra: {
      interactionCount: 12,
      lastInteraction: '2024-01-20T00:00:00Z',
      tokenBalance: '500 ETH',
    },
  },
];

export function TableDemo() {
  const [activeTab, setActiveTab] = useState<'privy' | 'contract' | 'mixed'>('privy');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleImportClick = () => {
    setShowImportModal(true);
    // In a real app, this would open an import modal
    console.log('Import button clicked');
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'privy':
        return (
          <EnhancedPrivyUserTable
            users={mockPrivyUsers}
            onImportClick={handleImportClick}
            importButtonText="Import from Privy"
          />
        );
      case 'contract':
        return (
          <EnhancedContractUserTable
            users={mockContractUsers}
            onImportClick={handleImportClick}
            importButtonText="Import from Contract"
          />
        );
      case 'mixed':
        const mixedData: TableUserData[] = [...mockPrivyUsers, ...mockContractUsers];
        return (
          <EnhancedUserTable
            data={mixedData}
            onImportClick={handleImportClick}
            importButtonText="Import Users"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dynamic Table Demo</h1>
        <div className="text-sm text-muted-foreground">
          Demonstrating the new dynamic table system with different data types
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'privy' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('privy')}>
          Privy Users
        </Button>
        <Button
          variant={activeTab === 'contract' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('contract')}>
          Contract Users
        </Button>
        <Button
          variant={activeTab === 'mixed' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('mixed')}>
          Mixed Data
        </Button>
      </div>

      {/* Table Display */}
      <div className="border rounded-lg p-6">{renderTable()}</div>

      {/* Features Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Dynamic Columns</h3>
          <p className="text-sm text-muted-foreground">
            Columns are automatically detected and displayed based on the data type.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Column Management</h3>
          <p className="text-sm text-muted-foreground">
            Use the "Views" button to show/hide columns and resize them by dragging.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Empty States</h3>
          <p className="text-sm text-muted-foreground">
            Proper placeholder handling when no data is available.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Type Safety</h3>
          <p className="text-sm text-muted-foreground">
            Full TypeScript support with proper type guards and validation.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Performance</h3>
          <p className="text-sm text-muted-foreground">
            Built on React Table v8 for optimal performance and features.
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Backward Compatible</h3>
          <p className="text-sm text-muted-foreground">
            Existing code continues to work while new features are available.
          </p>
        </div>
      </div>
    </div>
  );
}
