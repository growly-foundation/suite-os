'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Code, Loader2, Plus, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas';
import { WorkflowSettings } from '@/components/workflows/workflow-settings';
import { AggregatedWorkflow, Status } from '@growly/core';
import { AddStepDialog } from '@/components/steps/add-step-dialog';
import { IntegrationGuideDialog } from '@/components/steps/integration-guide-dialog';
import { useDashboardState } from '@/hooks/use-dashboard';
import { suiteCore } from '@/core/suite';
import { toast } from 'react-toastify';
import { generateId } from '@/lib/utils';
import { AnimatedLoadingSmall } from '@/components/animated-components/animated-loading-small';

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { fetchOrganizationWorkflowById, selectedOrganization } = useDashboardState();
  const [workflow, setWorkflow] = useState<AggregatedWorkflow | null>(null);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isIntegrationGuideOpen, setIsIntegrationGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const paramsValue = React.use(params);

  const isNewWorkflow = paramsValue.id === 'new';

  useEffect(() => {
    async function fetchWorkflow() {
      if (!selectedOrganization) {
        router.push('/organizations');
        toast.error('Please select an organization');
        return;
      }
      if (isNewWorkflow) {
        // Create a new workflow template
        setWorkflow({
          id: '',
          name: `Workflow-${generateId()}`,
          description: '',
          organization_id: selectedOrganization.id,
          status: Status.Active,
          created_at: new Date().toISOString(),
          steps: [],
        });
      } else {
        const fetchedWorkflow = await fetchOrganizationWorkflowById(paramsValue.id);
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
  }, [paramsValue.id, router, selectedOrganization]);

  const handleSave = async () => {
    if (!workflow || !selectedOrganization) {
      toast.error('Please select an organization');
      router.push('/organizations');
      return;
    }
    try {
      setSaving(true);
      const workflowPayload = {
        description: workflow.description,
        name: workflow.name,
        organization_id: selectedOrganization.id,
        status: workflow.status,
      };
      if (isNewWorkflow) {
        await suiteCore.db.workflows.create(workflowPayload);
        toast.success('Workflow created successfully');
      } else {
        await suiteCore.db.workflows.update(workflow.id, workflowPayload);
        toast.success('Workflow updated successfully');
      }
      let index = 0;
      for (const step of workflow.steps) {
        const stepExists = await suiteCore.db.steps.getOneByFields({
          workflow_id: workflow.id,
          id: step.id,
        });
        if (stepExists) {
          await suiteCore.db.steps.update(stepExists.id, {
            action: JSON.stringify(step.action),
            conditions: JSON.stringify(step.conditions),
            description: step.description,
            name: step.name,
            status: step.status,
          });
        } else {
          await suiteCore.db.steps.create({
            workflow_id: workflow.id,
            action: JSON.stringify(step.action),
            conditions: JSON.stringify(step.conditions),
            description: step.description,
            index,
            name: step.name,
            status: step.status,
          });
        }
        index++;
      }
      // Redirect to the workflows page after saving
      if (isNewWorkflow) {
        router.push('/dashboard/workflows');
      }
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
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
    return <AnimatedLoadingSmall />;
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
          <h1 className="text-2xl font-bold">
            {isNewWorkflow ? 'New Workflow' : `Edit: ${workflow.name}`}
          </h1>
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
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
