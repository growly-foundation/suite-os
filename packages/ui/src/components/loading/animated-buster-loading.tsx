'use client';

import loadingAnimation from '@/assets/animation/loading.json';
import { useLottie } from 'lottie-react';

type BusterProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: number;
  height?: number;
};

export const AnimatedBusterLoading = ({ width, height, ...rest }: BusterProps) => {
  const { View } = useLottie({
    animationData: loadingAnimation,
    loop: true,
    autoplay: true,
    width,
    height,
  });

  return (
    <div style={{ width, height }} {...rest}>
      {View}
    </div>
  );
};
