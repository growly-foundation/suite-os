import {
  ImportLimitCheckResult,
  ORGANIZATION_LIMITS,
  OrganizationUserLimits,
} from '../models/organizations';

export class OrganizationLimitsService {
  /**
   * Check if an organization can import users based on current limits
   */
  static checkImportLimits(
    currentUserCount: number,
    usersToImport: number,
    maxUsers: number = ORGANIZATION_LIMITS.FREE_PLAN.MAX_USERS
  ): ImportLimitCheckResult {
    // Treat <= 0 as unlimited
    const isUnlimited = maxUsers <= 0;
    const safeUsersToImport = Math.max(0, usersToImport);
    const availableSlots = isUnlimited
      ? Number.POSITIVE_INFINITY
      : Math.max(0, maxUsers - currentUserCount);

    const canImport = availableSlots > 0;
    const maxAllowedImports = Math.min(safeUsersToImport, availableSlots);
    const exceedsLimit = !isUnlimited && safeUsersToImport > availableSlots;

    return {
      canImport,
      maxAllowedImports,
      currentUserCount,
      maxUsers,
      exceedsLimit,
    };
  }

  /**
   * Get organization user limits information
   */
  static getOrganizationUserLimits(
    currentUserCount: number,
    maxUsers: number = ORGANIZATION_LIMITS.FREE_PLAN.MAX_USERS
  ): OrganizationUserLimits {
    const isUnlimited = maxUsers <= 0;
    const availableSlots = isUnlimited
      ? Number.POSITIVE_INFINITY
      : Math.max(0, maxUsers - currentUserCount);
    const canImport = isUnlimited || availableSlots > 0;

    return {
      currentUserCount,
      maxUsers,
      canImport,
      availableSlots,
    };
  }

  /**
   * Validate if users can be imported without exceeding limits
   */
  static validateImport(
    currentUserCount: number,
    usersToImport: number,
    maxUsers: number = ORGANIZATION_LIMITS.FREE_PLAN.MAX_USERS
  ): { valid: boolean; message?: string } {
    const limits = this.checkImportLimits(currentUserCount, usersToImport, maxUsers);

    if (!limits.canImport) {
      return {
        valid: false,
        message: `Organization has reached the maximum user limit of ${maxUsers} users.`,
      };
    }

    if (limits.exceedsLimit) {
      return {
        valid: false,
        message: `Cannot import ${usersToImport} users. Only ${limits.maxAllowedImports} slots available (${limits.currentUserCount}/${limits.maxUsers}).`,
      };
    }

    return { valid: true };
  }
}
