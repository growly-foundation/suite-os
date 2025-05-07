'use client';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { Workflow } from 'lucide-react';
import { useCreateWorkflowContext } from '../../contexts/CreateWorkflowContext';
import CreateWorkflowForm from './create-workflow-form';

export const CreateWorkflowDialog = ({ title, isEdit }: { title: string; isEdit?: boolean }) => {
  const { isCreateWorkflowOpen, setIsCreateWorkflowOpen } = useCreateWorkflowContext();

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
