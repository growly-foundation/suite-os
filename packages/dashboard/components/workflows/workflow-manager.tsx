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

// Mock types based on the provided code
export type Status = 'active' | 'inactive' | 'draft';

export interface WorkflowTable {
  id: string;
  name: string;
  description: string;
  status: Status;
  created_at: string;
}

export interface StepTable {
  id: string;
  name: string;
  description: string;
  workflow_id: string;
  status: Status;
  conditions: any[];
  action: any[];
  created_at: string;
}

// Mock services
export const workflowService = {
  getAll: async (): Promise<WorkflowTable[]> => {
    // This would be replaced with actual API calls
    return [
      {
        id: '1',
        name: 'Customer Onboarding',
        description: 'Process for new customer registration and setup',
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Support Ticket Handling',
        description: 'Automated workflow for managing support requests',
        status: 'active',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Lead Qualification',
        description: 'Process to qualify and route new leads',
        status: 'draft',
        created_at: new Date().toISOString(),
      },
    ];
  },
  create: async (workflow: Omit<WorkflowTable, 'id'>): Promise<WorkflowTable> => {
    // This would be replaced with actual API calls
    return {
      ...workflow,
      id: Math.random().toString(36).substring(7),
    };
  },
};

export const stepService = {
  getAll: async (workflowId: string): Promise<StepTable[]> => {
    // This would be replaced with actual API calls
    if (workflowId === '1') {
      return [
        {
          id: '101',
          name: 'Verify Email',
          description: 'Send verification email to new customer',
          workflow_id: workflowId,
          status: 'active',
          conditions: [],
          action: [],
          created_at: new Date().toISOString(),
        },
        {
          id: '102',
          name: 'Create Account',
          description: 'Set up customer account in the system',
          workflow_id: workflowId,
          status: 'active',
          conditions: [],
          action: [],
          created_at: new Date().toISOString(),
        },
        {
          id: '103',
          name: 'Send Welcome Email',
          description: 'Send welcome email with getting started guide',
          workflow_id: workflowId,
          status: 'active',
          conditions: [],
          action: [],
          created_at: new Date().toISOString(),
        },
      ];
    }
    return [];
  },
  create: async (step: Omit<StepTable, 'id'>): Promise<StepTable> => {
    // This would be replaced with actual API calls
    return {
      ...step,
      id: Math.random().toString(36).substring(7),
    };
  },
};

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
      const result = await workflowService.getAll();
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
      await workflowService.create({
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
