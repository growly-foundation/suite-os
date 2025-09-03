import { MobileNavigation } from '@/components/MobileNavigation';
import { ChatPanel } from '@/components/chat/components/ChatPanel';
import { HomePanel } from '@/components/home/HomePanel';
import { SettingsPanel } from '@/components/settings/components/SettingsPanel';
import { useSuiteSession } from '@/hooks/use-session';
import { useSuite } from '@/hooks/use-suite';
import { useThemeStyles } from '@/hooks/use-theme-styles';
import { cn } from '@/lib/utils';
import { border } from '@/styles/theme';
import { Screen } from '@/types/screen';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { PanelHeader } from './PanelHeader';

export function PanelContainer() {
  const { config } = useSuite();
  const { panelOpen, screen } = useSuiteSession();
  const styles = useThemeStyles();

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'gas-fixed gas-rounded-tl-2xl gas-bottom-0 gas-right-0 gas-w-full gas-max-w-[500px] sm:gas-w-[500px] gas-shadow-3xl gas-z-[9999] gas-flex gas-flex-col overflow-hidden',
            border.default,
            config?.display === 'fullView' ? 'gas-h-[90vh]' : 'gas-h-[90vh] md:gas-h-[80vh]'
          )}
          style={styles.panel.container}>
          {/* Header */}
          <div className={'gas-p-4 gas-border-b'} style={styles.panel.header}>
            <PanelHeader />
          </div>
          {screen === Screen.Home ? (
            <HomePanel />
          ) : (
            <React.Fragment>
              {screen === Screen.Chat && <ChatPanel />}
              {screen === Screen.Settings && <SettingsPanel />}
              <MobileNavigation />
            </React.Fragment>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
