import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer gas-inline-flex gas-h-5 gas-w-9 gas-shrink-0 gas-cursor-pointer gas-items-center gas-rounded-full gas-border-2 gas-border-transparent gas-shadow-sm gas-transition-colors focus-visible:gas-outline-none focus-visible:gas-ring-2 focus-visible:gas-ring-ring focus-visible:gas-ring-offset-2 focus-visible:gas-ring-offset-background disabled:gas-cursor-not-allowed disabled:gas-opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        'gas-pointer-events-none gas-block gas-h-4 gas-w-4 gas-rounded-full gas-bg-background gas-shadow-lg gas-ring-0 gas-transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
