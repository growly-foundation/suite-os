import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

import { LinkResourceValue } from '@getgrowly/core';

interface LinkFormProps {
  onChange: (data: LinkResourceValue['value']) => void;
  initialData?: Partial<LinkResourceValue['value']>;
}

export function LinkForm({ onChange, initialData }: LinkFormProps) {
  const [formData, setFormData] = useState<LinkResourceValue['value']>({
    url: '',
    included_path: '',
    exclude_path: '',
    ...initialData,
  });

  const handleChange = (updates: Partial<LinkResourceValue['value']>) => {
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
      <Card>
        <CardContent className="pt-6 space-y-4">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="included-path">Included Path (Optional)</Label>
            <Input
              id="included-path"
              placeholder="/docs"
              value={formData.included_path}
              onChange={e => handleChange({ included_path: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Only include pages under this path (e.g., /docs)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exclude-path">Exclude Path (Optional)</Label>
            <Input
              id="exclude-path"
              placeholder="/docs/archive"
              value={formData.exclude_path}
              onChange={e => handleChange({ exclude_path: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Exclude pages under this path (e.g., /docs/archive)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
