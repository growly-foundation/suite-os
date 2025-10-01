'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSuiteSession } from '@/hooks/use-session';
import { useSuite } from '@/hooks/use-suite';
import { cn } from '@/lib/utils';
import { background, pressable, text } from '@/styles/theme';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { BRAND_NAME_CAPITALIZED, LazyAnimatedBuster } from '@getgrowly/ui';

export function FloatingButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { agent } = useSuiteSession();
  const { config } = useSuite();
  const [isHovered, setIsHovered] = useState(false);

  // Determine position classes based on configuration
  const position = config?.floatingButtonPosition || 'right';
  const positionClasses =
    position === 'left'
      ? 'gas-fixed gas-bottom-6 gas-left-6 gas-z-[9990]'
      : 'gas-fixed gas-bottom-6 gas-right-6 gas-z-[9990]';

  return (
    <div className={positionClasses}>
      <TooltipProvider>
        <Tooltip open={isHovered} delayDuration={1}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <TooltipTrigger
              {...props}
              style={{
                cursor: 'pointer',
                width: 50,
                height: 50,
                position: 'relative',
              }}
              className={cn(
                'gas-border gas-border-primary gas-rounded-full gas-aspect-square gas-shadow-3xl gas-text-white',
                pressable.coinbaseBranding
              )}>
              <LazyAnimatedBuster />
            </TooltipTrigger>
          </motion.div>
          <TooltipContent className={cn(text.base, background.primary)}>
            <div className="gas-style-container">
              <p className={text.base}>
                Need help? Chat with {agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
