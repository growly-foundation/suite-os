'use client';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Check, Copy } from 'lucide-react';
import * as React from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface CopyTooltipProps {
  children: React.ReactNode;
  textToCopy: string;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showIcon?: boolean;
}

export function CopyTooltip({
  children,
  textToCopy,
  className,
  side = 'top',
  showIcon = false,
}: CopyTooltipProps) {
  const { copyToClipboard, copied } = useCopyToClipboard();

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(textToCopy);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`cursor-pointer inline-flex items-center gap-1 ${className}`}
            onClick={handleCopy}>
            {children}
            {showIcon && (
              <span className="ml-1">
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                )}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p className="text-xs text-muted-foreground">
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
