import { ConnectWallet } from '@/components/chat/components/ConnectWallet';
import { PanelLayout } from '@/components/panel/components/PanelLayout';
import { Button } from '@/components/ui/button';
import { useSuiteSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';
import { text } from '@/styles/theme';
import { Screen } from '@/types/screen';
import { Address, Avatar, Identity, Name } from '@coinbase/onchainkit/identity';
import { ArrowLeft } from 'lucide-react';

export const SettingsPanel = () => {
  const { setScreen, user } = useSuiteSession();
  console.log('user', user);
  return (
    <PanelLayout>
      <div
        className={cn(
          'gas-flex gas-flex-col gas-items-center gas-justify-center gas-h-full gas-p-[50px] gas-space-y-4',
          text.base
        )}>
        {user?.entities.walletAddress ? (
          <Identity address={user.entities.walletAddress} hasCopyAddressOnClick={true}>
            <Avatar />
            <Name />
            <Address />
          </Identity>
        ) : (
          <ConnectWallet />
        )}
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
