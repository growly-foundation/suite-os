'use client';

import { ImportProgressDialog } from '@/components/app-users/integrations/import-progress-dialog';
import { ContractImportTab } from '@/components/app-users/integrations/sources/contract-import-tab';
import { ManualImportTab } from '@/components/app-users/integrations/sources/manual-import-tab';
import { NftHoldersImportTab } from '@/components/app-users/integrations/sources/nft-holders-import-tab';
import { PrivyImportTab } from '@/components/app-users/integrations/sources/privy-import-tab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, Code, ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { UserImportSource } from '@getgrowly/core';

import { PaddingLayout } from '../../layout';

type IntegrationOption = {
  id: UserImportSource;
  name: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

export default function ImportUsersPage() {
  const [activeIntegration, setActiveIntegration] = useState<UserImportSource>(
    UserImportSource.Privy
  );

  // Available integration options
  const integrationOptions: IntegrationOption[] = [
    {
      id: UserImportSource.Privy,
      name: 'Privy',
      description: 'Import users from your Privy application',
      disabled: false,
      icon: (
        <Image
          src={'/logos/integrations/privy-logo.jpg'}
          width={24}
          height={24}
          alt="Privy"
          className="rounded-full"
        />
      ),
    },
    {
      id: UserImportSource.Contract,
      name: 'Smart Contract',
      description: 'Import users who interacted with your contracts',
      disabled: false,
      icon: <Code className="h-5 w-5" />,
    },
    {
      id: UserImportSource.NftHolders,
      name: 'NFT Holders',
      description: 'Import users who hold your NFTs',
      disabled: false,
      icon: <ImageIcon className="h-5 w-5" />,
    },
    {
      id: UserImportSource.Manual,
      name: 'Upload from CSV or enter manually',
      description: 'Upload a CSV file or enter user details manually',
      disabled: false,
      icon: <Upload className="h-5 w-5" />,
    },
    {
      id: UserImportSource.Guildxyz,
      name: 'Guild.xyz',
      description: 'Import members from Guild.xyz communities',
      disabled: true,
      icon: (
        <Image
          src={'/logos/integrations/guildxyz-logo.jpg'}
          width={24}
          height={24}
          alt="Guild.xyz"
          className="rounded-full"
        />
      ),
    },
  ];

  return (
    <PaddingLayout>
      {/* Header */}
      <CardHeader>
        <div className="flex justify-between items-center gap-5">
          <div>
            <CardTitle className="text-xl">Import Users</CardTitle>
            <CardDescription>
              Import users from various sources into your organization
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <ImportProgressDialog />
            <Link href="/dashboard/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Sidebar with integration options */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sources</CardTitle>
              <CardDescription className="text-sm">
                Choose how you want to import users into your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {integrationOptions.map(option => (
                  <button
                    key={option.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors border-b border-border/50 last:border-b-0',
                      activeIntegration === option.id &&
                        'bg-primary text-primary-foreground hover:bg-primary/80',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={option.disabled ? undefined : () => setActiveIntegration(option.id)}>
                    <div
                      className={cn(
                        'mt-0.5',
                        activeIntegration === option.id && 'text-primary-foreground'
                      )}>
                      {option.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{option.name}</div>
                      <div
                        className={cn(
                          'text-xs text-muted-foreground',
                          activeIntegration === option.id && 'text-primary-foreground'
                        )}>
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent style={{ padding: '20px 0px' }}>
              {activeIntegration === UserImportSource.Manual && <ManualImportTab />}
              {activeIntegration === UserImportSource.Privy && <PrivyImportTab />}
              {activeIntegration === UserImportSource.Contract && <ContractImportTab />}
              {activeIntegration === UserImportSource.NftHolders && <NftHoldersImportTab />}
              {!integrationOptions.find(opt => opt.id === activeIntegration && !opt.disabled) && (
                <div className="p-4 text-center text-muted-foreground">
                  This integration is not yet available. Please select a different source.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PaddingLayout>
  );
}
