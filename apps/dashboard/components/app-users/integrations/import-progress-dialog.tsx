'use client';

import { ImportProgress } from '@/components/app-users/integrations/import-progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardState } from '@/hooks/use-dashboard';
import { ImportJobStatus, UserImportService } from '@/lib/services/user-import.service';
import { Activity, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface ImportProgressDialogProps {
  organizationId?: string;
}

export function ImportProgressDialog({ organizationId }: ImportProgressDialogProps) {
  const { selectedOrganization } = useDashboardState();
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState<ImportJobStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [completedJobsToasted, setCompletedJobsToasted] = useState<Set<string>>(new Set());

  const orgId = organizationId || selectedOrganization?.id;

  // Fetch organization jobs when dialog opens
  const fetchJobs = async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      const jobsList = await UserImportService.getOrganizationJobs(orgId);

      // Filter out any invalid jobs and log warnings
      const validJobs = jobsList.filter(job => {
        if (!job || !job.jobId || !job.organizationId) {
          console.warn('Invalid job data received:', job);
          return false;
        }
        return true;
      });

      if (validJobs.length !== jobsList.length) {
        const invalidCount = jobsList.length - validJobs.length;
        console.warn(`Filtered out ${invalidCount} invalid job entries`);
        toast.info(`Found ${invalidCount} corrupted job entries that were cleaned up`);
      }

      setJobs(validJobs);

      // Auto-select the most recent active job
      const activeJob = validJobs.find(
        job => job.status === 'pending' || job.status === 'processing'
      );
      if (activeJob) {
        setSelectedJobId(activeJob.jobId);
      } else if (validJobs.length > 0) {
        setSelectedJobId(validJobs[0].jobId);
      } else {
        setSelectedJobId(null);
      }
    } catch (error) {
      console.error('Failed to fetch import jobs:', error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          toast.error('Some job data was corrupted and has been cleaned up. Please try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error('Network error while fetching import jobs. Please check your connection.');
        } else {
          toast.error(`Failed to fetch import jobs: ${error.message}`);
        }
      } else {
        toast.error('Failed to fetch import jobs. Please try again.');
      }

      // Reset state on error
      setJobs([]);
      setSelectedJobId(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs when dialog opens and cleanup when closed
  useEffect(() => {
    if (isOpen && orgId) {
      fetchJobs();

      // Set up periodic refresh for active jobs (but don't interfere with completion callbacks)
      const refreshInterval = setInterval(() => {
        // Only refresh if there are jobs that might still be active
        fetchJobs();
      }, 10000); // Refresh every 10 seconds

      return () => {
        clearInterval(refreshInterval);
      };
    } else if (!isOpen) {
      // Clear the completed jobs set when dialog closes to prevent memory leaks
      setCompletedJobsToasted(new Set());
    }
  }, [isOpen, orgId]);

  const handleJobComplete = (result: ImportJobStatus) => {
    // Only show toast if we haven't already shown it for this job
    if (!completedJobsToasted.has(result.jobId)) {
      setCompletedJobsToasted(prev => new Set([...prev, result.jobId]));

      if (result.status === 'completed') {
        toast.success(
          `Import completed successfully! ${result.result?.success || 0} users imported.`
        );
      } else if (result.status === 'failed') {
        toast.error(`Import failed: ${result.error || 'Unknown error'}`);
      }
    }

    // Don't call fetchJobs() here to prevent infinite loops
    // The ImportProgress component will handle its own polling and updates
  };

  const activeJobs = jobs.filter(job => job.status === 'pending' || job.status === 'processing');
  const hasActiveJobs = activeJobs.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Activity className="h-4 w-4 mr-2" />
          Import Progress
          {hasActiveJobs && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Progress</DialogTitle>
          <DialogDescription>Monitor the progress of your user import jobs.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Activity className="h-6 w-6 animate-spin mr-2" />
              <span>Loading import jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No import jobs found</p>
              <p className="text-sm">Start an import to see progress here</p>
            </div>
          ) : (
            <>
              {/* Job selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Import Job</label>
                <Select
                  value={selectedJobId || ''}
                  onValueChange={(value: string) => setSelectedJobId(value || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an import job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.jobId} value={job.jobId}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)} Import -{' '}
                        {job.status === 'pending' && '⏳ Pending'}
                        {job.status === 'processing' && '🔄 Processing'}
                        {job.status === 'completed' && '✅ Completed'}
                        {job.status === 'failed' && '❌ Failed'}
                        {job.startedAt && ` (${new Date(job.startedAt).toLocaleString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected job progress */}
              {selectedJobId && (
                <ImportProgress
                  jobId={selectedJobId}
                  onComplete={handleJobComplete}
                  onClose={() => setSelectedJobId(null)}
                  showClose={false}
                />
              )}

              {/* Refresh button */}
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
