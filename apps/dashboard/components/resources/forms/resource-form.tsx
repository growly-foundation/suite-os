import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileText, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

import { ResourceType, ResourceValue, ResourceValueValue } from '@getgrowly/core';

import { ContractForm } from './contract-form';
import { DocumentForm } from './document-form';
import { LinkForm } from './link-form';

interface ResourceFormProps {
  onSubmit: (data: { name: string } & ResourceValue) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

type ResourceFormState = {
  type: ResourceType;
  name: string;
  formData: ResourceValueValue | null;
};

export function ResourceForm({ onSubmit, isSubmitting, onCancel }: ResourceFormProps) {
  const [state, setState] = useState<ResourceFormState>({
    type: 'document',
    name: '',
    formData: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.formData) return;

    onSubmit({
      name: state.name,
      type: state.type,
      value: state.formData,
    } as any);
  };

  const handleTypeChange = (type: ResourceType) => {
    setState(prev => ({
      ...prev,
      type,
      formData: null, // Reset form data when type changes
    }));
  };

  const handleFormDataChange = (formData: any) => {
    setState(prev => ({
      ...prev,
      formData,
    }));
  };

  const renderForm = () => {
    switch (state.type) {
      case 'contract':
        return <ContractForm onChange={handleFormDataChange} />;
      case 'link':
        return <LinkForm onChange={handleFormDataChange} />;
      case 'document':
        return <DocumentForm onChange={handleFormDataChange} />;
      default:
        return null;
    }
  };

  const resourceTabs = [
    {
      id: 'contract',
      label: 'Contract',
      icon: <Code className="h-4 w-4 mr-2" />,
    },
    {
      id: 'link',
      label: 'Link',
      icon: <LinkIcon className="h-4 w-4 mr-2" />,
    },
    {
      id: 'document',
      label: 'Document',
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <Tabs
          value={state.type}
          onValueChange={value => handleTypeChange(value as ResourceType)}
          className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {resourceTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center gap-2">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={state.name}
            onChange={e => setState(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter resource name"
            required
          />
        </div>

        {renderForm()}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !state.formData}>
          {isSubmitting ? 'Adding...' : 'Add Resource'}
        </Button>
      </div>
    </form>
  );
}
