import { ConnectWallet } from '@/components/chat/components/ConnectWallet';
import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { Button } from '@/components/ui/button';
import { useSuiteSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { Screen } from '@/types/screen';
import { ArrowLeft } from 'lucide-react';

export const SettingsPanel = () => {
  const { setScreen, user } = useSuiteSession();
  return (
    <PanelLayout>
      <div
        className={cn(
          'gas-flex gas-flex-col gas-items-center gas-justify-center gas-h-full gas-p-[50px] gas-space-y-4',
          text.base
        )}>
        {!user?.entities.walletAddress && <ConnectWallet />}
        <Button
          onClick={() => {
            setScreen(Screen.Home);
          }}>
          <ArrowLeft /> Back to Main Panel
        </Button>
      </div>
    </PanelLayout>
  );
};
