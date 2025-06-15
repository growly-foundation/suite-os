'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { PrimaryButton } from './primary-button';

export const NewWorkflowButton = () => {
  return (
    <Link href="/dashboard/workflows/new">
      <PrimaryButton>
        <PlusCircle className="h-4 w-4" />
        New Workflow
      </PrimaryButton>
    </Link>
  );
};
