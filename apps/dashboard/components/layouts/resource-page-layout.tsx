'use client';

import { PaddingLayout } from '@/app/dashboard/layout';
import { ResourceDetails } from '@/components/resources/resource-details';
import { ResourceListItem } from '@/components/resources/resource-list-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { suiteCore } from '@/core/suite';
import { getResourceWithABI } from '@/hooks/use-resource-actions';
import { ArrowLeft, PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { ParsedResource, ResourceType, TypedResource } from '@getgrowly/core';

import { AnimatedLoadingSmall } from '../animated-components/animated-loading-small';
import { PrimaryButton } from '../buttons/primary-button';
import { Loadable } from '../ui/loadable';

export function ResourcePageLayout({
  title,
  resources,
  resourceLoading,
  onResourceDelete,
  onResourceAdd,
  onResourceUpdate,
  additionalActions,
}: {
  title: string;
  resources: TypedResource<ResourceType>[];
  resourceLoading?: boolean;
  onResourceDelete?: (id: string) => void;
  onResourceAdd?: () => void;
  onResourceUpdate?: (updatedResource: TypedResource<ResourceType>) => void;
  additionalActions?: React.ReactNode;
}) {
  const [selectedResource, setSelectedResource] = useState<TypedResource<ResourceType> | null>(
    null
  );

  const handleResourceClick = (resource: TypedResource<ResourceType>) => {
    setSelectedResource(resource);
  };

  const handleSaveResource = async (updatedResource: TypedResource<ResourceType>) => {
    try {
      if (!onResourceUpdate) return;
      const updatedResourceWithABI = await getResourceWithABI(updatedResource);
      // Update the resource in the backend
      const savedResource = await suiteCore.db.resources.update(
        updatedResourceWithABI.id,
        updatedResourceWithABI
      );
      // Update the UI
      setSelectedResource(savedResource as ParsedResource);
      onResourceUpdate(savedResource as ParsedResource);
      toast.success('The resource was successfully updated');
    } catch (error) {
      console.error('Failed to save resource:', error);
      toast.error('There was an error saving the resource');
    }
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
              <div className="flex gap-2">
                {selectedResource ? (
                  <Button variant="outline" size="sm" onClick={() => setSelectedResource(null)}>
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to List
                  </Button>
                ) : onResourceAdd ? (
                  <PrimaryButton onClick={onResourceAdd}>
                    <PlusIcon /> Add Resource
                  </PrimaryButton>
                ) : null}
                {additionalActions}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedResource ? (
              <ResourceDetails
                resource={selectedResource}
                onSave={handleSaveResource}
                onClose={() => setSelectedResource(null)}
              />
            ) : (
              <React.Fragment>
                <Loadable loading={!!resourceLoading} fallback={<AnimatedLoadingSmall />}>
                  {resources.length === 0 ? (
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
                </Loadable>
              </React.Fragment>
            )}
          </CardContent>
        </Card>
      </div>
    </PaddingLayout>
  );
}
