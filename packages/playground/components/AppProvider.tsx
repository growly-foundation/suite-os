// AppContext.js
import { ENVIRONMENT, ENVIRONMENT_VARIABLES } from '@/lib/constants';
import { useStateWithStorage } from '@/lib/hooks';
import { type ComponentMode, type ComponentTheme, AppStackComponent } from '@/types/appstack';
import { OnchainKitProvider } from '@growly/appstack';
import type React from 'react';
import { createContext } from 'react';
import type { Address } from 'viem';
import { base } from 'wagmi/chains';

type State = {
  activeComponent?: AppStackComponent;
  setActiveComponent?: (component: AppStackComponent) => void;
  chainId?: number;
  setChainId?: (chainId: number) => void;
  componentTheme?: ComponentTheme;
  setComponentTheme: (theme: ComponentTheme) => void;
  componentMode: ComponentMode;
  setComponentMode: (mode: ComponentMode) => void;
  setVaultAddress: (vaultAddress: Address) => void;
};

export const defaultState: State = {
  activeComponent: AppStackComponent.ChatWidget,
  chainId: base.id,
  componentTheme: 'default',
  setComponentTheme: () => {},
  componentMode: 'auto',
  setComponentMode: () => {},
  setVaultAddress: () => {},
};

export const AppContext = createContext(defaultState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeComponent, setActiveComponent] = useStateWithStorage<AppStackComponent>({
    key: 'activeComponent',
    defaultValue: defaultState.activeComponent,
  });

  const [componentTheme, setComponentTheme] = useStateWithStorage<ComponentTheme>({
    key: 'componentTheme',
    defaultValue: defaultState.componentTheme,
  });

  const [componentMode, setComponentMode] = useStateWithStorage<ComponentMode>({
    key: 'componentMode',
    defaultValue: defaultState.componentMode,
  });

  const [chainId, setChainId] = useStateWithStorage<number>({
    key: 'chainId',
    parser: v => Number.parseInt(v),
    defaultValue: defaultState.chainId,
  });

  return (
    <AppContext.Provider
      value={{
        activeComponent,
        setActiveComponent,
        chainId,
        setChainId,
        componentTheme,
        setComponentTheme,
        componentMode,
        setComponentMode,
      }}>
      <OnchainKitProvider
        apiKey={ENVIRONMENT_VARIABLES[ENVIRONMENT.API_KEY]}
        chain={base}
        config={{
          appearance: {
            name: 'OnchainKit Playground',
            logo: 'https://pbs.twimg.com/media/GkXUnEnaoAIkKvG?format=jpg&name=medium',
            mode: componentMode,
            theme: componentTheme === 'none' ? undefined : componentTheme,
          },
          paymaster: paymasters?.[chainId || 8453]?.url,
          wallet: {
            display: 'modal',
            termsUrl: 'https://www.coinbase.com/legal/cookie',
            privacyUrl: 'https://www.coinbase.com/legal/privacy',
            supportedWallets: {
              rabby: false,
              trust: false,
              frame: false,
            },
          },
        }}
        projectId={ENVIRONMENT_VARIABLES[ENVIRONMENT.PROJECT_ID]}
        schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9">
        {children}
      </OnchainKitProvider>
    </AppContext.Provider>
  );
};
