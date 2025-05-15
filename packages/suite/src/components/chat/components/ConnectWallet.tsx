import { Button } from '@/components/ui/button';
import { useSuite } from '@/provider';
import { WalletIcon } from 'lucide-react';

export const ConnectWallet = () => {
  const { session } = useSuite();
  return (
    <div className="flex flex-col items-center gap-2">
      No wallet found. Please connect your wallet to continue.
      <Button onClick={session?.connect}>
        <WalletIcon /> Connect Wallet
      </Button>
    </div>
  );
};
