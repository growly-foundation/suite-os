import { useThemeStyles } from '@/hooks/use-theme-styles';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  iconColor: string;
  onClick?: () => void;
}

export function QuickActionButton({
  icon,
  title,
  color,
  iconColor,
  onClick,
}: QuickActionButtonProps) {
  const styles = useThemeStyles();
  return (
    <motion.button
      onClick={onClick}
      className="gas-w-full gas-flex gas-items-center gas-p-3 gas-rounded-xl gas-transition-colors gas-duration-200"
      style={{
        ...styles.quickAction.container,
        backgroundColor: styles.quickAction.container.backgroundColor,
      }}
      whileHover={{ x: 4, backgroundColor: styles.quickAction.container.hoverBackgroundColor }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      <div className={cn('gas-rounded-full gas-p-2 gas-mr-3', color)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div
        className={cn('gas-flex-1 gas-text-left gas-font-medium gas-text-lg', text.base)}
        style={styles.text.primary}>
        {title}
      </div>
      <ChevronRight size={16} style={styles.text.muted} />
    </motion.button>
  );
}
