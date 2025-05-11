'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ConditionType, ParsedStep, ScalarStepCondition, Step, StepId } from '@growly/core';
import { generateId } from '@/lib/utils';

interface StepConditionProps {
  onAdd: (data: ScalarStepCondition) => void;
  existingSteps: ParsedStep[];
}

export function StepCondition({ onAdd, existingSteps }: StepConditionProps) {
  const [dependsOn, setDependsOn] = useState<StepId | null>(null);

  return (
    <div className="space-y-4">
      {existingSteps.length > 0 ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="dependsOn">Depends On Step</Label>
            <Select value={dependsOn || ''} onValueChange={setDependsOn}>
              <SelectTrigger>
                <SelectValue placeholder="Select a step" />
              </SelectTrigger>
              <SelectContent>
                {existingSteps.map(step => (
                  <SelectItem key={step.id} value={step.id}>
                    {step.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!dependsOn) return;
              onAdd({ type: ConditionType.Step, data: dependsOn, id: generateId() });
            }}
            disabled={!dependsOn}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step Dependency
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No existing steps to depend on. Create other steps first.
        </p>
      )}
    </div>
  );
}
