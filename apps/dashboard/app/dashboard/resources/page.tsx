'use client';

import { ResourcePageLayout } from '@/components/layouts/resource-page-layout';
import { useComponent } from '@/components/providers/component-provider';
import { ADD_RESOURCE_DRAWER } from '@/constants/component-registry';
import { useAgentResourceActions } from '@/hooks/use-resource-actions';

export default function ResourcePage() {
  const { resources, handleDeleteResource } = useAgentResourceActions();
  const { open } = useComponent(ADD_RESOURCE_DRAWER);

  return (
    <ResourcePageLayout
      title="Resources"
      resources={resources}
      onResourceDelete={handleDeleteResource}
      onResourceAdd={open}
      agentId={undefined}
    />
  );
}
