import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useThemeStyles } from '@/hooks/use-theme-styles';
import { cn } from '@/lib/utils';
import { border, text } from '@/styles/theme';
import { Loader2, LucideSend } from 'lucide-react';

import { TextMessageContent } from '@getgrowly/core';

export interface ChatInputProps {
  sendMessageHandler: (input: TextMessageContent['content']) => Promise<void>;
  isSending: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  isAgentThinking: boolean;
}

export const ChatInput = ({
  sendMessageHandler,
  isSending,
  inputValue,
  setInputValue,
  isAgentThinking,
}: ChatInputProps) => {
  const styles = useThemeStyles();

  // Handle key events: Enter to send, Shift+Enter for new line
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // ⛔ prevent new line
      sendMessageHandler(inputValue);
      setInputValue('');
    }
    // Shift+Enter will naturally create a new line (default behavior)
  };

  return (
    <div className={cn('gas-p-4 gas-border-t', border.lineDefault)} style={styles.chat.input}>
      <div className={cn('gas-flex gas-space-x-2', text.body)}>
        <Textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAgentThinking}
          required
          placeholder={
            isAgentThinking
              ? 'Agent is thinking...'
              : 'Send a message... (Shift+Enter for new line)'
          }
          style={{
            border: 'none',
            backgroundColor: styles.chat.input.backgroundColor,
            color: styles.chat.input.color,
          }}
          className={cn(
            'gas-flex-1',
            border.lineDefault,
            text.body,
            'placeholder:gas-text-gray-500 gas-text-sm placeholder:gas-text-sm focus:gas-outline-none focus:gas-ring-0'
          )}
        />
        <Button
          style={{
            color: styles.text.inverse.color,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
          }}
          onClick={() => sendMessageHandler(inputValue)}
          disabled={isAgentThinking || isSending}>
          {isSending ? (
            <Loader2 className="gas-h-4 gas-w-4 gas-animate-spin" />
          ) : (
            <LucideSend className="gas-h-4 gas-w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
