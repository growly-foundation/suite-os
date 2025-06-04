'use client';

import { useComponent } from '@/components/providers/component-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useResourceActions } from '@/hooks/use-resource-actions';
import { useState } from 'react';

import { ResourceType, Status } from '@getgrowly/core';

import { ResourceForm } from './forms/resource-form';

type ParsedResourceInsert = {
  name: string;
  type: ResourceType;
  value: Record<string, any>;
  status: Status;
  organization_id: string;
};

interface AddResourceDrawerProps {
  id: string;
}

export function AddResourceDrawer({ id }: AddResourceDrawerProps) {
  const { toast } = useToast();
  const { selectedOrganization } = useDashboardState();
  const { handleAddResource } = useResourceActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOpen, close } = useComponent(id);

  const handleSubmit = async (data: {
    name: string;
    type: ResourceType;
    value: Record<string, any>;
  }) => {
    if (!selectedOrganization?.id) {
      toast({
        title: 'Error',
        description: 'No organization selected',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const resourceData: ParsedResourceInsert = {
        name: data.name,
        type: data.type,
        value: data.value,
        status: Status.Active,
        organization_id: selectedOrganization.id,
      };

      await handleAddResource(resourceData);

      // Close the drawer on success
      close();
      toast({
        title: 'Resource added',
        description: 'The resource has been added successfully.',
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to add resource. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && close()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
        </DialogHeader>
        <ResourceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
