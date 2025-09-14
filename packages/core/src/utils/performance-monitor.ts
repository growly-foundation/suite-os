/**
 * Performance monitoring utilities for database queries
 */

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`Slow query detected: ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`Query ${label} completed in ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
}

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(label?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const timerLabel = label || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      return PerformanceMonitor.measureAsync(timerLabel, () => method.apply(this, args));
    };
  };
}
