'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { ResourceIcon } from '@/components/resources/resource-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, Trash } from 'lucide-react';

import { Resource } from '@getgrowly/core';

export function ResourcePageLayout({
  title,
  resources,
  onResourceDelete,
  onResourceAdd,
}: {
  title: string;
  resources: Resource[];
  onResourceDelete: (id: string) => void;
  onResourceAdd: () => void;
  agentId?: string;
}) {
  return (
    <PaddingLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center gap-5">
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>
                  Manage the resources, including smart contracts, links, and documents.
                </CardDescription>
              </div>
              <Button className="rounded-full" onClick={onResourceAdd}>
                <PlusIcon /> Add Resource
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <ResourceIcon type={resource.type} />
                      </div>
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
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onResourceDelete(resource.id)}>
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
