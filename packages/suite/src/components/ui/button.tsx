import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'gas-inline-flex gas-items-center gas-justify-center gas-gap-2 gas-whitespace-nowrap gas-rounded-md gas-text-sm gas-font-medium gas-transition-colors focus-visible:gas-outline-none focus-visible:gas-ring-1 focus-visible:gas-ring-ring disabled:gas-pointer-events-none disabled:gas-opacity-50 [&_svg]:gas-pointer-events-none [&_svg]:gas-size-4 [&_svg]:gas-shrink-0',
  {
    variants: {
      variant: {
        default: 'gas-bg-primary gas-text-primary-foreground gas-shadow hover:gas-bg-primary/90',
        destructive:
          'gas-bg-destructive gas-text-destructive-foreground gas-shadow-sm hover:gas-bg-destructive/90',
        outline:
          'gas-border gas-border-input gas-shadow-sm hover:gas-bg-accent hover:gas-text-accent-foreground',
        secondary:
          'gas-bg-secondary gas-text-secondary-foreground gas-shadow-sm hover:gas-bg-secondary/80',
        ghost: 'hover:gas-bg-accent hover:gas-text-accent-foreground',
        link: 'gas-text-primary gas-underline-offset-4 hover:gas-underline',
      },
      size: {
        default: 'gas-h-9 gas-px-4 gas-py-2',
        sm: 'gas-h-8 gas-rounded-md gas-px-3 gas-text-xs',
        lg: 'gas-h-10 gas-rounded-md gas-px-8',
        icon: 'gas-h-9 gas-w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
