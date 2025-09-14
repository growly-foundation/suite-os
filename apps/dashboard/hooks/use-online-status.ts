import { OnlineStatusContext } from '@/contexts/online-status.context';
import { OnlineStatusContextType } from '@/types/online-status.types';
import { useContext } from 'react';

export const useOnlineStatus = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
};
