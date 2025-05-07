import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Workflow } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useCreateWorkflowContext } from '../../contexts/CreateWorkflowContext';
import { useEffect, useState } from 'react';
import { growlySdk } from '@/core/growly-services';
import { Skeleton } from '../ui/skeleton';
import CreateWorkflowForm from './create-workflow-form';

export const CreateWorkflowDialog = ({
  title,
  isEdit,
  selectedWorkflowId,
}: {
  title: string;
  isEdit?: boolean;
  selectedWorkflowId?: string;
}) => {
  const [isFetchingWorkflow, setIsFetchingWorkflow] = useState(false);
  const {
    isCreateWorkflowOpen,
    setIsCreateWorkflowOpen,
    newWorkflowName,
    newWorkflowDesc,
    isLoading,
    createWorkflow,
    updateWorkflow,
    setNewWorkflowName,
    setNewWorkflowDesc,
  } = useCreateWorkflowContext();

  useEffect(() => {
    async function fetchWorkflow() {
      if (isEdit && selectedWorkflowId) {
        setIsFetchingWorkflow(true);
        const workflow = await growlySdk.db.workflow.getById(selectedWorkflowId);
        if (workflow) {
          setNewWorkflowName(workflow.name);
          setNewWorkflowDesc(workflow.description || '');
        }
        setIsFetchingWorkflow(false);
      }
    }
    fetchWorkflow();
  }, [isEdit, selectedWorkflowId, isCreateWorkflowOpen, setNewWorkflowName, setNewWorkflowDesc]);

  return (
    <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
        </DialogHeader>
        <CreateWorkflowForm isEdit={isEdit} />
      </DialogContent>
    </Dialog>
  );
};
