'use client';

import { useRequireChainConfig } from '@/hooks/use-chain-config';

import { UsersInner } from './inner';

export default function UsersPage() {
  // Require chain configuration for persona features
  useRequireChainConfig();

  return <UsersInner />;
}
