'use client';

import { useDashboardState } from '@/hooks/use-dashboard';
import { Workflow } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';

import AnimatedBeamContainer from '../animated-beam/animated-beam-container';
import { NewWorkflowButton } from '../buttons/new-workflow-button';
import { WorkflowsList } from './workflow-list';

const AnimatedLoadingSmall = dynamic(
  () =>
    import('@/components/animated-components/animated-loading-small').then(
      module => module.AnimatedLoadingSmall
    ),
  { ssr: false }
);

export default function WorkflowManager() {
  const {
    workflowStatus,
    organizationWorkflows: workflows,
    fetchOrganizationWorkflows: fetchWorkflows,
    selectedOrganization,
  } = useDashboardState();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows, selectedOrganization]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" /> Workflows
        </h1>
        <NewWorkflowButton />
      </div>
      {workflowStatus === 'loading' ? (
        <AnimatedLoadingSmall />
      ) : (
        <React.Fragment>
          {workflows.length > 0 ? (
            <WorkflowsList workflows={workflows} />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <AnimatedBeamContainer />
              <br />
              <h1 className="text-2xl font-bold">No workflows found</h1>
              <p className="text-muted-foreground">Create a workflow to get started.</p>
            </div>
          )}
        </React.Fragment>
      )}
    </div>
  );
}
