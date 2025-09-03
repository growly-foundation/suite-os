import { ThemeName } from '@/types/theme';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import React, { useEffect, useState } from 'react';

import { useSuiteSession } from '../../hooks/use-session';
import { TooltipProvider } from '../ui/tooltip';
import { SuiteConfig, SuiteGlobalContext } from './SuiteProvider.types';
import { ThemeProvider } from './ThemeProvider';
import { WalletConnectProvider } from './WalletConnectProvider';
import { WorkflowExecutionObserver } from './WorkflowExecutionObserver';

const defaultConfig: SuiteConfig = {
  display: 'fullView',
  themeMode: ThemeName.Light,
  theme: {}, // Theme overrides will be handled by ThemeProvider
  brandName: 'Suite',
};

export const SuiteContext = React.createContext<
  SuiteGlobalContext & {
    appState: {
      walletAddress: `0x${string}` | undefined;
      setWalletAddress: (address: `0x${string}` | undefined) => void;
      setConfig: (config: SuiteConfig) => void;
    };
  }
>({
  agentId: '',
  organizationApiKey: '',
  session: undefined,
  config: defaultConfig,
  appState: {
    setConfig: (_config: SuiteConfig) => {},
    walletAddress: undefined,
    setWalletAddress: (_address: `0x${string}` | undefined) => {},
  },
});

export const SuiteProvider: React.FC<{
  children: React.ReactNode;
  context: SuiteGlobalContext;
}> = ({ children, context }) => {
  const [baseComponent, setBaseComponent] = useState<React.ReactNode>(<>{children}</>);
  const [isInitialized, setIsInitialized] = useState(false);
  const { createUserFromAddressIfNotExist, fetchOrganizationAgentById } = useSuiteSession();
  const [config, setConfig] = useState<SuiteConfig>(context.config ?? defaultConfig);
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    context.session?.walletAddress
  );

  useEffect(() => {
    setWalletAddress(context.session?.walletAddress);
  }, [context.session?.walletAddress]);

  useEffect(() => {
    const init = async () => {
      console.log('Growly Suite: Initializing...');
      setIsInitialized(false);
      try {
        if (!context.agentId || !context.organizationApiKey) {
          throw new Error('Agent ID and Organization API Key are required');
        }
        const agent = await fetchOrganizationAgentById(context.agentId, context.organizationApiKey);
        if (walletAddress && agent) {
          await createUserFromAddressIfNotExist(walletAddress, agent.id);
        }
      } catch (error) {
        console.error(`Growly Suite Error: ${error}`);
      }
      setIsInitialized(true);
    };
    init();
  }, [context, walletAddress]);

  useEffect(() => {
    let baseComponent = children;
    if (!walletAddress && !context.session?.connect) {
      console.log('Growly Suite: Wallet is not connected');
    }
    if (context.session?.walletConnect?.projectId) {
      console.log('Growly Suite: Enabling WalletConnect');
      // If wallet is not connected and there is not method to connect, we will use WalletConnectProvider.
      baseComponent = <WalletConnectProvider>{baseComponent}</WalletConnectProvider>;
    }

    if (context.integration?.onchainKit?.enabled) {
      console.log('Growly Suite: Enabling onchainKit');
      /// No need to enable the onchainKit feature if application already uses onchainKit.
      /// Requires `import '@coinbase/onchainkit/styles.css';`.
      baseComponent = (
        <OnchainKitProvider {...context.integration.onchainKit} address={walletAddress}>
          {baseComponent}
        </OnchainKitProvider>
      );
    }
    setBaseComponent(baseComponent);
  }, [isInitialized, context, walletAddress, children]);

  return (
    <SuiteContext.Provider
      value={{
        ...context,
        config,
        appState: {
          setConfig,
          walletAddress,
          setWalletAddress,
        },
      }}>
      <ThemeProvider
        defaultTheme={config.themeMode || ThemeName.Light}
        themeOverrides={config.theme}>
        <WorkflowExecutionObserver>
          <TooltipProvider>{baseComponent}</TooltipProvider>
        </WorkflowExecutionObserver>
      </ThemeProvider>
    </SuiteContext.Provider>
  );
};
