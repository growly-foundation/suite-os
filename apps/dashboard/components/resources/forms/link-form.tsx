import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

import { LinkValue } from '@getgrowly/core';

interface LinkFormProps {
  onChange: (data: LinkValue) => void;
  initialData?: Partial<LinkValue>;
}

export function LinkForm({ onChange, initialData }: LinkFormProps) {
  const [formData, setFormData] = useState<LinkValue>({
    url: '',
    description: '',
    ...initialData,
  });

  const handleChange = (updates: Partial<LinkValue>) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        ...updates,
      };
      onChange(updatedData);
      return updatedData;
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          value={formData.url}
          onChange={e => handleChange({ url: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">The URL of the link</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Description"
          className="text-sm"
          value={formData.description}
          onChange={e => handleChange({ description: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">The description of the link</p>
      </div>
    </div>
  );
}
