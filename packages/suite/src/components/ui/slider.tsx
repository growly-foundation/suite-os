import { cn } from '@/lib/utils';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'gas-relative gas-flex gas-w-full touch-none gas-select-none gas-items-center',
      className
    )}
    {...props}>
    <SliderPrimitive.Track className="gas-relative gas-h-1.5 gas-w-full gas-grow overflow-hidden gas-rounded-full gas-bg-primary/20">
      <SliderPrimitive.Range className="gas-absolute gas-h-full gas-bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="gas-block gas-h-4 gas-w-4 gas-rounded-full gas-border border-primary/50 gas-bg-background gas-shadow gas-transition-colors focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring disabled:gas-pointer-events-none disabled:gas-opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
