import React, { useEffect, useState } from 'react';
import { OnchainKitProvider, OnchainKitProviderReact } from '@coinbase/onchainkit';
import { useWidgetSession } from './hooks/use-session';
import { AgentId } from '@growly/core';
import { Loader2 } from 'lucide-react';

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
   * Display mode for the widget.
   */
  display?: 'fullView' | 'panel';
}

export interface SuiteGlobalContext {
  /**
   * Agent ID which the widget will be associated with.
   */
  agentId: AgentId;
  // TODO: Right now, use the organization ID as the API Key.
  organizationApiKey: string;
  /**
   * Session configuration.
   */
  session?: Partial<{
    walletAddress: `0x${string}`;
  }>;
  config?: SuiteConfig;
  setConfig?: (config: SuiteConfig) => void;
}

export const SuiteContext = React.createContext<SuiteGlobalContext>({
  agentId: '',
  organizationApiKey: '',
  session: undefined,
  config: undefined,
  setConfig: () => {},
});

export const SuiteProvider: React.FC<{
  children: React.ReactNode;
  context: SuiteGlobalContext;
}> = ({ children, context }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { createUserFromAddressIfNotExist, fetchOrganizationAgentById } = useWidgetSession();

  useEffect(() => {
    const init = async () => {
      setIsInitialized(false);
      try {
        if (context.session?.walletAddress) {
          await createUserFromAddressIfNotExist(context.session.walletAddress);
        }
        if (!context.agentId || !context.organizationApiKey) {
          throw new Error('Agent ID and Organization API Key are required');
        }
        await fetchOrganizationAgentById(context.agentId, context.organizationApiKey);
      } catch (error) {
        console.error(`Growly Suite Error: ${error}`);
      }
      setIsInitialized(true);
    };
    init();
  }, [context]);

  const baseComponent = (
    <SuiteContext.Provider value={context}>
      {isInitialized ? (
        children
      ) : (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
        </>
      )}
    </SuiteContext.Provider>
  );

  if (context.config?.onchainKit?.enabled) {
    /// No need to enable the onchainKit feature if application already uses onchainKit.
    /// Requires `import '@coinbase/onchainkit/styles.css';`.
    return (
      <OnchainKitProvider {...context.config.onchainKit} address={context.session?.walletAddress}>
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
