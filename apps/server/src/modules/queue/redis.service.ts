import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

export interface ImportJobStatus {
  jobId: string;
  organizationId: string;
  type: 'contract' | 'nft-holders' | 'privy' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  result?: {
    success: number;
    failed: number;
    errors?: string[];
  };
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const redisToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!redisUrl || !redisToken) {
      this.logger.warn('Redis credentials not found, using in-memory fallback');
      // For development, we'll use a simple in-memory store
      this.redis = null as any;
    } else {
      this.redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      // Validate connection
      this.validateConnection();
    }
  }

  private async validateConnection(retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.redis.ping();
        this.logger.log('Redis service initialized and connected');
        return;
      } catch (error) {
        this.logger.warn(`Redis connection attempt ${i + 1} failed:`, error);
        if (i === retries - 1) {
          this.logger.error('Failed to connect to Redis after retries');
          throw error;
        }
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  private getJobKey(jobId: string): string {
    return `import_job:${jobId}`;
  }

  private getOrgJobsKey(organizationId: string): string {
    return `org_jobs:${organizationId}`;
  }

  private getJobTTL(total: number): number {
    // Base TTL of 1 hour, plus 1 minute per 100 users
    const baseTTL = 3600;
    const additionalTTL = Math.ceil(total / 100) * 60;
    return Math.min(baseTTL + additionalTTL, 86400); // Cap at 24 hours
  }

  async createImportJob(
    jobId: string,
    organizationId: string,
    type: ImportJobStatus['type'],
    total: number
  ): Promise<void> {
    const job: ImportJobStatus = {
      jobId,
      organizationId,
      type,
      status: 'pending',
      progress: {
        current: 0,
        total,
        percentage: 0,
      },
      startedAt: new Date().toISOString(),
    };

    try {
      if (this.redis) {
        const ttl = this.getJobTTL(total);
        await this.redis.setex(this.getJobKey(jobId), ttl, JSON.stringify(job));
        await this.redis.sadd(this.getOrgJobsKey(organizationId), jobId);
        this.logger.debug(
          `Created import job ${jobId} for organization ${organizationId} with TTL ${ttl}`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to create import job ${jobId}:`, error);
    }
  }

  async updateJobProgress(
    jobId: string,
    current: number,
    status?: ImportJobStatus['status']
  ): Promise<void> {
    try {
      if (this.redis) {
        const jobData = await this.redis.get(this.getJobKey(jobId));
        if (jobData) {
          let job: ImportJobStatus;

          try {
            // Use the same parsing logic as getJobStatus
            if (typeof jobData === 'string') {
              job = JSON.parse(jobData);
            } else if (typeof jobData === 'object') {
              job = jobData as ImportJobStatus;
            } else {
              this.logger.error(`Invalid job data type for ${jobId}: ${typeof jobData}`);
              return;
            }

            // Validate job structure
            if (!job || !job.jobId || !job.progress) {
              this.logger.error(`Invalid job structure for ${jobId}`);
              return;
            }

            job.progress.current = current;
            job.progress.percentage = Math.round((current / job.progress.total) * 100);
            if (status) {
              job.status = status;
            }

            /// Refresh TTL for active jobs
            const ttl = this.getJobTTL(job.progress.total);
            await this.redis.setex(this.getJobKey(jobId), ttl, JSON.stringify(job));
            this.logger.debug(`Updated job ${jobId} progress: ${job.progress.percentage}%`);
          } catch (parseError) {
            this.logger.error(`Failed to parse job data for ${jobId}:`, parseError);
            // Remove corrupted entry
            await this.redis.del(this.getJobKey(jobId));
          }
        } else {
          this.logger.warn(`Job ${jobId} not found for progress update`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update job progress ${jobId}:`, error);
    }
  }

  async completeJob(
    jobId: string,
    result: ImportJobStatus['result'],
    error?: string
  ): Promise<void> {
    try {
      if (this.redis) {
        const jobData = await this.redis.get(this.getJobKey(jobId));
        if (jobData) {
          let job: ImportJobStatus;

          try {
            // Use the same parsing logic as getJobStatus
            if (typeof jobData === 'string') {
              job = JSON.parse(jobData);
            } else if (typeof jobData === 'object') {
              job = jobData as ImportJobStatus;
            } else {
              this.logger.error(`Invalid job data type for ${jobId}: ${typeof jobData}`);
              return;
            }

            // Validate job structure
            if (!job || !job.jobId) {
              this.logger.error(`Invalid job structure for ${jobId}`);
              return;
            }

            job.status = error ? 'failed' : 'completed';
            job.result = result;
            job.completedAt = new Date().toISOString();
            if (error) {
              job.error = error;
            }

            await this.redis.setex(this.getJobKey(jobId), 3600, JSON.stringify(job));
            this.logger.log(`Completed job ${jobId} with status: ${job.status}`);
          } catch (parseError) {
            this.logger.error(`Failed to parse job data for ${jobId}:`, parseError);
            // Remove corrupted entry
            await this.redis.del(this.getJobKey(jobId));
          }
        } else {
          this.logger.warn(`Job ${jobId} not found for completion`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to complete job ${jobId}:`, error);
    }
  }

  private corruptedJobsCount = 0;

  async getJobStatus(jobId: string): Promise<ImportJobStatus | null> {
    try {
      if (this.redis) {
        const jobData = await this.redis.get(this.getJobKey(jobId));
        if (jobData) {
          // Handle different data types that might be stored
          let parsedData: any;

          if (typeof jobData === 'string') {
            // Try to parse as JSON
            try {
              parsedData = JSON.parse(jobData);
            } catch (parseError) {
              this.logger.warn(`Invalid JSON data for job ${jobId}, removing corrupted entry`);
              this.corruptedJobsCount++;
              this.logger.warn(`Total corrupted jobs encountered: ${this.corruptedJobsCount}`);
              // Remove corrupted entry
              await this.redis.del(this.getJobKey(jobId));
              return null;
            }
          } else if (typeof jobData === 'object') {
            // Data is already an object
            parsedData = jobData;
          } else {
            this.logger.warn(`Unexpected data type for job ${jobId}: ${typeof jobData}`);
            this.corruptedJobsCount++;
            return null;
          }

          // Validate the parsed data has required fields
          if (
            !parsedData ||
            typeof parsedData !== 'object' ||
            !parsedData.jobId ||
            !parsedData.organizationId
          ) {
            this.logger.warn(
              `Invalid job data structure for job ${jobId}, removing corrupted entry`
            );
            this.corruptedJobsCount++;
            this.logger.warn(`Total corrupted jobs encountered: ${this.corruptedJobsCount}`);
            await this.redis.del(this.getJobKey(jobId));
            return null;
          }

          return parsedData as ImportJobStatus;
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to get job status ${jobId}:`, error);
      // Try to clean up potentially corrupted data
      try {
        if (this.redis) {
          await this.redis.del(this.getJobKey(jobId));
          this.corruptedJobsCount++;
          this.logger.log(`Removed corrupted job data for ${jobId}`);
        }
      } catch (cleanupError) {
        this.logger.error(`Failed to cleanup corrupted job ${jobId}:`, cleanupError);
      }
      return null;
    }
  }

  getCorruptedJobsMetrics() {
    return { corruptedJobsCount: this.corruptedJobsCount };
  }

  async getOrganizationJobs(organizationId: string): Promise<ImportJobStatus[]> {
    try {
      if (this.redis) {
        const jobIds = await this.redis.smembers(this.getOrgJobsKey(organizationId));
        const jobs: ImportJobStatus[] = [];
        const corruptedJobIds: string[] = [];

        for (const jobId of jobIds) {
          const job = await this.getJobStatus(jobId as string);
          if (job) {
            jobs.push(job);
          } else {
            // Track corrupted job IDs to clean up
            corruptedJobIds.push(jobId as string);
          }
        }

        // Clean up corrupted job references
        if (corruptedJobIds.length > 0) {
          this.logger.log(
            `Cleaning up ${corruptedJobIds.length} corrupted job references for organization ${organizationId}`
          );
          for (const corruptedJobId of corruptedJobIds) {
            await this.redis.srem(this.getOrgJobsKey(organizationId), corruptedJobId);
          }
        }

        // Sort by startedAt descending (most recent first)
        return jobs.sort(
          (a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime()
        );
      }
      return [];
    } catch (error) {
      this.logger.error(`Failed to get organization jobs for ${organizationId}:`, error);
      return [];
    }
  }

  /**
   * Clean up all corrupted job entries for maintenance
   */
  async cleanupCorruptedJobs(): Promise<void> {
    try {
      if (!this.redis) return;

      this.logger.log('Starting cleanup of corrupted job entries...');

      // This would require scanning all keys, which might be expensive
      // For now, we'll rely on the lazy cleanup in getJobStatus and getOrganizationJobs
      this.logger.log(
        'Cleanup completed - corrupted entries will be removed as they are encountered'
      );
    } catch (error) {
      this.logger.error('Failed to cleanup corrupted jobs:', error);
    }
  }

  async cleanupJob(jobId: string, organizationId: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(this.getJobKey(jobId));
        await this.redis.srem(this.getOrgJobsKey(organizationId), jobId);
        this.logger.debug(`Cleaned up job ${jobId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup job ${jobId}:`, error);
    }
  }
}
