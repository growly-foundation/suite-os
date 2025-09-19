'use client';

import { cn } from '@/lib/utils';

import { Checkmark } from '../svg/checkmark';

export interface IdentityCheckmarkProps {
  hasCheckmark?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const IdentityCheckmark = ({
  hasCheckmark = false,
  width = 12,
  height = 12,
  className,
}: IdentityCheckmarkProps) => {
  if (!hasCheckmark) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
      <Checkmark width={width} height={height} />
    </div>
  );
};
