'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { AggregatedWorkflow } from '@growly/core';

interface WorkflowSettingsProps {
  workflow: AggregatedWorkflow;
  setWorkflow: (workflow: AggregatedWorkflow) => void;
}

export function WorkflowSettings({ workflow, setWorkflow }: WorkflowSettingsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWorkflow({ ...workflow, [name]: value });
  };

  const handleStatusChange = (checked: boolean) => {
    setWorkflow({ ...workflow, status: checked ? 'active' : 'inactive' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Settings</CardTitle>
        <CardDescription>Configure the basic settings for your workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Workflow Name</Label>
          <Input
            id="name"
            name="name"
            value={workflow.name}
            onChange={handleInputChange}
            placeholder="Enter workflow name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={workflow.description || ''}
            onChange={handleInputChange}
            placeholder="Describe what this workflow does"
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={workflow.status === 'active'}
            onCheckedChange={handleStatusChange}
          />
          <Label htmlFor="status">{workflow.status === 'active' ? 'Active' : 'Inactive'}</Label>
          <span className="text-sm text-muted-foreground ml-2">
            {workflow.status === 'active'
              ? 'Workflow is currently active and processing'
              : 'Workflow is inactive and not processing'}
          </span>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Danger Zone</h3>
          <Button variant="destructive">Delete Workflow</Button>
        </div>
      </CardContent>
    </Card>
  );
}
