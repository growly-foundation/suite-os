import { cn } from '@/lib/utils';

import { Sheet, SheetContent, SheetTitle } from './sheet';

export const ResizableSheet = ({
  children,
  open,
  side,
  onOpenChange,
  className,
  title = 'Sheet Content',
  hideTitle = true,
}: {
  children: React.ReactNode;
  open: boolean;
  side: 'left' | 'right' | 'bottom' | 'top' | undefined;
  onOpenChange: (open: boolean) => void;
  className?: string;
  title?: string;
  hideTitle?: boolean;
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn('w-[650px] sm:max-w-[800px] h-full overflow-auto p-6', className)}>
        <SheetTitle className={hideTitle ? 'sr-only' : undefined}>{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
};
