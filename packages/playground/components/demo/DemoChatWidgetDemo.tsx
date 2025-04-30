import { useContext, useEffect } from 'react';
import { base } from 'viem/chains';
import { AppContext } from '../AppProvider';
import { DemoChatWidget, AppStackProvider, useAppStack } from '@growly/appstack';
import { Theme } from '@growly/appstack';

function DemoChatWidgetComponent() {
  const { config, setConfig } = useAppStack();
  const { componentTheme, chainId } = useContext(AppContext);
  useEffect(() => {
    setConfig({
      ...config,
      theme: componentTheme ? Theme[componentTheme] : Theme.monoTheme,
    });
  }, [componentTheme, setConfig]);
  return (
    <div className="relative mb-[50%] flex h-full w-full flex-col items-center">
      {chainId !== base.id ? (
        <div className="absolute top-0 left-0 z-10 flex h-full w-full flex-col justify-center rounded-xl bg-[#000000] bg-opacity-50 text-center">
          <div className="mx-auto w-2/3 rounded-md bg-muted p-6 text-sm">
            Buy Demo is only available on Base.
            <br />
            You're connected to a different network. Switch to Base to continue using the app.
          </div>
        </div>
      ) : (
        <DemoChatWidget defaultOpen />
      )}
    </div>
  );
}
export default function DemoChatWidgetDemo() {
  return (
    <AppStackProvider
      config={{
        onchainKit: {
          chain: base,
          projectId: process.env.NEXT_PUBLIC_APPSTACK_ONCHAINKIT_PROJECT_ID,
          apiKey: process.env.NEXT_PUBLIC_APPSTACK_ONCHAINKIT_CLIENT_KEY,
          enabled: true,
          config: {
            appearance: {
              theme: 'base',
              mode: 'light',
            },
          },
        },
        agent: {
          name: 'Growly Agent',
        },
        theme: Theme.monoTheme,
        session: {
          walletAddress: '0x849151d7D0bF1F34b70d5caD5149D28CC2308bf1',
        },
      }}>
      <DemoChatWidgetComponent />
    </AppStackProvider>
  );
}
