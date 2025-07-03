'use client';

import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from './button';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  id?: string;
  className?: string;
}

export function FileUploader({
  onFileChange,
  accept = '*',
  maxSizeMB = 10,
  id,
  className,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const file = e.target.files?.[0];
    if (!file) {
      onFileChange(null);
      return;
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the ${maxSizeMB}MB limit`);
      onFileChange(null);
      return;
    }

    onFileChange(file);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        accept={accept}
        className="hidden"
        id={id}
      />
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 cursor-pointer"
        onClick={triggerFileInput}>
        <div className="rounded-full bg-muted p-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Click to upload</p>
          <p className="text-xs text-muted-foreground">
            Supports {accept.replace(/\./g, '').replace(/,/g, ', ')} (max {maxSizeMB}MB)
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
