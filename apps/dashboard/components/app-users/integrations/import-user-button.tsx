'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function ImportUserButton() {
  return (
    <Link href="/dashboard/users/import">
      <PrimaryButton>
        <RefreshCw className="mr-1 h-4 w-4" />
        Import Users
      </PrimaryButton>
    </Link>
  );
}
