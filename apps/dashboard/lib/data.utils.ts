import { ImportUserOutput, UserImportSource } from '@getgrowly/core';

/**
 * Checks if any row has data for a specific field
 * @param data Array of user data
 * @param field Field name to check
 * @returns boolean indicating if any row has data for the field
 */
export function hasDataInAnyRow<T extends ImportUserOutput>(
  data: T[],
  field: keyof ImportUserOutput | 'extra'
): boolean {
  return data.some(user => {
    if (field === 'extra') {
      return user.extra && Object.keys(user.extra).length > 0;
    }
    return (
      user[field as keyof ImportUserOutput] !== undefined &&
      user[field as keyof ImportUserOutput] !== null &&
      user[field as keyof ImportUserOutput] !== ''
    );
  });
}

/**
 * Checks if any imported user has specific extra data
 * @param data Array of user data
 * @param field Field name to check (supports nested fields like 'custom.firstVerifiedAt')
 * @returns boolean indicating if any imported user has the specified extra data
 */
export function hasImportedUserExtraData<T extends ImportUserOutput>(
  data: T[],
  source: UserImportSource,
  field: string
): boolean {
  return data.some(user => {
    if (user.source !== source) return false;
    if (!user.extra) return false;

    // Check for nested fields like custom.firstVerifiedAt
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return (
        user.extra[parent as keyof typeof user.extra]?.[child] !== undefined &&
        user.extra[parent as keyof typeof user.extra]?.[child] !== null &&
        user.extra[parent as keyof typeof user.extra]?.[child] !== ''
      );
    }

    return (
      user.extra[field as keyof typeof user.extra] !== undefined &&
      user.extra[field as keyof typeof user.extra] !== null &&
      user.extra[field as keyof typeof user.extra] !== ''
    );
  });
}

/**
 * Checks if any user has a specific source
 * @param data Array of user data
 * @param source Source to check for
 * @returns boolean indicating if any user has the specified source
 */
export function hasUsersWithSource<T extends ImportUserOutput>(
  data: T[],
  source: UserImportSource
): boolean {
  return data.some(user => user.source === source);
}

/**
 * Gets unique sources from user data
 * @param data Array of user data
 * @returns Array of unique sources
 */
export function getUniqueSources<T extends ImportUserOutput>(data: T[]): UserImportSource[] {
  return [...new Set(data.map(user => user.source))];
}
