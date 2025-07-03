'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';

import { ResourceType, TypedResource } from '@getgrowly/core';

type ResourceDetailsProps = {
  resource: TypedResource<ResourceType>;
  onSave: (resource: TypedResource<ResourceType>) => void;
  onClose: () => void;
};

export function ResourceDetails({ resource, onSave, onClose }: ResourceDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResource, setEditedResource] = useState(resource);

  const handleSave = () => {
    onSave(editedResource);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (!isEditing) return renderViewMode();

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={editedResource.name}
            onChange={e =>
              setEditedResource(
                prev =>
                  ({
                    ...prev,
                    name: e.target.value,
                  }) as TypedResource<ResourceType>
              )
            }
          />
        </div>

        {editedResource.type === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={(editedResource.value as any).content || ''}
              onChange={e =>
                setEditedResource(
                  prev =>
                    ({
                      ...prev,
                      value: {
                        ...(prev.value as any),
                        content: e.target.value,
                      },
                    }) as TypedResource<ResourceType>
                )
              }
              className="min-h-[200px]"
            />
          </div>
        )}

        {editedResource.type === 'link' && (
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={(editedResource.value as any).url || ''}
              onChange={e =>
                setEditedResource(
                  prev =>
                    ({
                      ...prev,
                      value: {
                        ...(prev.value as any),
                        url: e.target.value,
                      },
                    }) as TypedResource<ResourceType>
                )
              }
            />
          </div>
        )}

        {editedResource.type === 'contract' && (
          <div className="space-y-2">
            <Label htmlFor="address">Contract Address</Label>
            <Input
              id="address"
              value={(editedResource.value as any).address || ''}
              onChange={e =>
                setEditedResource(
                  prev =>
                    ({
                      ...prev,
                      value: {
                        ...(prev.value as any),
                        address: e.target.value,
                      },
                    }) as TypedResource<ResourceType>
                )
              }
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    );
  };

  const renderViewMode = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Name</Label>
          <p className="text-sm">{resource.name}</p>
        </div>

        {resource.type === 'text' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Content</Label>
            <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
              {(resource.value as any).content || 'No content'}
            </div>
          </div>
        )}

        {resource.type === 'link' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">URL</Label>
            <a
              href={(resource.value as any).url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:underline break-all">
              {(resource.value as any).url}
              <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {resource.type === 'contract' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Contract Address</Label>
            <div className="rounded-md bg-muted p-2 font-mono text-sm">
              {(resource.value as any).address || 'No address'}
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Details
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            {renderContent()}
          </TabsContent>
          <TabsContent value="activity" className="pt-4">
            <p className="text-sm text-muted-foreground">Activity log will be displayed here.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
