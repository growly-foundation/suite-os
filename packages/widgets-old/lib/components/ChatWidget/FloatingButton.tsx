'use client';

import animationData from '@/assets/animation/loading.json';
import Lottie from 'react-lottie';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWidget } from '../WidgetConfig';
import { BRAND_NAME_CAPITALIZED } from 'lib/constants';
import { useState } from 'react';

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
                width: 90,
                height: 90,
                position: 'relative',
              }}
              className="border border-primary/10 rounded-full bg-white aspect-square shadow-2xl text-white hover:bg-white/90">
              <Lottie
                options={{
                  loop: true,
                  autoplay: false,
                  animationData,
                  rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice',
                  },
                }}
                isStopped={!isHovered}
                height={90}
                width={90}
                speed={2}
              />
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
