'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ImportLimitCheckResult } from '@/lib/services/user-import.service';
import { AlertTriangle, Info, Users } from 'lucide-react';

interface UserLimitWarningProps {
  limits: ImportLimitCheckResult;
  usersToImport: number;
}

export function UserLimitWarning({ limits, usersToImport }: UserLimitWarningProps) {
  if (limits.canImport && !limits.exceedsLimit) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Import Ready</AlertTitle>
        <AlertDescription>
          You can import {usersToImport} users. Your organization has{' '}
          <Badge variant="outline">
            {limits.currentUserCount}/{limits.maxUsers}
          </Badge>{' '}
          users.
        </AlertDescription>
      </Alert>
    );
  }

  if (!limits.canImport) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Import Limit Reached</AlertTitle>
        <AlertDescription>
          Your organization has reached the maximum limit of {limits.maxUsers} users. You cannot
          import any additional users at this time.
        </AlertDescription>
      </Alert>
    );
  }

  if (limits.exceedsLimit) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Import Limit Exceeded</AlertTitle>
        <AlertDescription className="space-y-2">
          <div>
            You're trying to import {usersToImport} users, but you can only import{' '}
            <strong>{limits.maxAllowedImports}</strong> more users.
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4" />
            <span>
              Current usage:{' '}
              <Badge variant="outline">
                {limits.currentUserCount}/{limits.maxUsers}
              </Badge>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Only the first {limits.maxAllowedImports} users will be imported.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
