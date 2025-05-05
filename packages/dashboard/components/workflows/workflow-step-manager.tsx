import React, { useEffect, useState } from 'react';
import { stepService, StepTable } from './workflow-manager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type Props = {
  selectedWorkflowId: string;
};

const WorkflowStepManager = ({ selectedWorkflowId }: Props) => {
  const [steps, setSteps] = useState<StepTable[]>([]);
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function createStep() {
    if (!selectedWorkflowId || !newStepName) return;
    setIsLoading(true);
    try {
      await stepService.create({
        name: newStepName,
        description: newStepDesc,
        workflow_id: selectedWorkflowId,
        status: 'active',
        conditions: [],
        action: [],
        created_at: new Date().toISOString(),
      });
      setNewStepName('');
      setNewStepDesc('');
      await fetchSteps(selectedWorkflowId);
    } catch (error) {
      console.error('Failed to create step:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSteps(workflowId: string) {
    setIsLoading(true);
    try {
      const result = await stepService.getAll(workflowId);
      setSteps(result);
    } catch (error) {
      console.error('Failed to fetch steps:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSteps(selectedWorkflowId);
  }, [selectedWorkflowId]);

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      <h3 className="font-semibold">Steps</h3>
      {steps.length > 0 ? (
        <ul className="space-y-2">
          {steps.map(step => (
            <li key={step.id} className="bg-muted p-2 rounded-md">
              <div className="font-medium">{step.name}</div>
              <div className="text-sm text-muted-foreground">{step.description}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No steps added yet.</p>
      )}

      <div className="pt-4 space-y-2 bg-muted/30 p-3 rounded-lg">
        <h4 className="font-medium">Add New Step</h4>
        <div className="space-y-2">
          <Label htmlFor="step-name">Step Name</Label>
          <Input
            id="step-name"
            placeholder="Enter step name"
            value={newStepName}
            onChange={e => setNewStepName(e.target.value)}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step-description">Description</Label>
          <Textarea
            id="step-description"
            placeholder="Enter step description"
            value={newStepDesc}
            onChange={e => setNewStepDesc(e.target.value)}
            className="rounded-lg min-h-[80px]"
          />
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white w-full mt-2"
          onClick={createStep}
          disabled={isLoading || !newStepName}>
          {isLoading ? 'Adding...' : 'Add Step'}
        </Button>
      </div>
    </div>
  );
};

export default WorkflowStepManager;
