'use client';

import { ResourcePageLayout } from '@/components/layouts/resource-page-layout';
import { useComponent } from '@/components/providers/component-provider';
import { ADD_RESOURCE_DRAWER } from '@/constants/component-registry';
import { useRequireChainConfig } from '@/hooks/use-chain-config';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useOrganizationResourceActions } from '@/hooks/use-resource-actions';

import { ParsedResource, ResourceType, TypedResource } from '@getgrowly/core';

export default function ResourcePage() {
  // Require chain configuration for contract resources
  useRequireChainConfig();
  const { fetchCurrentOrganizationResources } = useDashboardState();
  const {
    organizationResources,
    handleDeleteResource,
    organizationResourceStatus,
    setOrganizationResources,
  } = useOrganizationResourceActions();
  const { open } = useComponent(ADD_RESOURCE_DRAWER);

  const handleUpdateResource = async (updatedResource: TypedResource<ResourceType>) => {
    try {
      setOrganizationResources(
        organizationResources.map(resource =>
          resource.id === updatedResource.id ? updatedResource : resource
        )
      );
      await fetchCurrentOrganizationResources();
    } catch (error) {
      console.error('Failed to refetch resources:', error);
    }
  };

  return (
    <ResourcePageLayout
      title="Resources"
      resourceLoading={organizationResourceStatus === 'loading'}
      resources={organizationResources as ParsedResource[]}
      onResourceDelete={handleDeleteResource}
      onResourceUpdate={handleUpdateResource}
      onResourceAdd={open}
    />
  );
}
