'use client';

import { ContractImportTab } from '@/components/app-users/integrations/sources/contract-import-tab';
import { PrivyImportTab } from '@/components/app-users/integrations/sources/privy-import-tab';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Code, File } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { UserImportSource } from '@getgrowly/core';

interface ImportUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

type IntegrationOption = {
  id: UserImportSource;
  name: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

export function ImportUserModal({ open, onOpenChange, onImportComplete }: ImportUserModalProps) {
  const [activeIntegration, setActiveIntegration] = useState<UserImportSource>(
    UserImportSource.Privy
  );

  // Handler for when import is completed from any source
  const handleImportComplete = () => {
    onImportComplete?.();
  };

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
      id: UserImportSource.Csv,
      name: 'Upload from CSV',
      description: 'Import users from a CSV file',
      disabled: false,
      icon: <File className="h-5 w-5" />,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] border-none p-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Sidebar with integration options */}
          <div className="w-64 bg-muted border-r border-border">
            <DialogHeader className="p-4 border-b border-border">
              <DialogTitle className="text-md">Import Users</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col py-2">
              {integrationOptions.map(option => (
                <button
                  key={option.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-neutral-300/40 text-left transition-colors',
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
          </div>
          {/* Content area */}
          <div className="flex-1 p-6 mt-6 overflow-y-auto">
            {activeIntegration === UserImportSource.Privy && (
              <PrivyImportTab onImportComplete={handleImportComplete} />
            )}
            {activeIntegration === UserImportSource.Contract && (
              <ContractImportTab onImportComplete={handleImportComplete} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
