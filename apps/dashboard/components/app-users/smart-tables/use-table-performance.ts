import { useCallback, useMemo, useTransition } from 'react';

/**
 * Performance optimization hook for table operations
 */
export function useTablePerformance() {
  const [isPending, startTransition] = useTransition();

  /**
   * Debounce function for non-urgent updates
   */
  const deferredUpdate = useCallback(
    (callback: () => void) => {
      startTransition(() => {
        callback();
      });
    },
    [startTransition]
  );

  /**
   * Batch multiple state updates together
   */
  const batchUpdates = useCallback((updates: Array<() => void>) => {
    startTransition(() => {
      updates.forEach(update => update());
    });
  }, []);

  return {
    isPending,
    deferredUpdate,
    batchUpdates,
  };
}

/**
 * Memoize row selection changes to prevent unnecessary re-renders
 */
export function useMemoizedRowSelection(
  selectedRows: Record<string, boolean> | undefined,
  internalSelection: Record<string, boolean>
) {
  return useMemo(() => {
    return selectedRows || internalSelection;
  }, [selectedRows, internalSelection]);
}
