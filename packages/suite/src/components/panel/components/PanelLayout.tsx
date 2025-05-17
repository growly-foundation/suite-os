import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useSuite } from '@/hooks/use-suite';

export const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { config } = useSuite();
  return (
    <ScrollArea
      className={cn('flex-1', config?.display === 'fullView' ? 'max-h-[90vh]' : 'max-h-[500px]')}
      style={{ padding: '0px 50px' }}
      id="chat-messages-container">
      {children}
    </ScrollArea>
  );
};
