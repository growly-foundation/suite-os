'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AlwaysConditionProps {
  onAdd: (data: any) => void;
}

export function AlwaysCondition({ onAdd }: AlwaysConditionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This condition is always true. The step will always be triggered.
      </p>
      <Button type="button" onClick={() => onAdd(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Always Condition
      </Button>
    </div>
  );
}
