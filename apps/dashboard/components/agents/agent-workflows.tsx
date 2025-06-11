'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardState } from '@/hooks/use-dashboard';

import { AggregatedAgent } from '@getgrowly/core';

import AssignWorkflowButton from '../buttons/assign-workflow-button';
import { NewWorkflowButton } from '../buttons/new-workflow-button';
import { WorkflowCard } from '../workflows/workflow-card';

interface AgentWorkflowsProps {
  agent: AggregatedAgent;
  onUpdate: (agent: AggregatedAgent) => Promise<void>;
}

export function AgentWorkflows({ agent, onUpdate }: AgentWorkflowsProps) {
  const { organizationWorkflows } = useDashboardState();

  // Get assigned workflows.
  const assignedWorkflows = organizationWorkflows.filter(w =>
    agent.workflows.some(workflow => w.id === workflow.id)
  );

  return (
    <PaddingLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Assigned Workflows</CardTitle>
            <CardDescription className="mt-1">
              Manage the workflows this agent can execute
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AssignWorkflowButton agent={agent} onUpdate={onUpdate} />
            <NewWorkflowButton />
          </div>
        </CardHeader>
        <CardContent>
          {assignedWorkflows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No workflows assigned to this agent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedWorkflows.map(workflow => (
                <WorkflowCard workflow={workflow} key={workflow.id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PaddingLayout>
  );
}
