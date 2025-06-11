import { cn } from '@/lib/utils';

import { Sheet, SheetContent } from './sheet';

export const ResizableSheet = ({
  children,
  open,
  side,
  onOpenChange,
  className,
}: {
  children: React.ReactNode;
  open: boolean;
  side: 'left' | 'right' | 'bottom' | 'top' | undefined;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn('p-0 w-[650px] sm:max-w-[800px] h-full overflow-auto p-6', className)}>
        {children}
      </SheetContent>
    </Sheet>
  );
};
