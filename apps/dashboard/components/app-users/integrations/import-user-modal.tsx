'use client';

import { ContractImportTab } from '@/components/app-users/integrations/sources/contract-import-tab';
import { GuildImportTab } from '@/components/app-users/integrations/sources/guild-import-tab';
import { PrivyImportTab } from '@/components/app-users/integrations/sources/privy-import-tab';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Pre-load service definitions
import '@/lib/services/contract-user.service';
import '@/lib/services/guildxyz.service';
import '@/lib/services/privy.service';
import { ImportSource } from '@/lib/services/user-import.service';
import { cn } from '@/lib/utils';
import { Code, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

interface ImportUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

type IntegrationOption = {
  id: ImportSource;
  name: string;
  description: string;
  icon: React.ReactNode;
};

export function ImportUserModal({ open, onOpenChange, onImportComplete }: ImportUserModalProps) {
  const [activeIntegration, setActiveIntegration] = useState<ImportSource>('privy');

  // Handler for when import is completed from any source
  const handleImportComplete = () => {
    onImportComplete?.();
  };

  // Available integration options
  const integrationOptions: IntegrationOption[] = [
    {
      id: 'privy',
      name: 'Privy',
      description: 'Import users from your Privy application',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'guildxyz',
      name: 'Guild.xyz',
      description: 'Import members from Guild.xyz communities',
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: 'contract',
      name: 'Smart Contract',
      description: 'Import users who interacted with your contracts',
      icon: <Code className="h-5 w-5" />,
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
                      'bg-primary text-primary-foreground hover:bg-primary/80'
                  )}
                  onClick={() => setActiveIntegration(option.id)}>
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
            {activeIntegration === 'privy' && (
              <PrivyImportTab onImportComplete={handleImportComplete} />
            )}

            {activeIntegration === 'guildxyz' && (
              <GuildImportTab onImportComplete={handleImportComplete} />
            )}

            {activeIntegration === 'contract' && (
              <ContractImportTab onImportComplete={handleImportComplete} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
