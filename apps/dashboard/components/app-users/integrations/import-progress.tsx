'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImportJobStatus, UserImportService } from '@/lib/services/user-import.service';
import { AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImportProgressProps {
  jobId: string;
  onComplete?: (result: ImportJobStatus) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export function ImportProgress({
  jobId,
  onComplete,
  onClose,
  showClose = true,
}: ImportProgressProps) {
  const [jobStatus, setJobStatus] = useState<ImportJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletionBeenCalled, setHasCompletionBeenCalled] = useState(false);
  const [initialJobStatus, setInitialJobStatus] = useState<ImportJobStatus | null>(null);

  useEffect(() => {
    let intervalRef: NodeJS.Timeout | null = null;
    let isComponentMounted = true;

    const pollJobStatus = async () => {
      try {
        const status = await UserImportService.getImportJobStatus(jobId);
        if (status && isComponentMounted) {
          // Store the initial status on first fetch
          if (initialJobStatus === null) {
            setInitialJobStatus(status);
          }

          setJobStatus(status);

          // If job is completed or failed, stop polling
          if (status.status === 'completed' || status.status === 'failed') {
            // Clear the interval immediately to stop further polling
            if (intervalRef) {
              clearInterval(intervalRef);
              intervalRef = null;
            }

            // Only call completion callback if:
            // 1. We haven't already called it
            // 2. The job was NOT already completed when we first mounted (initial status was pending/processing)
            if (
              !hasCompletionBeenCalled &&
              initialJobStatus &&
              (initialJobStatus.status === 'pending' || initialJobStatus.status === 'processing')
            ) {
              setHasCompletionBeenCalled(true);
              onComplete?.(status);
            }
          }
        }
        if (isComponentMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to get job status:', err);
        if (isComponentMounted) {
          setError('Failed to get import status');
          setLoading(false);
        }
      }
    };

    // Initial fetch
    pollJobStatus();

    // Poll every 2 seconds if job is still running
    intervalRef = setInterval(() => {
      // Only poll if job is still running and completion hasn't been called
      if (jobStatus?.status === 'pending' || jobStatus?.status === 'processing') {
        if (!hasCompletionBeenCalled) {
          pollJobStatus();
        }
      } else if (intervalRef) {
        // Clear interval if job is no longer running
        clearInterval(intervalRef);
        intervalRef = null;
      }
    }, 2000);

    return () => {
      isComponentMounted = false;
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [jobId, jobStatus?.status, onComplete, hasCompletionBeenCalled, initialJobStatus]);

  if (loading && !jobStatus) {
    return (
      <div className="flex items-center space-x-2 p-4 border rounded-lg">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Loading import status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        {showClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        )}
      </Alert>
    );
  }

  if (!jobStatus) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Import job not found</AlertDescription>
        {showClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto">
            <X className="h-4 w-4" />
          </Button>
        )}
      </Alert>
    );
  }

  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (jobStatus.status) {
      case 'pending':
        return 'Preparing import...';
      case 'processing':
        return `Importing users... (${jobStatus.progress.current}/${jobStatus.progress.total})`;
      case 'completed':
        return `Import completed successfully!`;
      case 'failed':
        return 'Import failed';
      default:
        return 'Unknown status';
    }
  };

  const getStatusVariant = () => {
    switch (jobStatus.status) {
      case 'completed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium">Import Progress</span>
        </div>
        {showClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{getStatusText()}</span>
          <span>{jobStatus.progress.percentage}%</span>
        </div>
        <Progress value={jobStatus.progress.percentage} className="w-full" />
      </div>

      {jobStatus.status === 'completed' && jobStatus.result && (
        <Alert variant={getStatusVariant()}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully imported {jobStatus.result.success} users
            {jobStatus.result.failed > 0 && `, ${jobStatus.result.failed} failed`}
          </AlertDescription>
        </Alert>
      )}

      {jobStatus.status === 'failed' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {jobStatus.error || 'Import failed with unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {jobStatus.result && jobStatus.result.errors && jobStatus.result.errors.length > 0 && (
        <div className="text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer hover:text-gray-800">
              View errors ({jobStatus.result.errors.length})
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {jobStatus.result.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-red-600 text-xs">
                  {error}
                </div>
              ))}
              {jobStatus.result.errors.length > 5 && (
                <div className="text-xs text-gray-500">
                  ... and {jobStatus.result.errors.length - 5} more
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
