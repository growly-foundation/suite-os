import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  message = 'No data available',
  description = 'There are no items to display.',
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50',
        className
      )}>
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon || <Users className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
