import { FloatingButtonPosition, SuiteConfig } from '@/components/providers/SuiteProvider.types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to create a Suite configuration with floating button position
 * @param position - The position of the floating button ('left' or 'right')
 * @param config - Additional configuration options
 * @returns SuiteConfig object with the specified floating button position
 */
export function createSuiteConfig(
  position: FloatingButtonPosition,
  config?: Partial<SuiteConfig>
): SuiteConfig {
  return {
    floatingButtonPosition: position,
    ...config,
  };
}

/**
 * Utility functions for common floating button configurations
 */
export const FloatingButtonConfig = {
  /**
   * Configure floating button to appear on the left side
   */
  left: (config?: Partial<SuiteConfig>): SuiteConfig => createSuiteConfig('left', config),

  /**
   * Configure floating button to appear on the right side (default)
   */
  right: (config?: Partial<SuiteConfig>): SuiteConfig => createSuiteConfig('right', config),
};
