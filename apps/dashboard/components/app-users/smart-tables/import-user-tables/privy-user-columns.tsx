'use client';

import { MailIcon } from 'lucide-react';

import { ImportPrivyUserOutput } from '@getgrowly/core';

import { ColumnType, SmartTableColumn } from '../../types';
import { HeadLabelWithIcon } from '../table-head-label';

/**
 * Creates column definitions for Privy imported users
 *
 * @returns Array of column definitions for privy users
 */
export function createPrivyUserColumns(): SmartTableColumn<ImportPrivyUserOutput>[] {
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
      dataExtractor: (user: ImportPrivyUserOutput) => user.email || '—',
      contentRenderer: (email: string) => <span className="text-sm">{email}</span>,
    },
  ];
}
