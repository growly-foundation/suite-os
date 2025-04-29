'use client';

import animationData from '@/assets/animation/loading.json';
import { Button } from '@/components/ui/button';
import React from 'react';
import Lottie from 'react-lottie';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWidget } from '../WidgetConfig';
import { BRAND_NAME_CAPITALIZED } from 'lib/constants';

export function FloatingButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { iconLoading?: boolean }
) {
  const { config } = useWidget();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <Tooltip open={isHovered} delayDuration={1}>
            <TooltipTrigger>
              <Button
                {...props}
                style={{
                  cursor: 'pointer',
                  width: 80,
                  height: 80,
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
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Needs help? Chat with {config?.agent?.name ?? `${BRAND_NAME_CAPITALIZED} Copilot`}
              </p>
            </TooltipContent>
          </Tooltip>
        </motion.button>
      </div>
    </TooltipProvider>
  );
}
