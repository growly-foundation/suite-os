'use client';

import { api } from '@/trpc/react';
import { createContext, useContext, useMemo } from 'react';
import { Address } from 'viem';

// Context for batch identity loading
export interface IdentityData {
  address: Address;
  name?: string;
  avatar?: string;
  hasCheckmark?: boolean;
}

export interface IdentityContextValue {
  identities: Record<Address, IdentityData>;
  isLoading: boolean;
}

const IdentityContext = createContext<IdentityContextValue | null>(null);

export const useIdentityContext = () => {
  const context = useContext(IdentityContext);
  if (!context) {
    throw new Error('useIdentityContext must be used within an IdentityProvider');
  }
  return context;
};

// Provider for batch identity loading
export const IdentityProvider = ({
  children,
  addresses,
}: {
  children: React.ReactNode;
  addresses: Address[];
}) => {
  const { data: identitiesData, isLoading } = api.persona.getAggregatedIdentities.useQuery(
    addresses,
    {
      enabled: addresses.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const contextValue = useMemo(() => {
    const identities: Record<Address, IdentityData> = {};

    if (identitiesData) {
      addresses.forEach(address => {
        const data = identitiesData[address];
        if (data) {
          // Prefer mainnet name/avatar, fallback to base
          const name = data.mainnet.name || data.base.name || undefined;
          const avatar = data.mainnet.avatar || data.base.avatar || undefined;

          identities[address] = {
            address,
            name,
            avatar,
            hasCheckmark: false, // No talent protocol checkmarks
          };
        }
      });
    }

    return {
      identities,
      isLoading,
    };
  }, [identitiesData, isLoading, addresses]);

  return <IdentityContext.Provider value={contextValue}>{children}</IdentityContext.Provider>;
};

// Hook for individual identity data (ENS only)
export const useIdentity = (address: Address) => {
  return api.persona.getAggregatedIdentity.useQuery(address, {
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for name from context (for batch loading)
export const useIdentityName = (address: Address) => {
  const { identities } = useIdentityContext();
  return identities[address]?.name;
};

// Hook for avatar from context (for batch loading)
export const useIdentityAvatar = (address: Address) => {
  const { identities } = useIdentityContext();
  return identities[address]?.avatar;
};
