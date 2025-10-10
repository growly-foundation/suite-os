import { useDashboardState } from '@/hooks/use-dashboard';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook to check if the organization has configured chains
 * Returns true if chains are configured, false otherwise
 */
export function useChainConfig() {
  const { selectedOrganization } = useDashboardState();

  const hasChainsConfigured =
    selectedOrganization?.supported_chain_ids &&
    selectedOrganization.supported_chain_ids.length > 0;

  return {
    hasChainsConfigured,
    supportedChainIds: selectedOrganization?.supported_chain_ids || [],
  };
}

/**
 * Hook to ensure chains are configured before proceeding
 * Redirects to chain configuration page if not configured
 */
export function useRequireChainConfig() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasChainsConfigured } = useChainConfig();
  const { selectedOrganization } = useDashboardState();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (warnedRef.current) return;
    if (!selectedOrganization) return;
    if (hasChainsConfigured) return;
    // Avoid warning/redirect loop on the chains page itself
    if (pathname && pathname.startsWith('/onboarding/chains')) return;

    warnedRef.current = true;
    toast.warning('Please configure your blockchain networks first', {
      toastId: 'require-chain-config',
    });
    router.push('/onboarding/chains');
  }, [selectedOrganization, hasChainsConfigured, router, pathname]);

  return { hasChainsConfigured };
}
