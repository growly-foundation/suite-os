'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Code, Plus, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas';
import { WorkflowSettings } from '@/components/workflows/workflow-settings';
import { AggregatedWorkflow } from '@growly/core';
import { AddStepDialog } from '@/components/steps/add-step-dialog';
import { IntegrationGuideDialog } from '@/components/steps/integration-guide-dialog';
import { useDashboardState } from '@/hooks/use-dashboard';

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { fetchOrganizationWorkflowById } = useDashboardState();
  const [workflow, setWorkflow] = useState<AggregatedWorkflow | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isIntegrationGuideOpen, setIsIntegrationGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflow() {
      // In a real app, you would fetch the workflow data from your API
      if (params.id === 'new') {
        // Create a new workflow template
        setWorkflow({
          id: '',
          name: 'New Workflow',
          description: '',
          organization_id: 'org-1',
          status: 'inactive',
          created_at: new Date().toISOString(),
          steps: [],
        });
      } else {
        const fetchedWorkflow = await fetchOrganizationWorkflowById(params.id);
        if (fetchedWorkflow) {
          setWorkflow(fetchedWorkflow);
        } else {
          // Handle workflow not found
          router.push('/dashboard/workflows');
        }
      }
      setLoading(false);
    }
    fetchWorkflow();
  }, [params.id, router]);

  const handleSave = () => {
    // In a real app, you would save the workflow data to your API
    console.log('Saving workflow:', workflow);
    // Redirect to the workflows page after saving
    if (params.id === 'new') {
      router.push('/dashboard/workflows');
    }
  };

  const handleAddStep = (step: any) => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      steps: [...(workflow.steps || []), step],
    });

    setIsAddStepOpen(false);
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  if (!workflow) {
    return <div className="container mx-auto py-6">Workflow not found</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/workflows')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{workflow.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAddStepOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
          <Button variant="outline" onClick={() => setIsIntegrationGuideOpen(true)}>
            <Code className="mr-2 h-4 w-4" />
            Integration Guide
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="canvas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="canvas" className="p-0">
          <WorkflowCanvas workflow={workflow} setWorkflow={setWorkflow} />
        </TabsContent>
        <TabsContent value="settings">
          <WorkflowSettings workflow={workflow} setWorkflow={setWorkflow} />
        </TabsContent>
      </Tabs>
      <AddStepDialog
        open={isAddStepOpen}
        onOpenChange={setIsAddStepOpen}
        onAdd={handleAddStep}
        existingSteps={workflow.steps || []}
      />
      <IntegrationGuideDialog
        open={isIntegrationGuideOpen}
        onOpenChange={setIsIntegrationGuideOpen}
        workflow={workflow}
      />
    </div>
  );
}
