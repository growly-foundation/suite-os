import React, { useEffect, useMemo, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { useSuiteSession } from '../../hooks/use-session';
import { Loader2 } from 'lucide-react';
import { WalletConnectProvider } from './WalletConnectProvider';
import { SuiteConfig, SuiteGlobalContext } from './SuiteProvider.types';
import { Theme } from '../widgets';
import { WorkflowExecutionObserver } from './WorkflowExecutionObserver';

export const SuiteContext = React.createContext<
  SuiteGlobalContext & {
    appState: {
      walletAddress: `0x${string}` | undefined;
      setConfig: (config: SuiteConfig) => void;
    };
  }
>({
  agentId: '',
  organizationApiKey: '',
  session: undefined,
  config: {
    display: 'panel',
    theme: Theme.monoTheme,
  },
  appState: {
    setConfig: (_config: SuiteConfig) => {},
    walletAddress: undefined,
  },
});

export const SuiteProvider: React.FC<{
  children: React.ReactNode;
  context: SuiteGlobalContext;
}> = ({ children, context }) => {
  const [baseComponent, setBaseComponent] = useState<React.ReactNode>(<></>);
  const [isInitialized, setIsInitialized] = useState(false);
  const { createUserFromAddressIfNotExist, fetchOrganizationAgentById } = useSuiteSession();
  const [config, setConfig] = useState<SuiteConfig>(
    context.config ?? {
      display: 'fullView',
      theme: Theme.monoTheme,
    }
  );
  const walletAddress = useMemo(() => {
    return context.session?.walletAddress;
  }, [context.session?.walletAddress]);

  useEffect(() => {
    const init = async () => {
      console.log('Growly Suite: Initializing...');
      setIsInitialized(false);
      try {
        if (walletAddress) await createUserFromAddressIfNotExist(walletAddress);
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
  }, [context, walletAddress]);

  useEffect(() => {
    let baseComponent = (
      <>{isInitialized ? children : <Loader2 className="h-5 w-5 animate-spin" />}</>
    );

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
          walletAddress,
          setConfig,
        },
      }}>
      <WorkflowExecutionObserver>{baseComponent}</WorkflowExecutionObserver>
    </SuiteContext.Provider>
  );
};
