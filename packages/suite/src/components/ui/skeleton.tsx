import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('gas-animate-pulse gas-rounded-md gas-bg-primary/10', className)}
      {...props}
    />
  );
}

export { Skeleton };
