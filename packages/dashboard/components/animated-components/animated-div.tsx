import type React from 'react';
import { motion } from 'motion/react';

const AnimatedComponent = {
  OpacityFadeInDiv: ({
    children,
    delay,
    style,
  }: {
    children: React.ReactElement;
    delay: number;
    style?: React.CSSProperties;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      style={style}>
      {children}
    </motion.div>
  ),
};

export default AnimatedComponent;
