import { ScrollArea } from '@/components/ui/scroll-area';
import { useSuite } from '@/hooks/use-suite';

export const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  const { config } = useSuite();
  return (
    <ScrollArea
      className="gas-flex-1 gas-h-full"
      style={{ padding: '0px 50px' }}
      id="chat-messages-container">
      {children}
    </ScrollArea>
  );
};
