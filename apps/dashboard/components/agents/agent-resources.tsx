'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useResourceActions } from '@/hooks/use-resource-actions';
import { Code, FileText, Globe, Trash } from 'lucide-react';

import { ResourceType } from '@getgrowly/core';

export function AgentResources() {
  const { resources, handleRemoveResource } = useResourceActions();

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'contract':
        return <Code className="h-4 w-4" />;
      case 'link':
        return <Globe className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <PaddingLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Agent Resources</CardTitle>
            <CardDescription>
              Manage the resources this agent can access, including smart contracts, links, and
              documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources added to this agent</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getResourceIcon(resource.type)}</div>
                      <div className="space-y-1">
                        <div className="font-medium">{resource.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveResource(resource.id)}
                      className="text-muted-foreground hover:text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PaddingLayout>
  );
}
