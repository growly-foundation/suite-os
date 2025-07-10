'use client';

import { MailIcon } from 'lucide-react';

import { ImportUserOutput } from '@getgrowly/core';

import { AdvancedColumnType, ColumnType, SmartTableColumn } from '../../types';
import { createIdentityColumns } from '../identity-columns';
import { HeadLabelWithIcon } from '../table-head-label';

/**
 * Creates column definitions for manually imported users
 *
 * @param options Configuration options including selection handler
 * @returns Array of column definitions for manually entered users
 */
export function createManualUserColumns({
  onCheckboxChange,
  selectedUsers,
}: {
  onCheckboxChange?: (userId: string, checked: boolean) => void;
  selectedUsers?: Record<string, boolean>;
}): SmartTableColumn<ImportUserOutput>[] {
  return [
    {
      type: AdvancedColumnType.BATCH,
      batchRenderer: (user?: ImportUserOutput): any =>
        createIdentityColumns({
          item: {
            id: user?.walletAddress,
            walletAddress: user?.walletAddress,
            name: user?.name,
            ...user,
          },
          onCheckboxChange,
          selectedUsers,
        } as any),
    },
    {
      key: 'email',
      sortable: true,
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
  ];
}
