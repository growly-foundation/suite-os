'use client';

import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'gas-flex gas-h-full gas-w-full data-[panel-group-direction=vertical]:flex-col',
      className
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'gas-relative gas-flex gas-w-px gas-items-center gas-justify-center gas-bg-border after:gas-absolute after:gas-inset-y-0 after:gas-left-1/2 after:gas-w-1 after:-translate-x-1/2 focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring focus-visible:gas-ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}>
    {withHandle && (
      <div className="gas-z-10 gas-flex gas-h-4 gas-w-3 gas-items-center gas-justify-center gas-rounded-sm gas-border gas-bg-border">
        <GripVertical className="gas-h-2.5 gas-w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
