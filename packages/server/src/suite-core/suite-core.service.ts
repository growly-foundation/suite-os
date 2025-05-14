import { Inject, Injectable, Logger } from '@nestjs/common';
import { SuiteDatabaseCore } from '@growly/core';

@Injectable()
export class SuiteCoreService {
  private readonly logger = new Logger(SuiteCoreService.name);

  constructor(@Inject('GROWLY_SUITE_CORE') private readonly suiteCore: SuiteDatabaseCore) {}

  async call<T extends keyof SuiteDatabaseCore>(
    service: T,
    method: keyof SuiteDatabaseCore[T],
    args?: any[]
  ) {
    try {
      const fn = this.suiteCore.call(service)[method];
      if (!fn || typeof fn !== 'function') {
        throw new Error(`Method ${String(method)} not found on service ${String(service)}`);
      }
      if (!args) {
        return fn();
      } else {
        return fn(...args);
      }
    } catch (error) {
      this.logger.error(`Error calling core service ${service}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async callDatabaseService(method: keyof SuiteDatabaseCore['db'], args?: any[]) {
    return this.call('db', method, args);
  }
}
