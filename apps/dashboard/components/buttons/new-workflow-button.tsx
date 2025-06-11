'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui/button';

export const NewWorkflowButton = () => {
  return (
    <Link href="/dashboard/workflows/new">
      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        New Workflow
      </Button>
    </Link>
  );
};
