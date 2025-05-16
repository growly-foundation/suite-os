import { useSuiteSession } from '@/hooks/use-session';
import { useSuite } from '@/hooks/use-suite';
import { Screen } from '@/types/screen';
import { MobileNavigation } from '@/components/MobileNavigation';
import { SettingsPanel } from '@/components/settings/components/SettingsPanel';
import { ChatPanel } from '@/components/chat/components/ChatPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { border } from '@/styles/theme';
import { PanelHeader } from './PanelHeader';

export function PanelContainer() {
  const { config } = useSuite();
  const { panelOpen, screen } = useSuiteSession();

  return (
    <AnimatePresence>
      {panelOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed rounded-t-lg bottom-0 right-0 w-full max-w-[450px] sm:w-[450px] shadow-2xl z-[9999] flex flex-col overflow-hidden',
            border.default,
            config?.display === 'fullView' ? 'h-[100vh]' : 'h-[650px]'
          )}
          style={{
            backgroundColor: config?.theme?.background,
          }}>
          {/* Header */}
          <div
            className={cn('p-4 shadow-md border-b', border.lineDefault)}
            style={{
              backgroundColor: config?.theme?.headerBackground,
              color: config?.theme?.headerText,
            }}>
            <PanelHeader />
          </div>
          {screen === Screen.Chat && <ChatPanel />}
          {screen === Screen.Settings && <SettingsPanel />}
          <MobileNavigation />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
