import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

import { TextValue } from '@getgrowly/core';

interface TextFormProps {
  onChange: (data: TextValue) => void;
  initialData?: Partial<TextValue>;
}

export function TextForm({ onChange, initialData }: TextFormProps) {
  const [formData, setFormData] = useState<TextValue>({
    content: '',
    format: 'plain',
    ...(initialData || {}),
  });

  const handleChange = (updates: Partial<TextValue>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={e => handleChange({ content: e.target.value })}
          className="min-h-[200px] text-sm"
          placeholder="Enter your text content here..."
          maxLength={500} // Limit to 500 characters so that agent can read it directly from the prompt
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Select
          value={formData.format}
          onValueChange={value => handleChange({ format: value as 'plain' | 'markdown' })}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
