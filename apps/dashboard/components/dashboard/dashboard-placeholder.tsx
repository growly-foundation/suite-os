'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FilePlus, Plus, Users } from 'lucide-react';
import React from 'react';

interface DashboardPlaceholderProps {
  hasAgents: boolean;
  hasUsers: boolean;
  hasResources: boolean;
  hasWorkflows: boolean;
  onCreateAgent?: () => void;
  onUploadResource?: () => void;
  onInviteUsers?: () => void;
  onCreateWorkflow?: () => void;
}

export function DashboardPlaceholder({
  hasAgents,
  hasUsers,
  hasResources,
  hasWorkflows,
  onCreateAgent,
  onUploadResource,
  onInviteUsers,
  onCreateWorkflow,
}: DashboardPlaceholderProps) {
  const allEmpty = !hasAgents && !hasUsers && !hasResources && !hasWorkflows;

  if (allEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Welcome to Suite!</h3>
            <p className="text-muted-foreground">
              Let's get your organization set up. Start by creating your first AI agent.
            </p>
          </div>

          <div className="grid gap-3">
            <Button onClick={onCreateAgent} className="w-full justify-start" size="lg">
              <Bot className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hasAgents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              No Agents Yet
            </CardTitle>
            <CardDescription>
              Create your first AI agent to start automating conversations and workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasResources && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus className="h-5 w-5" />
              No Resources Uploaded
            </CardTitle>
            <CardDescription>
              Upload knowledge resources to help your AI agents provide better responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onUploadResource}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasUsers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              No Users Yet
            </CardTitle>
            <CardDescription>
              Invite users to start interacting with your AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onInviteUsers}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Users
            </Button>
          </CardContent>
        </Card>
      )}

      {hasAgents && !hasWorkflows && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              No Workflows Created
            </CardTitle>
            <CardDescription>
              Create workflows to automate complex processes with your AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onCreateWorkflow}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
