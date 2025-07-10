'use client';

import { Button } from '@/components/ui/button';
import { MailIcon, Trash } from 'lucide-react';

import { ImportUserOutput } from '@getgrowly/core';

import { ColumnType, SmartTableColumn } from '../../types';
import { HeadLabelWithIcon } from '../table-head-label';

/**
 * Creates column definitions for manually imported users
 *
 * @param options Configuration options including selection handler
 * @returns Array of column definitions for manually entered users
 */
export function createManualUserColumns({
  handleRemoveUser,
}: {
  handleRemoveUser: (userId: string) => void;
}): SmartTableColumn<ImportUserOutput>[] {
  return [
    {
      key: 'email',
      sortable: true,
      border: false,
      header: (
        <HeadLabelWithIcon
          icon={<MailIcon className="h-3 w-3 text-muted-foreground" />}
          label="Email"
        />
      ),
      className: 'w-[250px]',
      type: ColumnType.STRING,
      dataExtractor: (user: ImportUserOutput) => user.email || '—',
      contentRenderer: (email: string) => <span className="text-sm">{email}</span>,
    },
    {
      key: 'actions',
      type: ColumnType.COMPONENT,
      border: false,
      header: (
        <HeadLabelWithIcon
          icon={<Trash className="h-3 w-3 text-muted-foreground" />}
          label="Actions"
        />
      ),
      dataExtractor: () => undefined,
      contentRenderer: (user: ImportUserOutput) => (
        <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.walletAddress!)}>
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];
}
