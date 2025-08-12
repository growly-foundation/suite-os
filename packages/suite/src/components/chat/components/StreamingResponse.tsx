'use client';

import { Card } from '@/components/ui/card';
import { useThemeStyles } from '@/hooks/use-theme-styles';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import React from 'react';

import { SuiteUser } from '@getgrowly/ui';

import { ChatResponseAvatar } from './ChatResponseAvatar';

interface StreamingResponseProps {
  streamingText: string;
  currentStatus: string;
  showAvatar?: boolean;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  streamingText,
  currentStatus,
  showAvatar = true,
}) => {
  const { theme } = useTheme();
  const styles = useThemeStyles();

  // Don't render if there's no streaming text and no status
  if (!streamingText.trim() && !currentStatus) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-2"
      style={{ marginBottom: 10 }}>
      <ChatResponseAvatar showAvatar={showAvatar}>
        <SuiteUser width={30} height={30} style={{ minWidth: 30, minHeight: 30 }} />
      </ChatResponseAvatar>

      <div className="flex-1">
        {/* Status indicator */}
        {currentStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('text-sm text-gray-500 mb-2', text.caption)}
            style={{ fontStyle: 'italic' }}>
            {currentStatus}
          </motion.div>
        )}

        {/* Streaming text */}
        {streamingText.trim() && (
          <Card
            className={cn('py-2 px-4', text.body)}
            style={{
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              border: 'none',
              boxShadow: 'none',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}>
            <div className="whitespace-pre-wrap">
              {streamingText}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-block w-2 h-5 bg-current ml-1"
                style={{
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#000000',
                  verticalAlign: 'text-bottom',
                }}
              />
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
};
