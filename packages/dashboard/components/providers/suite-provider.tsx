import { SuiteProvider, Theme } from '@growly/suite';
import { usePrivy } from '@privy-io/react-auth';

// Growly Foundation - Growly Customer Support
export const DUMMY_AGENT_ID = '22520453-f7b3-4c94-9cd4-5946c90c3c92';
export const DUMMY_ORGANIZATION_API_KEY = 'b3803e17-2435-4d5b-8cbe-3638c7ee539c';

export const SuiteProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = usePrivy();
  return (
    <SuiteProvider
      context={{
        agentId: DUMMY_AGENT_ID,
        organizationApiKey: DUMMY_ORGANIZATION_API_KEY,
        session: {
          walletAddress: user?.wallet?.address as any,
        },
        config: {
          theme: Theme.monoTheme,
          display: 'fullView',
        },
      }}>
      {children}
    </SuiteProvider>
  );
};
