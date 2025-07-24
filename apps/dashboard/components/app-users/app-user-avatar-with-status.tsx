import { Address } from 'viem';

import { SessionStatus } from '@getgrowly/core';
import { RandomAvatar } from '@getgrowly/ui';

export const AppUserAvatarWithStatus = ({
  walletAddress,
  avatar,
  name,
  withStatus = true,
  online = SessionStatus.Offline,
  size = 40,
  ...props
}: {
  walletAddress: Address;
  avatar?: string;
  name?: string | undefined | null;
  online?: SessionStatus;
  withStatus?: boolean;
  size?: number;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="relative" {...props}>
      <RandomAvatar address={walletAddress} size={size} ensAvatar={avatar} />
      {withStatus && online === SessionStatus.Online && (
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white`}></span>
      )}
    </div>
  );
};
