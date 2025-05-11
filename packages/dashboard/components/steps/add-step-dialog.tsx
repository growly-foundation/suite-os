'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConditionForm } from '@/components/steps/conditions/condition-form';
import { ActionForm } from '@/components/steps/actions/action-form';
import { Separator } from '@/components/ui/separator';
import { Action, Condition, ParsedStep, ParsedStepInsert, Status, WorkflowId } from '@growly/core';

interface AddStepDialogProps {
  workflowId: WorkflowId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (step: ParsedStepInsert) => void;
  existingSteps: ParsedStep[];
}

export function AddStepDialog({
  workflowId,
  open,
  onOpenChange,
  onAdd,
  existingSteps,
}: AddStepDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  const handleAdd = () => {
    onAdd({
      name,
      description,
      index: existingSteps.length,
      status: Status.Active,
      workflow_id: workflowId,
      conditions: conditions,
      action: actions,
    });
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setConditions([]);
    setActions([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Step</DialogTitle>
          <DialogDescription>
            Create a new step for your workflow. Steps can perform actions when conditions are met.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Step Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter step name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what this step does"
              />
            </div>
          </div>
          {/* Conditions Section */}
          <ConditionForm
            conditions={conditions}
            setConditions={setConditions}
            existingSteps={existingSteps}
          />
          <Separator />
          {/* Actions Section */}
          <ActionForm actions={actions} setActions={setActions} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!name || conditions.length === 0 || actions.length === 0}>
            Create Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
