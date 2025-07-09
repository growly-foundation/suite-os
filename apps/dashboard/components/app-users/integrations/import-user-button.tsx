'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

import { ImportUserModal } from './import-user-modal';

interface ImportUserButtonProps {
  onImportComplete?: () => void;
}

export function ImportUserButton({ onImportComplete }: ImportUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImportComplete = () => {
    setIsOpen(false);
    onImportComplete?.();
  };

  return (
    <React.Fragment>
      <PrimaryButton onClick={() => setIsOpen(true)}>
        <RefreshCw className="mr-1 h-4 w-4" />
        Import Users
      </PrimaryButton>
      <ImportUserModal
        open={isOpen}
        onOpenChange={setIsOpen}
        onImportComplete={handleImportComplete}
      />
    </React.Fragment>
  );
}
