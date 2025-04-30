'use client';

import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWidget } from '../WidgetConfigProvider';
import { BRAND_LOGO_URL, BRAND_NAME_CAPITALIZED } from '@/constants';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function FloatingButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { iconLoading?: boolean }
) {
  const { config } = useWidget();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
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
              className="border border-primary/10 rounded-full bg-white aspect-square shadow-3xl text-white hover:bg-white/90">
              <Avatar style={{ width: 50, height: 50 }}>
                <AvatarImage src={BRAND_LOGO_URL} />
                <AvatarFallback>🤖</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
          </motion.div>
          <TooltipContent>
            <p>
              Needs help? Chat with {config?.agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
