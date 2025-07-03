import { useDashboardState } from '@/hooks/use-dashboard';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { AggregatedAgent, Workflow } from '@getgrowly/core';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { WorkflowSmallCard } from '../workflows/workflow-small-card';
import { NewWorkflowButton } from './new-workflow-button';
import { PrimaryButton } from './primary-button';

type Props = {
  agent: AggregatedAgent;
  onUpdate: (agent: AggregatedAgent) => Promise<void>;
};

const AssignWorkflowButton = ({ agent, onUpdate }: Props) => {
  const { organizationWorkflows } = useDashboardState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflows, setSelectedWorkflows] = useState<Workflow[]>([...agent.workflows]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Filter workflows by organization and search query.
  const filteredWorkflows = organizationWorkflows.filter(
    workflow =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description &&
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveWorkflows = async () => {
    setIsSaving(true);
    try {
      const updatedAgent = {
        ...agent,
        workflows: selectedWorkflows,
      };
      await onUpdate(updatedAgent);
    } catch (error) {
      toast.error('Failed to update agent workflows');
    }
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  const isWorkflowAssigned = (workflowId: string) =>
    selectedWorkflows.some(w => w.id === workflowId);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <PrimaryButton disabled={isSaving}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Workflows
        </PrimaryButton>
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
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground text-center py-4">No workflows found</p>
                <NewWorkflowButton />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWorkflows.map(workflow => (
                  <WorkflowSmallCard
                    key={workflow.id}
                    isSelected={isWorkflowAssigned(workflow.id)}
                    workflow={workflow}
                    onClick={() => {
                      let updatedWorkflows = selectedWorkflows;
                      if (isWorkflowAssigned(workflow.id)) {
                        updatedWorkflows = selectedWorkflows.filter(w => w.id !== workflow.id);
                      } else {
                        updatedWorkflows = [...selectedWorkflows, workflow];
                      }
                      setSelectedWorkflows(updatedWorkflows);
                    }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveWorkflows} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignWorkflowButton;
