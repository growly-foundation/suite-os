import { cn } from '@/lib/utils';
import type React from 'react';

type DashboardShellProps = React.HTMLAttributes<HTMLDivElement>;

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div
      className={cn('container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}
      {...props}>
      <div className="space-y-8">{children}</div>
    </div>
  );
}
