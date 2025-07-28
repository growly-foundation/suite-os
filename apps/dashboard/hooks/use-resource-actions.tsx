import { suiteCore } from '@/core/suite';
import { ResourceService } from '@/lib/services/resource.service';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  ContractValue,
  ParsedResource,
  ParsedResourceInsert,
  Resource,
  ResourceType,
  TypedResource,
} from '@getgrowly/core';

import { useDashboardState } from './use-dashboard';

export const useOrganizationResourceActions = () => {
  const {
    organizationResources,
    setOrganizationResources,
    fetchCurrentOrganizationResources,
    organizationResourceStatus,
  } = useDashboardState();

  const actions = useResourceActions({
    resources: organizationResources,
    setResources: setOrganizationResources,
  });

  useEffect(() => {
    fetchCurrentOrganizationResources();
  }, []);

  return {
    ...actions,
    organizationResources,
    setOrganizationResources,
    organizationResourceStatus,
  };
};

export const useResourceActions = ({
  resources,
  setResources,
}: {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAddResource = useCallback(
    async (resource: ParsedResourceInsert) => {
      setIsLoading(true);
      setError(null);

      try {
        const resourceWithABI = await getResourceWithABI(resource);
        const newResource = await suiteCore.db.resources.create(resourceWithABI);
        const updatedResources = [...resources, newResource as ParsedResource];
        setResources(updatedResources);
        toast.success('Resource created successfully');
        return newResource as ParsedResource;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create resource');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [resources]
  );

  const handleDeleteResource = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await suiteCore.db.resources.delete(id);
        toast.success('Resource deleted successfully');
        setResources(resources.filter(resource => resource.id !== id));
      } catch (err) {
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [resources]
  );

  return {
    isLoading,
    error,
    handleAddResource,
    handleDeleteResource,
  };
};

export const getResourceWithABI = async (updatedResource: TypedResource<ResourceType>) => {
  if (updatedResource.type !== 'contract') {
    return updatedResource;
  }

  const value = updatedResource.value as ContractValue;
  try {
    // Attempt to fetch the contract ABI
    const abi = await ResourceService.getContractABI(value.address, value.chainId);
    // Update the resource with the ABI
    updatedResource = {
      ...updatedResource,
      value: {
        ...value,
        abi,
      },
    } as TypedResource<'contract'>;
    return updatedResource;
  } catch (abiError) {
    console.error('Failed to fetch contract ABI:', abiError);
    toast.error('Could not retrieve contract ABI. The contract may not be verified.');
    return updatedResource;
  }
};
