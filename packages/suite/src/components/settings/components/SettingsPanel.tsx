import { ConnectWallet } from '@/components/chat/components/ConnectWallet';
import { PanelLayout } from '@/components/panel/components/PanelLayout';

export const SettingsPanel = () => {
  return (
    <PanelLayout>
      <div className="flex flex-col items-center justify-center h-full p-[50px]">
        <ConnectWallet />
      </div>
    </PanelLayout>
  );
};
