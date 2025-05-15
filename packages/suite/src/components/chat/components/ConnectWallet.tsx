import { Button } from '@/components/ui/button';
import { useSuite } from '@/components/providers/SuiteProvider';
import { WalletIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const ConnectWallet = () => {
  const { session } = useSuite();
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-center text-foreground-muted" style={{ marginBottom: 10 }}>
          No wallet found. <br />
          Please connect your wallet to continue.
        </div>
        {session?.connect ? (
          <Button onClick={session?.connect}>
            <WalletIcon /> Connect Wallet
          </Button>
        ) : (
          <ConnectButton />
        )}
      </div>
    </div>
  );
};
