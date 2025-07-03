'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { ResourceDetails } from '@/components/resources/resource-details';
import { ResourceListItem } from '@/components/resources/resource-list-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { ResourceType, TypedResource } from '@getgrowly/core';

import { PrimaryButton } from '../buttons/primary-button';

export function ResourcePageLayout({
  title,
  resources,
  onResourceDelete,
  onResourceAdd,
}: {
  title: string;
  resources: TypedResource<ResourceType>[];
  onResourceDelete: (id: string) => void;
  onResourceAdd: () => void;
  agentId?: string;
}) {
  const [selectedResource, setSelectedResource] = useState<TypedResource<ResourceType> | null>(
    null
  );

  const handleResourceClick = (resource: TypedResource<ResourceType>) => {
    setSelectedResource(resource);
  };

  const handleSaveResource = (updatedResource: TypedResource<ResourceType>) => {
    // Here you would typically make an API call to save the updated resource
    console.log('Saving resource:', updatedResource);
    // Update the resources array with the updated resource
    setSelectedResource(updatedResource);
  };

  return (
    <PaddingLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center gap-5">
              <div>
                <CardTitle className="text-xl">
                  {selectedResource ? 'Resource Details' : title}
                </CardTitle>
                <CardDescription>
                  {selectedResource
                    ? 'View and edit resource details'
                    : 'Manage the resources, including smart contracts, links, and documents.'}
                </CardDescription>
              </div>
              {selectedResource ? (
                <Button variant="outline" size="sm" onClick={() => setSelectedResource(null)}>
                  Back to List
                </Button>
              ) : (
                <PrimaryButton onClick={onResourceAdd}>
                  <PlusIcon /> Add Resource
                </PrimaryButton>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedResource ? (
              <ResourceDetails
                resource={selectedResource}
                onSave={handleSaveResource}
                onClose={() => setSelectedResource(null)}
              />
            ) : resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No resources added</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map(resource => (
                    <ResourceListItem
                      key={resource.id}
                      resource={resource}
                      onDelete={onResourceDelete}
                      onClick={() => handleResourceClick(resource)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PaddingLayout>
  );
}
