'use client';

import { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Agent, AggregatedAgent } from '@growly/core';
import { useDashboardState } from '@/hooks/use-dashboard';

interface AgentWorkflowsProps {
  agent: AggregatedAgent;
  onUpdate: (agent: Agent) => void;
}

export function AgentWorkflows({ agent, onUpdate }: AgentWorkflowsProps) {
  const { organizationWorkflows: workflows } = useDashboardState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([...agent.workflows]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter workflows by organization and search query
  const filteredWorkflows = workflows.filter(
    workflow =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description &&
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleWorkflow = (workflowId: string) => {
    setSelectedWorkflows(prev =>
      prev.includes(workflowId) ? prev.filter(id => id !== workflowId) : [...prev, workflowId]
    );
  };

  const handleSaveWorkflows = () => {
    const updatedAgent = {
      ...agent,
      workflows: selectedWorkflows,
    };
    onUpdate(updatedAgent);
    setIsDialogOpen(false);
  };

  const handleRemoveWorkflow = (workflowId: string) => {
    const updatedAgent = {
      ...agent,
      workflows: agent.workflows.filter(id => id !== workflowId),
    };
    onUpdate(updatedAgent);
  };

  // Get assigned workflows
  const assignedWorkflows = workflows.filter(workflow => agent.workflows.includes(workflow.id));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assigned Workflows</CardTitle>
          <CardDescription>Manage the workflows this agent can execute</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Assign Workflows
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Workflows</DialogTitle>
              <DialogDescription>
                Select workflows to assign to this agent. The agent will be able to execute these
                workflows.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mb-4"
              />

              <ScrollArea className="h-[300px] pr-4">
                {filteredWorkflows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No workflows found
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredWorkflows.map(workflow => (
                      <div key={workflow.id} className="flex items-start space-x-3 py-2">
                        <Checkbox
                          id={`workflow-${workflow.id}`}
                          checked={selectedWorkflows.includes(workflow.id)}
                          onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={`workflow-${workflow.id}`}
                            className="font-medium cursor-pointer">
                            {workflow.name}
                          </Label>
                          {workflow.description && (
                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                          )}
                          <Badge variant="outline" className="w-fit">
                            {workflow.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWorkflows}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignedWorkflows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No workflows assigned to this agent</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Workflows
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{workflow.name}</div>
                  {workflow.description && (
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  )}
                  <Badge
                    variant={workflow.status === 'active' ? 'default' : 'secondary'}
                    className="mt-1">
                    {workflow.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveWorkflow(workflow.id)}
                  className="text-muted-foreground hover:text-destructive">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
