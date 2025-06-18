import { Logger } from '@nestjs/common';

export type ProcessStatus = 'fulfilled' | 'failed';

export type ProcessFn<T> = (item: T) => Promise<{ status: ProcessStatus; reason?: string }>;

export async function processBatches<T>(
  eventLogger: Logger,
  batch: T[],
  batchSize: number,
  delay: number,
  processFn: ProcessFn<T>
) {
  const failed: string[] = [];
  let processed = 0;

  try {
    if (batch.length === 0) return { processed: 0, failed: [] };
    eventLogger.log(`${batch.length} items in batches of ${batchSize}`);
    // Process in batches
    for (let i = 0; i < batch.length; i += batchSize) {
      eventLogger.debug(`Processing batch ${i / batchSize}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      const b = batch.slice(i, i + batchSize);

      // Process linearly
      const results: { status: ProcessStatus; reason?: string }[] = [];
      for (const item of b) {
        results.push(await processFn(item));
      }

      // Process results
      results.forEach((result, index) => {
        const item = b[index];
        if (result.status === 'fulfilled') {
          processed++;
        } else {
          failed.push(`${item}: ${result.reason}`);
        }
      });
    }
    eventLogger.log(`Batch completed. Processed: ${processed}, Failed: ${failed.length}`);
    if (failed.length > 0) eventLogger.debug('Failed items:', failed);
    return { processed, failed };
  } catch (error) {
    failed.push(`Batch failed: ${error}`);
    return { processed, failed };
  }
}
