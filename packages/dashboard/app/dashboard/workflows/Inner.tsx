'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Status, StepTable, WorkflowTable } from '@growly/sdk';
import { stepService, workflowService } from '@/utils/supabase/client';
import { background, border, cn, pressable, text } from '@/styles/theme';
import { Label } from '@/components/ui/label';
import { IconWaveSine } from '@tabler/icons-react';

export default function WorkflowPageInner() {
  const [workflows, setWorkflows] = useState<WorkflowTable[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepTable[]>([]);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [newStepName, setNewStepName] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    const result = await workflowService.getAll();
    setWorkflows(result);
  }

  async function fetchSteps(workflowId: string) {
    setSelectedWorkflowId(workflowId);
    const result = await stepService.getAll(workflowId);
    setSteps(result);
  }

  async function createWorkflow() {
    if (!newWorkflowName) return;
    await workflowService.create({
      name: newWorkflowName,
      description: newWorkflowDesc,
      status: Status.Active,
      created_at: new Date().toISOString(),
    });
    setNewWorkflowName('');
    setNewWorkflowDesc('');
    fetchWorkflows();
  }

  async function createStep() {
    if (!selectedWorkflowId || !newStepName) return;
    await stepService.create({
      name: newStepName,
      description: newStepDesc,
      workflow_id: selectedWorkflowId,
      status: Status.Active,
      conditions: [],
      action: [],
      created_at: new Date().toISOString(),
    });
    setNewStepName('');
    setNewStepDesc('');
    fetchSteps(selectedWorkflowId);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={cn(text.title2)}>
          <IconWaveSine /> Workflows
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className={cn(pressable.coinbaseBranding)}>Create a new workflow</Button>
          </DialogTrigger>
          <DialogContent className={cn(background.default, border.default, 'absolute mx-auto')}>
            <h2 className={cn(text.title3)}>
              <IconWaveSine /> New Workflow
            </h2>
            <p className={cn(text.body)}>
              A workflow is a collection of steps that are executed in order by the agents when the
              conditions are met.
            </p>
            <Label className={cn(text.headline)}>Name</Label>
            <Input
              placeholder="Enter workflow name"
              value={newWorkflowName}
              onChange={e => setNewWorkflowName(e.target.value)}
              className={cn('mb-2', border.lineDefault)}
            />
            <Label className={cn(text.headline)}>Description</Label>
            <Input
              placeholder="Enter workflow description"
              value={newWorkflowDesc}
              onChange={e => setNewWorkflowDesc(e.target.value)}
              className={cn('mb-2', border.lineDefault)}
            />
            <Button className={cn(pressable.coinbaseBranding)} onClick={createWorkflow}>
              Create
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map(workflow => (
          <Card key={workflow.id}>
            <CardContent className="p-4 space-y-2">
              <h2
                className="text-lg font-semibold cursor-pointer hover:underline"
                onClick={() => fetchSteps(workflow.id)}>
                {workflow.name}
              </h2>
              <p className="text-sm text-muted-foreground">{workflow.description}</p>
              {selectedWorkflowId === workflow.id && (
                <div className="space-y-2">
                  <h3 className="font-semibold mt-4">Steps</h3>
                  <ul className="list-disc pl-4">
                    {steps.map(step => (
                      <li key={step.id}>{step.name}</li>
                    ))}
                  </ul>

                  <div className="pt-4 space-y-2">
                    <Label className={cn(text.headline)}>Step name</Label>
                    <Input
                      placeholder="Enter step name"
                      value={newStepName}
                      onChange={e => setNewStepName(e.target.value)}
                    />
                    <Label className={cn(text.headline)}>Step description</Label>
                    <Input
                      placeholder="Enter step description"
                      value={newStepDesc}
                      onChange={e => setNewStepDesc(e.target.value)}
                    />
                    <Button className={cn(pressable.coinbaseBranding)} onClick={createStep}>
                      Add Step
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
