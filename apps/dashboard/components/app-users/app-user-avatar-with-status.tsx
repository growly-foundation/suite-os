import { useOnlineStatus } from '@/hooks/use-online-status';
import { useEffect, useState } from 'react';
import { Address } from 'viem';

import { RandomAvatar } from '@getgrowly/ui';

export const AppUserAvatarWithStatus = ({
  walletAddress,
  avatar,
  withStatus = true,
  size = 40,
  userId,
  ...props
}: {
  walletAddress: Address;
  avatar?: string;
  name?: string | undefined | null;
  withStatus?: boolean;
  size?: number;
  userId?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { isUserOnline } = useOnlineStatus();
  const [isOnline, setIsOnline] = useState(false);

  // Check real-time online status if userId is provided
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (userId) {
        try {
          const realtimeOnline = await isUserOnline(userId);
          setIsOnline(realtimeOnline);
        } catch (error) {
          console.error('Error checking online status:', error);
          // Fall back to prop value on error
          setIsOnline(false);
        }
      } else {
        // Fall back to prop value if no userId
        setIsOnline(false);
      }
    };

    checkOnlineStatus();
  }, [userId, isUserOnline]);

  return (
    <div className="relative" {...props}>
      <RandomAvatar address={walletAddress} size={size} ensAvatar={avatar} />
      {withStatus && isOnline && (
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white`}></span>
      )}
      {withStatus && !isOnline && (
        <span
          className={`absolute bottom-0 right-0 h-2 w-2 rounded-full bg-gray-400 ring-2 ring-white`}></span>
      )}
    </div>
  );
};
