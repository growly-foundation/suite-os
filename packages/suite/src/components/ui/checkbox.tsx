import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer gas-h-4 gas-w-4 gas-shrink-0 gas-rounded-sm gas-border gas-border-primary gas-shadow focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring disabled:gas-cursor-not-allowed disabled:gas-opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}>
    <CheckboxPrimitive.Indicator
      className={cn('gas-flex gas-items-center gas-justify-center gas-text-current')}>
      <Check className="gas-h-4 gas-w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
