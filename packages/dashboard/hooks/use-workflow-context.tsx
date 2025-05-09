'use client';
import { WorkflowTable } from '@growly/core';
import React, { useEffect, useState } from 'react';
import { growlySuiteCore } from '@/core/sdk';
import { useDashboardState } from '@/hooks/use-dashboard';

const WorkflowManagementContext = React.createContext<{
  selectedWorkflowId: string | null;

  // States
  isLoading: boolean;
  isCreateWorkflowOpen: boolean;
  setIsLoading: (loading: boolean) => void;
  setSelectedWorkflowId: (id: string | null) => void;
  setIsCreateWorkflowOpen: (open: boolean) => void;

  // Workflow Actions
  fetchWorkflows: () => Promise<void>;
  createWorkflow: (name: string, description: string) => Promise<void>;
  updateWorkflow: (name: string, description: string) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
}>({
  selectedWorkflowId: null,
  isLoading: false,
  isCreateWorkflowOpen: false,
  setIsLoading: () => {},
  setSelectedWorkflowId: () => {},
  fetchWorkflows: async () => {},
  createWorkflow: async (_name: string, _description: string) => {},
  updateWorkflow: async (_name: string, _description: string) => {},
  deleteWorkflow: async () => {},
  setIsCreateWorkflowOpen: () => {},
});

export const WorkflowManagementContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedOrganization } = useDashboardState();
  const [workflows, setWorkflows] = useState<WorkflowTable[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    setIsLoading(true);
    try {
      const result = await growlySuiteCore.db.workflows.getAll();
      setWorkflows(result);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkflow(name: string, description: string) {
    if (!selectedOrganization) throw new Error('No organization selected');
    setIsLoading(true);
    try {
      await growlySuiteCore.db.workflows.create({
        name,
        description,
        status: 'active',
        organization_id: selectedOrganization.id,
      });
      setIsCreateWorkflowOpen(false);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateWorkflow(name: string, description: string) {
    setIsLoading(true);
    try {
      await growlySuiteCore.db.workflows.update(selectedWorkflowId!, {
        name,
        description,
      });
      setIsCreateWorkflowOpen(false);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteWorkflow(workflowId: string) {
    setIsLoading(true);
    try {
      await growlySuiteCore.db.workflows.delete(workflowId);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <WorkflowManagementContext.Provider
      value={{
        selectedWorkflowId,

        // States
        isLoading,
        isCreateWorkflowOpen,
        setIsLoading,
        setSelectedWorkflowId,
        setIsCreateWorkflowOpen,

        // Workflow Actions
        fetchWorkflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
      }}>
      {children}
    </WorkflowManagementContext.Provider>
  );
};

export const useCreateWorkflowContext = () => {
  const context = React.useContext(WorkflowManagementContext);
  if (!context) {
    throw new Error('useCreateWorkflowContext must be used within a CreateWorkflowContextProvider');
  }
  return context;
};
