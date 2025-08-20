import { Button, ButtonProps } from '@/components/ui/button';
import { RefAttributes } from 'react';

export const PrimaryButton = ({
  children,
  size = 'sm',
  ...props
}: ButtonProps & RefAttributes<HTMLButtonElement>) => {
  return (
    <Button
      variant={props.variant || 'outline'}
      className="bg-primary text-primary-foreground hover:bg-primary/80 border-primary"
      size={size}
      {...props}>
      {children}
    </Button>
  );
};
