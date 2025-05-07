'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateWorkflowContext } from '../../contexts/WorkflowManagementContext';
import { useEffect } from 'react';
import { growlySdk } from '@/core/growly-services';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CreateWorkflowForm({ isEdit }: { isEdit?: boolean }) {
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const {
    isLoading,
    selectedWorkflowId,
    isCreateWorkflowOpen,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
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
      <div className="pt-4 flex gap-3 justify-end">
        <Button
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={
            isEdit
              ? () => updateWorkflow(newWorkflowName, newWorkflowDesc)
              : () => createWorkflow(newWorkflowName, newWorkflowDesc)
          }
          disabled={isLoading || !newWorkflowName || !newWorkflowDesc}>
          {isLoading ? 'Creating...' : isEdit ? 'Update Workflow' : 'Create Workflow'}
        </Button>
        {isEdit && (
          <Button
            variant="destructive"
            onClick={() => {
              deleteWorkflow(selectedWorkflowId!);
            }}>
            <Trash2 /> Delete Workflow
          </Button>
        )}
      </div>
    </div>
  );
}
