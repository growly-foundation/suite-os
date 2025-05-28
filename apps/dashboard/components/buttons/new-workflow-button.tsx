'use client';

import { Button } from '../ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export const NewWorkflowButton = () => {
  return (
    <Link href="/dashboard/workflows/new">
      <Button variant="outline" className="w-full justify-start">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Workflow
      </Button>
    </Link>
  );
};
