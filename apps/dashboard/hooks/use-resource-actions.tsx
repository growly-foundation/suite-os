import { suiteCore } from '@/core/suite';
import { useCallback, useEffect, useState } from 'react';

import { ParsedResource, ResourceType, Status } from '@getgrowly/core';

import { useDashboardState } from './use-dashboard';

type ResourceInput = {
  name: string;
  type: ResourceType;
  value: any;
  status: Status;
  organization_id: string;
};

export const useAgentResourceActions = () => {
  const { selectedAgent } = useDashboardState();
  const [resources, setResources] = useState<ParsedResource[]>(selectedAgent?.resources || []);
};

export const useResourceActions = () => {
  const [resources, setResources] = useState<ParsedResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAddResource = useCallback(async (resource: ResourceInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newResource = await suiteCore.db.resources.create(resource);
      setResources(prevResources => {
        // Ensure we're not duplicating the resource
        if (prevResources.some(r => r.id === (newResource as ParsedResource).id)) {
          return prevResources;
        }
        return [...prevResources, newResource as ParsedResource];
      });
      return newResource as ParsedResource;
    } catch (err) {
      console.error('Error creating resource:', err);
      const error = err instanceof Error ? err : new Error('Failed to create resource');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateResource = useCallback(async (id: string, updates: Partial<Omit<ResourceInput, 'id' | 'created_at'>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedResource = await suiteCore.db.resources.update(id, updates);
      setResources(prevResources => 
        prevResources.map(resource => 
          resource.id === id ? { ...resource, ...updatedResource } as ParsedResource : resource
        )
      );
      return updatedResource as ParsedResource;
    } catch (err) {
      console.error('Error updating resource:', err);
      const error = err instanceof Error ? err : new Error('Failed to update resource');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteResource = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await suiteCore.db.resources.delete(id);
      setResources(prevResources => prevResources.filter(resource => resource.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      const error = err instanceof Error ? err : new Error('Failed to delete resource');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load resources for the current agent if needed
  const { selectedAgent } = useDashboardState();
  
  useEffect(() => {
    if (selectedAgent?.resources) {
      setResources(selectedAgent.resources);
    }
  }, [selectedAgent?.resources]);

  return {
    resources,
    isLoading,
    error,
    handleAddResource,
    handleUpdateResource,
    handleDeleteResource,
  };
};
