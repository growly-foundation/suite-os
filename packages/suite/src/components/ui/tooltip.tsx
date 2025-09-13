import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'gas-z-50 gas-overflow-hidden gas-rounded-md gas-bg-primary gas-px-3 gas-py-1.5 gas-text-xs gas-text-primary-foreground gas-animate-in gas-fade-in-0 gas-zoom-in-95 data-[state=closed]:gas-animate-out data-[state=closed]:gas-fade-out-0 data-[state=closed]:gas-zoom-out-95 data-[side=bottom]:gas-slide-in-from-top-2 data-[side=left]:gas-slide-in-from-right-2 data-[side=right]:gas-slide-in-from-left-2 data-[side=top]:gas-slide-in-from-bottom-2 gas-origin-[--radix-tooltip-content-transform-origin]',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
