'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import WorkflowStepManager from './workflow-step-manager';
import AnimatedBeamContainer from '../animated-beam/animated-beam-container';
import { useCreateWorkflowContext } from '@/contexts/CreateWorkflowContext';
import { CreateWorkflowDialog } from './create-workflow-dialog';
import { Button } from '@/components/ui/button';
import CreateWorkflowForm from './create-workflow-form';

export default function WorkflowManager() {
  const { workflows, selectedWorkflowId, setSelectedWorkflowId } = useCreateWorkflowContext();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" /> Workflows
        </h1>
        <CreateWorkflowDialog title="Create Workflow" />
      </div>
      {workflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="border shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-lg font-semibold cursor-pointer hover:underline"
                    onClick={() => setSelectedWorkflowId(workflow.id)}>
                    {workflow.name}
                  </h2>
                  <Badge
                    variant={workflow.status === 'active' ? 'default' : 'outline'}
                    className={cn(
                      'capitalize',
                      workflow.status === 'active' && 'bg-green-600 text-white'
                    )}>
                    {workflow.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <AnimatedBeamContainer />
          <br />
          <h1 className="text-2xl font-bold">No workflows found</h1>
          <p className="text-muted-foreground">Create a workflow to get started.</p>
        </div>
      )}
      {selectedWorkflowId && (
        <div className="mt-6">
          <CreateWorkflowForm isEdit />
          <div className="flex items-center justify-between">
            <Button variant="destructive">
              <Trash2 /> Delete Workflow
            </Button>
          </div>
          <WorkflowStepManager selectedWorkflowId={selectedWorkflowId} />
        </div>
      )}
    </div>
  );
}
