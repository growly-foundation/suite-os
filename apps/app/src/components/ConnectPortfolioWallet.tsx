import { Atoms, Molecules } from '@/ui';
import { TAddress } from 'chainsmith-sdk/types';
import { Badge, Card } from '@radix-ui/themes';
import { useState } from 'react';
import { WalletIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export const ConnectPortfolioWallet = () => {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { address } = useAccount();
  return (
    <div>
      <Atoms.Loadable
        isLoading={!isConnected}
        loadComponent={
          <ConnectButton
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        }>
        <div>
          <Atoms.Modal open={popoverOpen} handleOpen={open => setPopoverOpen(open)}>
            <div>
              <Card className="bg-white rounded-xl">
                {address && (
                  <div className="flex items-center gap-4 mb-4">
                    <Molecules.WalletAddress className="my-1" address={address as TAddress} />
                    <Badge className="px-3 py-2 rounded-2xl" color="green">
                      Your wallet <WalletIcon size={15} className="ml-3" />
                    </Badge>
                  </div>
                )}
              </Card>
            </div>
          </Atoms.Modal>
          <Molecules.WalletAddress
            onClick={() => setPopoverOpen(true)}
            truncated
            className="py-7 relative"
            truncatedLength={15}
            address={address as any}
          />
        </div>
      </Atoms.Loadable>
    </div>
  );
};
