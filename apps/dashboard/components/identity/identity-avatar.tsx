'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';
import { Address } from 'viem';

import { RandomAvatar } from '@getgrowly/ui';

export interface IdentityAvatarProps {
  address: Address;
  size?: number;
  withStatus?: boolean;
  userId?: string;
  className?: string;
  name?: string; // Optional override
  avatar?: string; // Optional override
}

export const IdentityAvatar = ({
  address,
  size = 40,
  withStatus = false,
  userId,
  className,
  avatar: avatarProp,
  ...props
}: IdentityAvatarProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { isUserOnline } = useOnlineStatus();
  const [isOnline, setIsOnline] = useState(false);

  // Only fetch avatar if not provided as prop
  const { data: avatarData } = api.persona.getAvatar.useQuery(
    { address: address as Address },
    {
      enabled: !avatarProp && !!address,
      staleTime: 5 * 60 * 1000,
      trpc: {
        context: {
          useBatch: true,
        },
      },
    }
  );

  const finalAvatar = avatarProp || avatarData;

  // Check real-time online status if userId is provided
  useEffect(() => {
    const checkOnlineStatus = async () => {
      if (userId && withStatus) {
        try {
          const realtimeOnline = await isUserOnline(userId);
          setIsOnline(realtimeOnline);
        } catch (error) {
          console.error('Error checking online status:', error);
          setIsOnline(false);
        }
      } else {
        setIsOnline(false);
      }
    };

    checkOnlineStatus();
  }, [userId, isUserOnline, withStatus]);

  return (
    <div className={`relative ${className || ''}`} {...props}>
      <RandomAvatar address={address} size={size} ensAvatar={finalAvatar} />
      {withStatus && isOnline && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
      )}
      {withStatus && !isOnline && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-gray-400 ring-2 ring-white" />
      )}
    </div>
  );
};
