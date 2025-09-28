/* eslint-disable react-refresh/only-export-components */
// Wallet table context to manage all the Wallet Data in the table
import { createContext, useContext, useMemo, useState } from 'react';

import { WalletData } from './use-wallet-data';

type WalletAddress = string;

export type WalletTableContext = {
  state: Record<WalletAddress, WalletData>;
  updateWalletData: (userId: WalletAddress, walletData: WalletData) => void;
  getWalletData: (userId: WalletAddress) => WalletData | undefined;
};

export const WalletTableContext = createContext<WalletTableContext | null>(null);

export const useWalletTableContext = () => {
  const context = useContext(WalletTableContext);
  if (!context) {
    throw new Error('useWalletTableContext must be used within a WalletTableProvider');
  }
  return context;
};

export const WalletTableProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<Record<WalletAddress, WalletData>>({});
  const context = useMemo(
    () => ({
      state,
      updateWalletData: (userId: WalletAddress, walletData: WalletData) => {
        setState(prev => ({ ...prev, [userId]: walletData }));
      },
      getWalletData: (userId: WalletAddress) => state[userId],
    }),
    [state]
  );
  return <WalletTableContext.Provider value={context}>{children}</WalletTableContext.Provider>;
};
