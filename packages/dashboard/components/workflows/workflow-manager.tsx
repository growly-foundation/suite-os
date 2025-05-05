'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';
import WorkflowStepManager from './workflow-step-manager';
import { WorkflowTable } from '@growly/sdk';
import { growlySdk } from '@/core/growly-services';

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState<WorkflowTable[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    setIsLoading(true);
    try {
      const result = await growlySdk.db.workflow.getAll();
      setWorkflows(result);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkflow() {
    if (!newWorkflowName) return;
    setIsLoading(true);
    try {
      await growlySdk.db.workflow.create({
        name: newWorkflowName,
        description: newWorkflowDesc,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setNewWorkflowName('');
      setNewWorkflowDesc('');
      setIsCreateWorkflowOpen(false);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" /> Workflows
        </h1>
        <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" /> New Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter workflow name"
                  value={newWorkflowName}
                  onChange={e => setNewWorkflowName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter workflow description"
                  value={newWorkflowDesc}
                  onChange={e => setNewWorkflowDesc(e.target.value)}
                  className="rounded-lg min-h-[100px]"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={createWorkflow}
                  disabled={isLoading || !newWorkflowName}>
                  {isLoading ? 'Creating...' : 'Create Workflow'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
      {selectedWorkflowId && <WorkflowStepManager selectedWorkflowId={selectedWorkflowId} />}
    </div>
  );
}
