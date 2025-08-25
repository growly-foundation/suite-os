import { cn } from '@/lib/utils';
import * as React from 'react';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'gas-flex gas-min-h-[60px] gas-w-full gas-rounded-md gas-border gas-border-input gas-bg-transparent gas-px-3 gas-py-2 gas-text-base gas-shadow-sm placeholder:gas-text-muted-foreground focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring disabled:gas-cursor-not-allowed disabled:gas-opacity-50 md:gas-text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
