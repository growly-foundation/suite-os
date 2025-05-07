import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateWorkflowContext } from '../../contexts/CreateWorkflowContext';
import { useEffect } from 'react';
import { growlySdk } from '@/core/growly-services';

export default function CreateWorkflowForm({ isEdit }: { isEdit?: boolean }) {
  const {
    newWorkflowName,
    newWorkflowDesc,
    isLoading,
    selectedWorkflowId,
    isCreateWorkflowOpen,
    createWorkflow,
    updateWorkflow,
    setNewWorkflowName,
    setNewWorkflowDesc,
    setIsLoading,
  } = useCreateWorkflowContext();

  useEffect(() => {
    async function fetchWorkflow() {
      if (isEdit && selectedWorkflowId) {
        setIsLoading(true);
        const workflow = await growlySdk.db.workflow.getById(selectedWorkflowId);
        if (workflow) {
          setNewWorkflowName(workflow.name);
          setNewWorkflowDesc(workflow.description || '');
        }
        setIsLoading(false);
      }
    }
    fetchWorkflow();
  }, [isEdit, selectedWorkflowId, isCreateWorkflowOpen, setNewWorkflowName, setNewWorkflowDesc]);

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : (
          <Input
            id="name"
            placeholder="Enter workflow name"
            value={newWorkflowName}
            onChange={e => setNewWorkflowName(e.target.value)}
            className="rounded-lg"
          />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        {isLoading ? (
          <Skeleton className="h-16" />
        ) : (
          <Textarea
            id="description"
            placeholder="Enter workflow description"
            value={newWorkflowDesc}
            onChange={e => setNewWorkflowDesc(e.target.value)}
            className="rounded-lg min-h-[100px]"
          />
        )}
      </div>
      <div className="pt-4 flex justify-end">
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={isEdit ? updateWorkflow : createWorkflow}
          disabled={isLoading || !newWorkflowName || !newWorkflowDesc}>
          {isLoading ? 'Creating...' : isEdit ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </div>
  );
}
