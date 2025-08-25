import { cn } from '@/lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('gas-relative gas-overflow-hidden', className)}
    {...props}>
    <ScrollAreaPrimitive.Viewport className="gas-h-full gas-w-full gas-rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'gas-flex gas-touch-none gas-select-none gas-transition-colors',
      orientation === 'vertical' &&
        'gas-h-full gas-w-2.5 gas-border-l gas-border-l-transparent gas-p-[1px]',
      orientation === 'horizontal' &&
        'gas-h-2.5 gas-flex-col gas-border-t gas-border-t-transparent gas-p-[1px]',
      className
    )}
    {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="gas-relative gas-flex-1 gas-rounded-full gas-bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
