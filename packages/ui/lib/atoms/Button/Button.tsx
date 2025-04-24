import { Button, ButtonProps, Spinner } from '@radix-ui/themes';
import clsx from 'clsx';
import type { ReactNode } from 'react';

type Props = ButtonProps & {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export default function ({ children, disabled, className, ...props }: Props) {
  return (
    <Button
      className={clsx('flex gap-2 py-3 items-center cursor-pointer', className)}
      size={'3'}
      variant="soft"
      disabled={disabled}
      {...props}>
      <Spinner size={'3'} loading={!!props.loading}>
        {children}
      </Spinner>
    </Button>
  );
}
