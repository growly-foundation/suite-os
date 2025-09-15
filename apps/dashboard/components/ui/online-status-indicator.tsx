'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { useEffect, useState } from 'react';

interface OnlineStatusIndicatorProps {
  userId: string;
  className?: string;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  userId,
  className = '',
}) => {
  const { isUserOnline } = useOnlineStatus();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const online = await isUserOnline(userId);
        setIsOnline(online);
      } catch (error) {
        console.error('Error checking online status:', error);
        setIsOnline(false);
      }
    };

    checkStatus();
  }, [userId, isUserOnline]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-xs text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};

export const OnlineCountIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { getOnlineCount } = useOnlineStatus();
  const onlineCount = getOnlineCount();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-xs text-gray-600">{onlineCount} online</span>
    </div>
  );
};
