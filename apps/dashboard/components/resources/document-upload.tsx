'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ResourceService } from '@/lib/services/resource.service';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface DocumentUploadProps {
  onUploadComplete: (documentData: { documentUrl: string; documentType: string }) => void;
  onCancel: () => void;
}

export function DocumentUpload({ onUploadComplete, onCancel }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'pdf' | 'docx' | 'csv' | 'txt'>('pdf');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);

      // Try to determine document type from file extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (
        extension === 'pdf' ||
        extension === 'docx' ||
        extension === 'csv' ||
        extension === 'txt'
      ) {
        setDocumentType(extension as 'pdf' | 'docx' | 'csv' | 'txt');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await ResourceService.uploadDocument(file, documentType);
      onUploadComplete(result);

      toast({
        title: 'Upload successful',
        description: 'Document has been uploaded successfully',
      });
    } catch (error) {
      console.error('Upload failed:', error);

      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Upload Document</h2>
          <p className="text-sm text-muted-foreground">
            Select a document to upload as a resource.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <FileUploader
              onFileChange={handleFileChange}
              accept=".pdf,.docx,.csv,.txt"
              maxSizeMB={10}
              id="document-upload"
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select value={documentType} onValueChange={value => setDocumentType(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word Document</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="txt">Text File</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
