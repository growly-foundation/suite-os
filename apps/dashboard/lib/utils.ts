import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId() {
  return `id-${Math.random().toString(36).substring(2, 9)}`;
}

export const getNumberFromStr = (str: string, max: number): number => {
  const num =
    (str
      .split('')
      .map(v => v.charCodeAt(0))
      .reduce((p, c) => p + c, 0) %
      max) +
    1;
  return num;
};

export const truncateString = (str: string, maxLength: number): string =>
  `${str.slice(0, maxLength)}${str.length > maxLength ? '...' : ''}`;

/**
 * Debounce utility function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked.
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const countBytes = (str: string): number => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return bytes.length;
};

export const countBytesFormatted = (str: string): string => {
  const bytes = countBytes(str);
  return formatBytes(bytes);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * Get the base URL for the current environment.
 *
 * Works across client/server and different deployment environments:
 * - Client-side: uses window.location.origin
 * - Vercel deployment: uses VERCEL_URL environment variable
 * - Local development: uses localhost with PORT or defaults to 3000
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
