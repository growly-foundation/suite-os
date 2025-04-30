import React, { useState } from 'react';
import { OnchainKitProvider, OnchainKitProviderReact } from '@coinbase/onchainkit';

/**
 * Configuration for the Growly AppStack.
 */
export interface AppStackConfig {
  /**
   * Configuration for the OnchainKit feature.
   */
  onchainKit?: Omit<OnchainKitProviderReact, 'children' | 'address'> & { enabled: boolean };
  /**
   * Widget theme configuration.
   */
  theme?: Partial<{
    primary: string;
    secondary: string;
    background: string;
    backgroundForeground: string;
    headerBackground: string;
    headerText: string;
    text: string;
    textForeground: string;
  }>;
  /**
   * Agent configuration.
   */
  agent?: Partial<{
    avatar?: string;
    name?: string;
  }>;
  session?: Partial<{
    walletAddress: `0x${string}`;
  }>;
}

export const AppStackContext = React.createContext<{
  config?: AppStackConfig;
  setConfig: (config: AppStackConfig) => void;
} | null>(null);

export const AppStackProvider: React.FC<{
  children: React.ReactNode;
  config?: AppStackConfig;
}> = ({ children, config }) => {
  const [configState, setConfigState] = useState(config);

  const baseComponent = (
    <AppStackContext.Provider value={{ config: configState, setConfig: setConfigState }}>
      {children}
    </AppStackContext.Provider>
  );

  if (config?.onchainKit?.enabled) {
    /// No need to enable the onchainKit feature if application already uses onchainKit.
    /// Requires `import '@coinbase/onchainkit/styles.css';`.
    return (
      <OnchainKitProvider {...config.onchainKit} address={config.session?.walletAddress}>
        {baseComponent}
      </OnchainKitProvider>
    );
  }

  return baseComponent;
};

export const useAppStack = () => {
  const context = React.useContext(AppStackContext);
  if (!context) {
    throw new Error('useAppStack must be used within a AppStackProvider');
  }
  return context;
};
