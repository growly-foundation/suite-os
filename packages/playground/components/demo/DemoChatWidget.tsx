import { useContext } from 'react';
import { base } from 'viem/chains';
import { AppContext } from '../AppProvider';
import { DemoChatWidget, WidgetConfigProvider } from '@growly/appstack';
import { Theme } from '@growly/appstack';

function DemoChatWidgetComponent() {
  const { chainId } = useContext(AppContext);
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
    <WidgetConfigProvider
      config={{
        agent: {
          name: 'Test Agent',
        },
        theme: Theme.monoTheme,
      }}>
      <DemoChatWidgetComponent />
    </WidgetConfigProvider>
  );
}
