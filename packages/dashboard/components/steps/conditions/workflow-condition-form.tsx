'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface WorkflowConditionProps {
  onAdd: (data: any) => void;
}

export function WorkflowCondition({ onAdd }: WorkflowConditionProps) {
  const [workflowId, setWorkflowId] = useState('');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workflowId">Workflow ID</Label>
        <Input
          id="workflowId"
          value={workflowId}
          onChange={e => setWorkflowId(e.target.value)}
          placeholder="Enter workflow ID"
        />
      </div>
      <Button type="button" onClick={() => onAdd(workflowId)} disabled={!workflowId}>
        <Plus className="mr-2 h-4 w-4" />
        Add Workflow Dependency
      </Button>
    </div>
  );
}
