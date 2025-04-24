import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export const AppBar = () => {
  const { isConnected } = useAccount();
  return (
    <div className="flex mb-10 justify-between w-full items-center px-10">
      <div className="mb-3 flex items-center gap-4">
        <img src="/logo.png" width={30} className="rounded-[5px]" />
        <h2 className="text-lg font-bold">Cream</h2>
      </div>
      <div className="flex items-center gap-5">
        <a
          className="font-bold hover:text-orange-500"
          href="https://github.com/growly-official/cream">
          Github
        </a>
        {isConnected && <ConnectButton showBalance={false} />}
      </div>
    </div>
  );
};
