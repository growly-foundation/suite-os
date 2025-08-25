import { cn } from '@/lib/utils';
import * as React from 'react';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'gas-flex gas-h-9 gas-w-full gas-rounded-md gas-border gas-border-input gas-bg-transparent gas-px-3 gas-py-1 gas-text-base gas-shadow-sm gas-transition-colors file:gas-border-0 file:gas-bg-transparent file:gas-text-sm file:gas-font-medium file:gas-text-foreground placeholder:gas-text-muted-foreground focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring disabled:gas-cursor-not-allowed disabled:gas-opacity-50 md:gas-text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
