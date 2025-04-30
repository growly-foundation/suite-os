// AppContext.js
import { type ComponentMode, type ComponentTheme, AppStackComponent } from '@/types/appstack';
import type React from 'react';
import { createContext, useState } from 'react';
import { base } from 'wagmi/chains';

type State = {
  activeComponent?: AppStackComponent | undefined;
  setActiveComponent?: (component: AppStackComponent | undefined) => void;
  chainId?: number;
  setChainId?: (chainId: number) => void;
  componentTheme?: ComponentTheme | undefined;
  setComponentTheme?: (theme: ComponentTheme | undefined) => void;
  componentMode: ComponentMode | undefined;
  setComponentMode: (mode: ComponentMode | undefined) => void;
};

export const defaultState: State = {
  activeComponent: AppStackComponent.ChatWidget,
  chainId: base.id,
  componentTheme: 'default',
  setComponentTheme: () => {},
  componentMode: 'auto',
  setComponentMode: () => {},
};

export const AppContext = createContext(defaultState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeComponent, setActiveComponent] = useState<AppStackComponent | undefined>(
    defaultState.activeComponent
  );

  const [componentTheme, setComponentTheme] = useState<ComponentTheme | undefined>(
    defaultState.componentTheme
  );

  const [componentMode, setComponentMode] = useState<ComponentMode | undefined>(
    defaultState.componentMode
  );

  const [chainId, setChainId] = useState<number | undefined>(defaultState.chainId);

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
      {children}
    </AppContext.Provider>
  );
};
