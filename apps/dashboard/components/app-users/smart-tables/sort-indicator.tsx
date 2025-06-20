'use client';

import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortIndicatorProps {
  direction: SortDirection;
  className?: string;
}

/**
 * Displays an icon indicating the current sort direction.
 *
 * Renders an upward arrow for ascending, a downward arrow for descending, or a muted bidirectional arrow when no sort direction is specified.
 *
 * @param direction - The current sort direction; determines which icon is shown
 * @param className - Optional additional CSS classes for the container
 * @returns A JSX element representing the sort direction indicator
 */
export function SortIndicator({ direction, className }: SortIndicatorProps) {
  return (
    <div className={cn('ml-1 inline-flex', className)}>
      {direction === 'asc' ? (
        <ArrowUp className="h-3 w-3" />
      ) : direction === 'desc' ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
      )}
    </div>
  );
}
