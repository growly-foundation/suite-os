import React, { useEffect, useState } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { useSuiteSession } from '../../hooks/use-session';
import { Loader2 } from 'lucide-react';
import { WalletConnectProvider } from './WalletConnectProvider';
import { SuiteGlobalContext } from './SuiteProvider.types';
import { Theme } from '../widgets';

export const SuiteContext = React.createContext<
  SuiteGlobalContext & {
    appState: {
      walletAddress: `0x${string}` | undefined;
      setWalletAddress: (address: `0x${string}` | undefined) => void;
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
  setConfig: () => {},
  appState: {
    walletAddress: undefined,
    setWalletAddress: () => {},
  },
});

export const SuiteProvider: React.FC<{
  children: React.ReactNode;
  context: SuiteGlobalContext;
}> = ({ children, context }) => {
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | undefined>(
    context.session?.walletAddress
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const { createUserFromAddressIfNotExist, fetchOrganizationAgentById } = useSuiteSession();

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

  let baseComponent = (
    <>{isInitialized ? children : <Loader2 className="h-5 w-5 animate-spin" />}</>
  );

  if (!walletAddress && !context.session?.connect) {
    console.log('Growly Suite: Wallet is not connected');
    if (context.session?.walletConnect?.projectId) {
      console.log('Growly Suite: Enabling WalletConnect');
      // If wallet is not connected and there is not method to connect, we will use WalletConnectProvider.
      baseComponent = <WalletConnectProvider>{baseComponent}</WalletConnectProvider>;
    }
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

  return (
    <SuiteContext.Provider
      value={{
        ...context,
        config: {
          display: context.config?.display ?? 'panel',
          theme: context.config?.theme ?? Theme.monoTheme,
        },
        appState: {
          walletAddress,
          setWalletAddress,
        },
      }}>
      {baseComponent}
    </SuiteContext.Provider>
  );
};
