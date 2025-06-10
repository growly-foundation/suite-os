import { cn } from '@/lib/utils';
import type React from 'react';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-center', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
}
