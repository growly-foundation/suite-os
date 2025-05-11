'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConditionType } from '@growly/core';
import { generateId } from '@/lib/utils';
import { AlwaysCondition } from './always-condition-form';
import { StepCondition } from './step-condition-form';
import { WorkflowCondition } from './workflow-condition-form';
import { UIEventCondition } from './ui-event-condition-form';
import { JudgedByAgentCondition } from './judged-by-agent-condition-form';
import { ConditionItem } from './condition-item';

interface ConditionFormProps {
  conditions: any[];
  setConditions: (conditions: any[]) => void;
  existingSteps: any[];
}

export function ConditionForm({ conditions, setConditions, existingSteps }: ConditionFormProps) {
  const [currentConditionType, setCurrentConditionType] = useState<ConditionType>(
    ConditionType.Always
  );

  const addCondition = (conditionData: any) => {
    setConditions([
      ...conditions,
      {
        id: generateId(),
        type: currentConditionType,
        data: conditionData,
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">Conditions</Label>
        <Badge variant="outline" className="font-normal">
          {conditions.length} {conditions.length === 1 ? 'condition' : 'conditions'}
        </Badge>
      </div>

      {conditions.length > 0 && (
        <div className="space-y-2">
          {conditions.map(condition => (
            <ConditionItem
              key={condition.id}
              condition={condition}
              onRemove={removeCondition}
              existingSteps={existingSteps}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Add Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conditionType">Condition Type</Label>
            <Select
              value={currentConditionType}
              onValueChange={(value: any) => setCurrentConditionType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionType.Always}>Always (True)</SelectItem>
                <SelectItem value={ConditionType.Step}>Depends on Step</SelectItem>
                <SelectItem value={ConditionType.Workflow}>Depends on Workflow</SelectItem>
                <SelectItem value={ConditionType.UIEvent}>UI Event</SelectItem>
                <SelectItem value={ConditionType.JudgedByAgent}>Judged by Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Render the appropriate condition form based on the selected type */}
          {currentConditionType === ConditionType.Always && (
            <AlwaysCondition onAdd={addCondition} />
          )}

          {currentConditionType === ConditionType.Step && (
            <StepCondition onAdd={addCondition} existingSteps={existingSteps} />
          )}

          {currentConditionType === ConditionType.Workflow && (
            <WorkflowCondition onAdd={addCondition} />
          )}

          {currentConditionType === ConditionType.UIEvent && (
            <UIEventCondition onAdd={addCondition} />
          )}

          {currentConditionType === ConditionType.JudgedByAgent && (
            <JudgedByAgentCondition onAdd={addCondition} existingSteps={existingSteps} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
