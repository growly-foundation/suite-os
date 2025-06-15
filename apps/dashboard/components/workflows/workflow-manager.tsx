'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { useDashboardState } from '@/hooks/use-dashboard';
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
    <React.Fragment>
      <div className="flex justify-between items-center border-b py-2 px-4">
        <div className="text-sm text-muted-foreground">There are {workflows.length} workflows</div>
        <NewWorkflowButton />
      </div>
      <PaddingLayout>
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
      </PaddingLayout>
    </React.Fragment>
  );
}
