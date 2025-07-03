import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileText, Link as LinkIcon, Text as TextIcon } from 'lucide-react';
import { useState } from 'react';

import { ResourceType, ResourceValue } from '@getgrowly/core';

import { ContractForm } from './contract-form';
import { DocumentForm } from './document-form';
import { LinkForm } from './link-form';
import { TextForm } from './text-form';

interface ResourceFormProps {
  onSubmit: (data: { name: string } & ResourceValue) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

type ResourceFormState = {
  type: ResourceType;
  name: string;
  formData: any;
};

export function ResourceForm({ onSubmit, isSubmitting, onCancel }: ResourceFormProps) {
  const [state, setState] = useState<ResourceFormState>({
    type: 'text',
    name: '',
    formData: { content: '', format: 'plain' },
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
      formData: null,
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
      case 'text':
        return <TextForm onChange={handleFormDataChange} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <Tabs
          value={state.type}
          onValueChange={value => handleTypeChange(value as ResourceType)}
          className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text" onClick={() => handleTypeChange('text')}>
              <TextIcon className="mr-2 h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="document" onClick={() => handleTypeChange('document')}>
              <FileText className="mr-2 h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="link" onClick={() => handleTypeChange('link')}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="contract" onClick={() => handleTypeChange('contract')}>
              <Code className="mr-2 h-4 w-4" />
              Contract
            </TabsTrigger>
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
        <Button type="submit" size="sm" disabled={isSubmitting || !state.formData}>
          {isSubmitting ? 'Adding...' : 'Add Resource'}
        </Button>
      </div>
    </form>
  );
}
