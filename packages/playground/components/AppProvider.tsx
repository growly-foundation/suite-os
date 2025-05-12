// AppContext.js
import { type ComponentMode, type ComponentTheme, SuiteComponent } from '@/types/suite';
import { SuiteConfig } from '@growly/suite';
import type React from 'react';
import { createContext, useState } from 'react';
import { base } from 'wagmi/chains';

type State = {
  activeComponent?: SuiteComponent | undefined;
  setActiveComponent?: (component: SuiteComponent | undefined) => void;
  chainId?: number;
  setChainId?: (chainId: number) => void;
  componentTheme?: ComponentTheme | undefined;
  setComponentTheme?: (theme: ComponentTheme | undefined) => void;
  componentMode: ComponentMode | undefined;
  setComponentMode: (mode: ComponentMode | undefined) => void;
  displayMode: SuiteConfig['display'];
  setDisplayMode: (mode: SuiteConfig['display']) => void;
};

export const defaultState: State = {
  activeComponent: SuiteComponent.DemoChatWidget,
  chainId: base.id,
  componentTheme: 'monoTheme',
  setComponentTheme: () => {},
  componentMode: 'auto',
  setComponentMode: () => {},
  displayMode: 'panel',
  setDisplayMode: () => {},
};

export const AppContext = createContext(defaultState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeComponent, setActiveComponent] = useState<SuiteComponent | undefined>(
    defaultState.activeComponent
  );

  const [componentTheme, setComponentTheme] = useState<ComponentTheme | undefined>(
    defaultState.componentTheme
  );

  const [componentMode, setComponentMode] = useState<ComponentMode | undefined>(
    defaultState.componentMode
  );

  const [chainId, setChainId] = useState<number | undefined>(defaultState.chainId);

  const [displayMode, setDisplayMode] = useState<SuiteConfig['display']>(defaultState.displayMode);

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
        displayMode,
        setDisplayMode,
      }}>
      {children}
    </AppContext.Provider>
  );
};
