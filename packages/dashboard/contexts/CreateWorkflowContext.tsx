'use client';
import { WorkflowTable } from '@growly/sdk';
import React, { useEffect, useState } from 'react';
import { growlySdk } from '@/core/growly-services';

const CreateWorkflowContext = React.createContext<{
  workflows: WorkflowTable[];
  selectedWorkflowId: string | null;
  isLoading: boolean;
  newWorkflowName: string;
  newWorkflowDesc: string;
  isCreateWorkflowOpen: boolean;
  setIsLoading: (loading: boolean) => void;
  setSelectedWorkflowId: (id: string | null) => void;
  fetchWorkflows: () => Promise<void>;
  createWorkflow: () => Promise<void>;
  updateWorkflow: () => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  setNewWorkflowName: (name: string) => void;
  setNewWorkflowDesc: (desc: string) => void;
  setIsCreateWorkflowOpen: (open: boolean) => void;
}>({
  workflows: [],
  selectedWorkflowId: null,
  isLoading: false,
  newWorkflowName: '',
  newWorkflowDesc: '',
  isCreateWorkflowOpen: false,
  setIsLoading: () => {},
  setSelectedWorkflowId: () => {},
  fetchWorkflows: async () => {},
  createWorkflow: async () => {},
  updateWorkflow: async () => {},
  deleteWorkflow: async () => {},
  setNewWorkflowName: () => {},
  setNewWorkflowDesc: () => {},
  setIsCreateWorkflowOpen: () => {},
});

export const CreateWorkflowContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [workflows, setWorkflows] = useState<WorkflowTable[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    setIsLoading(true);
    try {
      const result = await growlySdk.db.workflow.getAll();
      setWorkflows(result);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createWorkflow() {
    if (!newWorkflowName || !newWorkflowDesc) return;
    setIsLoading(true);
    try {
      await growlySdk.db.workflow.create({
        name: newWorkflowName,
        description: newWorkflowDesc,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      setNewWorkflowName('');
      setNewWorkflowDesc('');
      setIsCreateWorkflowOpen(false);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateWorkflow() {
    if (!newWorkflowName || !newWorkflowDesc) return;
    setIsLoading(true);
    try {
      await growlySdk.db.workflow.update(selectedWorkflowId!, {
        name: newWorkflowName,
        description: newWorkflowDesc,
      });
      setNewWorkflowName('');
      setNewWorkflowDesc('');
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
      await growlySdk.db.workflow.delete(workflowId);
      await fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CreateWorkflowContext.Provider
      value={{
        workflows,
        selectedWorkflowId,
        isLoading,
        newWorkflowName,
        newWorkflowDesc,
        isCreateWorkflowOpen,
        setIsLoading,
        setSelectedWorkflowId,
        fetchWorkflows,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        setNewWorkflowName,
        setNewWorkflowDesc,
        setIsCreateWorkflowOpen,
      }}>
      {children}
    </CreateWorkflowContext.Provider>
  );
};

export const useCreateWorkflowContext = () => {
  const context = React.useContext(CreateWorkflowContext);
  if (!context) {
    throw new Error('useCreateWorkflowContext must be used within a CreateWorkflowContextProvider');
  }
  return context;
};
