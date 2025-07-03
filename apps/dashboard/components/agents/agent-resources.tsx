'use client';

import { ResourcePageLayout } from '@/components/layouts/resource-page-layout';
import { useDashboardState } from '@/hooks/use-dashboard';

import { AggregatedAgent } from '@getgrowly/core';

import AssignResourceButton from '../buttons/assing-resource-button';

interface AgentResourcesProps {
  agent: AggregatedAgent;
  onUpdate: (agent: AggregatedAgent) => Promise<void>;
}
export function AgentResources({ agent, onUpdate }: AgentResourcesProps) {
  const { agentStatus } = useDashboardState();
  const resources = agent?.resources || [];

  return (
    <ResourcePageLayout
      title="Agent Resources"
      resources={resources}
      resourceLoading={agentStatus === 'loading'}
      additionalActions={<AssignResourceButton agent={agent} onUpdate={onUpdate} />}
    />
  );
}
