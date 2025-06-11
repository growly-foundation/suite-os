import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const IconContainer = ({ children, className, ...props }: Props) => {
  return (
    <div
      className={cn('flex items-center justify-center border rounded-lg p-1', className)}
      {...props}>
      {children}
    </div>
  );
};
