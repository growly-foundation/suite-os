import { PrimaryButton } from '@/components/buttons/primary-button';
import { cn } from '@/lib/utils';
import { AlertCircle, FileSearch, Inbox, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  status?: 'empty' | 'error' | 'no-results' | 'loading';
}

export function EmptyState({
  message = 'No data available',
  description = 'There are no items to display.',
  className,
  icon,
  action,
  status = 'empty',
}: EmptyStateProps) {
  const getStatusIcon = () => {
    if (icon) return icon;

    switch (status) {
      case 'error':
        return <AlertCircle className="h-10 w-10 text-destructive" />;
      case 'no-results':
        return <FileSearch className="h-10 w-10 text-muted-foreground" />;
      case 'loading':
        return <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />;
      default:
        return <Inbox className="h-10 w-10 text-muted-foreground" />;
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'error':
        return 'border-destructive/20 bg-destructive/10';
      case 'no-results':
        return 'border-muted bg-muted/50';
      case 'loading':
        return 'border-muted bg-muted/50';
      default:
        return 'border-dashed';
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center w-full justify-center rounded-lg p-8 text-center animate-in fade-in-50',
        getStatusStyles(),
        className
      )}>
      <div
        className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
          status === 'error' ? 'bg-destructive/20' : 'bg-muted'
        )}>
        {getStatusIcon()}
      </div>
      <h3 className="mt-4 text-md font-semibold">{message}</h3>
      <p className="mt-2 text-xs text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <PrimaryButton variant="outline" className="mt-4" onClick={action.onClick}>
          {action.label}
        </PrimaryButton>
      )}
    </div>
  );
}
