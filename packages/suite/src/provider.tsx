import React, { useState } from 'react';
import { OnchainKitProvider, OnchainKitProviderReact } from '@coinbase/onchainkit';

/**
 * Configuration for the Growly Suite.
 */
export interface SuiteConfig {
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

export const SuiteContext = React.createContext<{
  config?: SuiteConfig;
  setConfig: (config: SuiteConfig) => void;
} | null>(null);

export const SuiteProvider: React.FC<{
  children: React.ReactNode;
  config?: SuiteConfig;
}> = ({ children, config }) => {
  const [configState, setConfigState] = useState(config);

  const baseComponent = (
    <SuiteContext.Provider value={{ config: configState, setConfig: setConfigState }}>
      {children}
    </SuiteContext.Provider>
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

export const useSuite = () => {
  const context = React.useContext(SuiteContext);
  if (!context) {
    throw new Error('useSuite must be used within a SuiteProvider');
  }
  return context;
};
