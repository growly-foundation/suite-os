'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImportLimitCheckResult } from '@/lib/services/user-import.service';
import { AlertTriangle, Users } from 'lucide-react';

interface ImportConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  limits: ImportLimitCheckResult;
  importType?: string;
}

export function ImportConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  limits,
  importType = 'users',
}: ImportConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Import Limit Exceeded
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div>
              You selected <strong>{selectedCount}</strong> {importType} to import, but you can only
              import <strong>{limits.maxAllowedImports}</strong> due to organization limits.
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Current usage:{' '}
                <strong>
                  {limits.currentUserCount}/{limits.maxUsers}
                </strong>{' '}
                users
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Would you like to import the first <strong>{limits.maxAllowedImports}</strong>{' '}
              {importType}?
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Import {limits.maxAllowedImports} {importType}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
