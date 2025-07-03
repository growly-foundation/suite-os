'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { availableModels } from '@/constants/agents';
import { useDashboardState } from '@/hooks/use-dashboard';
import { Loader, SaveIcon } from 'lucide-react';
import type React from 'react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  AggregatedAgent,
  ParsedResource,
  ResourceType,
  Status,
  TypedResource,
  Workflow,
} from '@getgrowly/core';

import { PrimaryButton } from '../buttons/primary-button';
import { ResourceListItem } from '../resources/resource-list-item';
import { WorkflowSmallCard } from '../workflows/workflow-small-card';
import { AgentModelCard } from './agent-model-card';

interface AgentFormProps {
  formData: AggregatedAgent;
  setFormData: Dispatch<SetStateAction<AggregatedAgent>>;
  onSave: (agent: AggregatedAgent) => Promise<void>;
}

export function AgentForm({ formData, setFormData, onSave }: AgentFormProps) {
  const {
    organizationWorkflows,
    organizationResources,
    fetchOrganizationWorkflows,
    fetchCurrentOrganizationResources,
  } = useDashboardState();
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      status: checked ? Status.Active : Status.Inactive,
    }));
  };

  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, model: value }));
  };

  const toggleWorkflow = (workflow: Workflow) => {
    setFormData(prev => {
      if (prev.workflows.some(w => w.id === workflow.id)) {
        return {
          ...prev,
          workflows: prev.workflows.filter(w => w.id !== workflow.id),
        };
      } else {
        return {
          ...prev,
          workflows: [...prev.workflows, workflow],
        };
      }
    });
  };

  const toggleResource = (resource: TypedResource<ResourceType>) => {
    setFormData(prev => {
      if (prev.resources.some(r => r.id === resource.id)) {
        return {
          ...prev,
          resources: prev.resources.filter(r => r.id !== resource.id) as ParsedResource[],
        };
      } else {
        return {
          ...prev,
          resources: [...prev.resources, resource] as ParsedResource[],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      setIsSaving(true);
      e.preventDefault();
      await onSave(formData);
    } catch (error: any) {
      console.log(error);
      toast.error(`Failed to save agent: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchOrganizationWorkflows();
    fetchCurrentOrganizationResources();
  }, []);

  return (
    <div>
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Agent name"
              required
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={formData.model} onValueChange={handleModelChange}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <AgentModelCard model={model} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <br />
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <p className="text-sm text-muted-foreground">
            The description should provide a brief overview of the agent's purpose and capabilities.
          </p>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Describe what this agent does"
            style={{
              fontSize: '14px',
              fontWeight: 'normal',
            }}
            rows={5}
            className="bg-gray-50 dark:bg-gray-900"
          />
        </div>
        <br />
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
          <Switch
            id="status"
            checked={formData.status === Status.Active}
            onCheckedChange={handleStatusChange}
          />
          <Label htmlFor="status" className="font-medium text-xs">
            {formData.status === Status.Active ? 'Active' : 'Inactive'}
          </Label>
          <span className="text-xs text-muted-foreground ml-2">
            {formData.status === Status.Active
              ? 'Agent is currently active and processing requests'
              : 'Agent is inactive and not processing requests'}
          </span>
        </div>
      </div>
      <br />
      <div className="space-y-4">
        <div>
          <Label className="text-base">Resources</Label>
          <p className="text-sm text-muted-foreground mb-2">Resources that this agent can access</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
            {organizationResources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources available</p>
            ) : (
              organizationResources.map(resource => (
                <ResourceListItem
                  key={resource.id}
                  resource={resource as TypedResource<ResourceType>}
                  onClick={toggleResource}
                  className={
                    formData.resources.some(r => r.id === resource.id)
                      ? 'border-primary bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary'
                      : ''
                  }
                  noPreview
                />
              ))
            )}
          </div>
        </div>
        <div>
          <Label className="text-base">Workflows</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Workflows that the agent executes when triggered
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-2">
            {organizationWorkflows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workflows available</p>
            ) : (
              organizationWorkflows.map(workflow => (
                <WorkflowSmallCard
                  key={workflow.id}
                  workflow={workflow}
                  isSelected={formData.workflows.some(w => w.id === workflow.id)}
                  onClick={toggleWorkflow}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <br />
      <div className="flex justify-end space-x-2">
        <Button size="sm" type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <PrimaryButton type="submit" onClick={handleSubmit} disabled={isSaving || !formData.name}>
          {isSaving ? (
            <Loader className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Agent'}
        </PrimaryButton>
      </div>
    </div>
  );
}
