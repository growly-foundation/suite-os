'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  isContractResource,
  isDocumentResource,
  isLinkResource,
  isTextResource,
} from '@/utils/resource.utils';
import { format } from 'date-fns';
import { Code as CodeIcon, ExternalLink, File, Pencil, Save, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { ResourceType, TypedResource } from '@getgrowly/core';

import { PrimaryButton } from '../buttons/primary-button';
import { ResourceIcon } from './resource-icon';

// Dynamically import the markdown preview component to avoid SSR issues
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

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

        {isTextResource(editedResource) && (
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="format" className="text-sm">
                Format:
              </Label>
              <select
                id="format"
                className="text-sm px-2 py-1 rounded-md border bg-background"
                value={editedResource.value.format || ''}
                onChange={e =>
                  setEditedResource(
                    prev =>
                      ({
                        ...prev,
                        value: {
                          ...prev.value,
                          format: e.target.value || undefined,
                        },
                      }) as TypedResource<ResourceType>
                  )
                }>
                <option value="">Plain text</option>
                <option value="markdown">Markdown</option>
              </select>
            </div>
            <Textarea
              id="content"
              value={editedResource.value.content || ''}
              onChange={e =>
                setEditedResource(
                  prev =>
                    ({
                      ...prev,
                      value: {
                        ...prev.value,
                        content: e.target.value,
                      },
                    }) as TypedResource<ResourceType>
                )
              }
              className="min-h-[300px] text-sm"
              placeholder={
                editedResource.value.format === 'markdown'
                  ? '# Markdown supported\n\nYou can write **bold**, *italic*, and `code` here.'
                  : 'Enter content here'
              }
            />
            {editedResource.value.format === 'markdown' && editedResource.value.content && (
              <div className="mt-4">
                <Label className="mb-2 block">Preview:</Label>
                <div className="rounded-md border p-4 bg-muted/10">
                  <MarkdownPreview source={editedResource.value.content} />
                </div>
              </div>
            )}
          </div>
        )}

        {isLinkResource(editedResource) && (
          <>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={editedResource.value.url || ''}
                onChange={e =>
                  setEditedResource(
                    prev =>
                      ({
                        ...prev,
                        value: {
                          ...prev.value,
                          url: e.target.value,
                        },
                      }) as TypedResource<ResourceType>
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="text-sm"
                value={editedResource.value.description || ''}
                onChange={e =>
                  setEditedResource(
                    prev =>
                      ({
                        ...prev,
                        value: {
                          ...prev.value,
                          description: e.target.value,
                        },
                      }) as TypedResource<ResourceType>
                  )
                }
              />
            </div>
          </>
        )}

        {isContractResource(editedResource) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Contract Address</Label>
              <Input
                id="address"
                value={editedResource.value.address || ''}
                onChange={e =>
                  setEditedResource(
                    prev =>
                      ({
                        ...prev,
                        value: {
                          ...prev.value,
                          address: e.target.value,
                        },
                      }) as TypedResource<ResourceType>
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chainId">Chain ID</Label>
              <select
                id="chainId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editedResource.value.chainId || 1}
                onChange={e =>
                  setEditedResource(
                    prev =>
                      ({
                        ...prev,
                        value: {
                          ...prev.value,
                          chainId: Number(e.target.value),
                        },
                      }) as TypedResource<ResourceType>
                  )
                }>
                <option value="1">Ethereum Mainnet</option>
                <option value="8453">Base</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <PrimaryButton onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </PrimaryButton>
        </div>
      </div>
    );
  };

  const renderViewMode = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-muted-foreground">Name</Label>
            <h3 className="text-base font-medium">{resource.name}</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>Created: {format(new Date(resource.created_at), 'MMM dd, yyyy HH:mm')}</div>
            {/* Show updated date if available from the server */}
            {'updated_at' in resource && resource['updated_at'] !== resource.created_at && (
              <div>
                Updated: {format(new Date(resource['updated_at'] as string), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>

        {isTextResource(resource) && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Content</Label>
            {resource.value.format === 'markdown' ? (
              <div className="rounded-md border overflow-hidden">
                <MarkdownPreview
                  source={resource.value.content || 'No content'}
                  className="p-4 bg-card"
                />
              </div>
            ) : (
              <div className="rounded-md border p-4 text-sm whitespace-pre-wrap bg-muted/10">
                {resource.value.content || 'No content'}
              </div>
            )}
          </div>
        )}

        {isDocumentResource(resource) && (
          <div className="space-x-4">
            <Label className="text-sm font-medium text-muted-foreground">Document</Label>
            {resource.value.documentUrl ? (
              <div className="rounded-md border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {resource.value.documentType?.toUpperCase() || 'Document'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={resource.value.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    Download <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No document uploaded</p>
              </div>
            )}
          </div>
        )}

        {isLinkResource(resource) && (
          <>
            <div className="space-x-4">
              <Label className="text-sm font-medium text-muted-foreground">URL</Label>
              <a
                href={resource.value.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:underline break-all bg-muted/10 p-3 rounded-md border block">
                {resource.value.url}
                <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
              </a>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="text-sm"
                value={resource.value.description || ''}
                readOnly
              />
            </div>
          </>
        )}

        {isContractResource(resource) && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Contract Address</Label>
              <div className="rounded-md bg-muted p-2 text-sm border">
                {resource.value.address || 'No address'}
              </div>
            </div>
            {resource.value.chainId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Chain ID</Label>
                <div className="text-sm">{resource.value.chainId}</div>
              </div>
            )}
            {resource.value.abi && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Contract ABI</Label>
                  <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                    <CodeIcon className="h-3 w-3" /> JSON
                  </div>
                </div>
                <div className="max-h-[500px] overflow-auto rounded-md border">
                  <SyntaxHighlighter
                    language="json"
                    style={oneLight}
                    customStyle={{ margin: 0, borderRadius: '0.375rem' }}>
                    {typeof resource.value.abi === 'string'
                      ? resource.value.abi
                      : JSON.stringify(resource.value.abi, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="pt-4">
          <PrimaryButton onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </PrimaryButton>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <ResourceIcon type={resource.type} />
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Details
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
