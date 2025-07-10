'use client';

import { MailIcon } from 'lucide-react';

import { ImportPrivyUserOutput } from '@getgrowly/core';

import { AdvancedColumnType, ColumnType, SmartTableColumn } from '../../types';
import { createIdentityColumns } from '../identity-columns';
import { HeadLabelWithIcon } from '../table-head-label';

/**
 * Creates column definitions for Privy imported users
 *
 * @param options Configuration options including selection handler
 * @returns Array of column definitions for privy users
 */
export function createPrivyUserColumns({
  onCheckboxChange,
  selectedUsers,
}: {
  onCheckboxChange?: (userId: string, checked: boolean) => void;
  selectedUsers?: Record<string, boolean>;
}): SmartTableColumn<ImportPrivyUserOutput>[] {
  return [
    {
      type: AdvancedColumnType.BATCH,
      batchRenderer: (user?: ImportPrivyUserOutput): any =>
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
      dataExtractor: (user: ImportPrivyUserOutput) => user.email || '—',
      contentRenderer: (email: string) => <span className="text-sm">{email}</span>,
    },
  ];
}
