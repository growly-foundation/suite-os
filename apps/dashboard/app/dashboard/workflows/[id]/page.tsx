'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { AddStepDrawer } from '@/components/steps/add-step-drawer';
import { StepListView } from '@/components/steps/step-list-view';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowCanvas } from '@/components/workflows/workflow-canvas';
import { WorkflowSettings } from '@/components/workflows/workflow-settings';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useWorkflowDetailStore } from '@/hooks/use-workflow-details';
import { generateId } from '@/lib/utils';
import { Loader2, Plus, Save, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { ParsedStepInsert, Status, WithId } from '@getgrowly/core';

import { PaddingLayout } from '../../layout';

const AnimatedLoadingSmall = dynamic(
  () =>
    import('@/components/animated-components/animated-loading-small').then(
      module => module.AnimatedLoadingSmall
    ),
  { ssr: false }
);

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { fetchOrganizationWorkflowById, selectedOrganization } = useDashboardState();
  const { workflow, setWorkflow, addStep } = useWorkflowDetailStore();
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const paramsValue = React.use(params);

  const isNewWorkflow = paramsValue.id === 'new';

  const fetchWorkflow = async () => {
    if (!selectedOrganization) return;
    if (isNewWorkflow) {
      // Create a new workflow template
      setWorkflow({
        id: '',
        name: `Workflow ${generateId().toUpperCase()}`,
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
  };

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
      } else {
        await suiteCore.db.workflows.update(workflow.id, workflowPayload);
      }
      await suiteCore.steps.createStep(workflow.steps, workflow.id);
      toast.success(
        isNewWorkflow ? 'Workflow created successfully' : 'Workflow updated successfully'
      );
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

  const handleAddStep = (step: WithId<ParsedStepInsert>) => {
    if (!workflow) return;
    addStep(step);
    setIsAddStepOpen(false);
  };

  useEffect(() => {
    async function init() {
      if (!selectedOrganization) {
        router.push('/organizations');
        toast.error('Please select an organization');
        return;
      }

      await fetchWorkflow();
      setLoading(false);
    }
    init();
  }, [paramsValue.id, selectedOrganization]);

  if (loading) {
    return <AnimatedLoadingSmall />;
  }

  if (!workflow) {
    return <div className="container mx-auto py-6">Workflow not found</div>;
  }

  return (
    <div>
      <Tabs defaultValue="canvas">
        <div className="flex justify-between px-2 py-2 border-b items-center">
          <TabsList>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="list">Step List</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddStepOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </PrimaryButton>
          </div>
        </div>
        <TabsContent value="canvas" className="pt-4 px-4">
          <WorkflowCanvas onReset={fetchWorkflow} />
        </TabsContent>
        <TabsContent value="list">
          <PaddingLayout>
            <StepListView steps={workflow.steps} />
          </PaddingLayout>
        </TabsContent>
        <TabsContent value="settings">
          <PaddingLayout>
            <WorkflowSettings />
          </PaddingLayout>
        </TabsContent>
      </Tabs>
      <AddStepDrawer
        workflowId={workflow.id}
        open={isAddStepOpen}
        onOpenChange={setIsAddStepOpen}
        onAdd={handleAddStep}
      />
    </div>
  );
}
