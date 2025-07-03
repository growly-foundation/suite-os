import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  type?: 'primary' | 'default';
  className?: string;
}

export const IconContainer = ({ children, type = 'default', className, ...props }: Props) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center border rounded-lg p-1',
        type === 'primary' && 'bg-primary border-primary text-white',
        className
      )}
      {...props}>
      {children}
    </div>
  );
};
