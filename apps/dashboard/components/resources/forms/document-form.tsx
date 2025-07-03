import { Label } from '@/components/ui/label';
import { getDocumentType } from '@/utils/file.utils';
import { FileText as FileTextIcon, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

import { DocumentValue } from '@getgrowly/core';

interface DocumentFormProps {
  onChange: (data: DocumentValue) => void;
  initialData?: Partial<DocumentValue>;
}

export function DocumentForm({ onChange, initialData }: DocumentFormProps) {
  const [formData, setFormData] = useState<DocumentValue>({
    documentUrl: '',
    documentName: '',
    documentSize: 0,
    documentType: '',
    ...initialData,
  } as DocumentValue);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData(prev => {
        const updatedData: DocumentValue = {
          ...prev,
          documentName: file.name,
          documentSize: file.size,
          documentType: getDocumentType(file.name),
        };
        onChange(updatedData);
        return updatedData;
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      <Label htmlFor="file-upload">Upload Document</Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 10MB)</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {formData.documentName && (
        <div className="p-3 text-sm border rounded-md bg-muted/50">
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{formData.documentName}</p>
              {formData.documentSize && (
                <p className="text-xs text-muted-foreground">
                  {(formData.documentSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
