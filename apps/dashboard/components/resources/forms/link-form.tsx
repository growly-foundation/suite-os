import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResourceService } from '@/services/resource.service';
import { useEffect, useState } from 'react';

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
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

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

  // Function to check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Extract description when URL changes
  useEffect(() => {
    const extractDescription = async () => {
      if (!formData.url || !isValidUrl(formData.url)) {
        return;
      }

      // Skip extraction if description is already manually set
      if (formData.description && formData.description !== '') {
        return;
      }

      setIsExtracting(true);
      setExtractionError(null);

      try {
        const result = await ResourceService.extractWebsiteDescription(formData.url);

        if (result.success && result.description) {
          handleChange({ description: result.description });
        } else {
          const errorMsg = result.message || 'Failed to extract description';
          setExtractionError(errorMsg);
          // Set a basic fallback description
          handleChange({ description: 'Website resource' });
        }
      } catch (error: any) {
        let errorMessage = 'Failed to extract description';

        if (error.response?.status === 404) {
          errorMessage = 'API endpoint not found';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error - please try again later';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error - check your connection';
        } else if (error.message) {
          errorMessage = error.message;
        }

        setExtractionError(errorMessage);
        // Set a basic fallback description
        handleChange({ description: 'Website resource' });
      } finally {
        setIsExtracting(false);
      }
    };

    // Debounce the extraction to avoid too many API calls
    const timeoutId = setTimeout(extractDescription, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.url]);

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
        <Label htmlFor="description">
          Description {isExtracting && <span className="text-blue-500">(Extracting...)</span>}
        </Label>
        <Textarea
          id="description"
          placeholder={isExtracting ? 'Extracting description from website...' : 'Description'}
          className="text-sm"
          value={formData.description}
          onChange={e => handleChange({ description: e.target.value })}
          disabled={isExtracting || !formData.url || formData.url.trim() === ''}
        />
        {extractionError && (
          <p className="text-xs text-red-500">
            Failed to auto-extract description: {extractionError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {isExtracting
            ? 'AI is extracting a description from the website content...'
            : 'The description will be auto-generated from the website content. You can edit it if needed.'}
        </p>
      </div>
    </div>
  );
}
