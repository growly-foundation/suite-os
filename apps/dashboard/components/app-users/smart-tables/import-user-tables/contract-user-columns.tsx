'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { ImportUserOutput } from '@getgrowly/core';

import { AdvancedColumnType, SmartTableColumn } from '../../types';
import { createIdentityColumns } from '../identity-columns';

// For type safety when working with contract-specific fields
interface ContractUserOutput extends ImportUserOutput {
  tokenId?: string;
  tokenBalance?: string;
  firstInteraction?: string;
  lastInteraction?: string;
}

/**
 * Creates column definitions for Contract imported users
 *
 * @param options Configuration options including selection handler
 * @returns Array of column definitions for contract users
 */
export function createContractUserColumns({
  onCheckboxChange,
  selectedUsers,
  renderSelectAll,
}: {
  onCheckboxChange?: (userId: string, checked: boolean) => void;
  selectedUsers?: Record<string, boolean>;
  renderSelectAll?: (
    props: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  ) => React.ReactNode;
}): SmartTableColumn<ContractUserOutput>[] {
  return [
    {
      type: AdvancedColumnType.BATCH,
      batchRenderer: (user?: ContractUserOutput): any =>
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
  ];
}
