'use client';

import { ImportUserOutput } from '@getgrowly/core';

import { SmartTableColumn } from '../../types';

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
 * @returns Array of column definitions for contract users
 */
export function createContractUserColumns(): SmartTableColumn<ContractUserOutput>[] {
  return [];
}
