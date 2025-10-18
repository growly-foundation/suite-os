'use client';

import { ChainConfigForm } from '@/components/chains/chain-config-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { SuiteLogoFull } from '@getgrowly/ui';

export function ChainSelectionForm() {
  const router = useRouter();
  const { selectedOrganization, setSelectedOrganization } = useDashboardState();

  if (!selectedOrganization) {
    router.push('/onboarding/organization');
    return null;
  }

  const handleChainConfigSave = async (chainIds: number[]) => {
    if (!selectedOrganization) return;

    try {
      await suiteCore.db.organizations.update(selectedOrganization.id, {
        supported_chain_ids: chainIds,
      });
      toast.success('Chain configuration saved successfully!');

      // Refresh the organization
      const updatedOrg = await suiteCore.organizations.getOrganizationById(selectedOrganization.id);
      if (updatedOrg) {
        setSelectedOrganization(updatedOrg);
      }

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving chain config:', error);
      toast.error('Failed to save chain configuration');
      throw error;
    }
  };

  return (
    <Card className="overflow-hidden md:overflow-auto scrollbar-hidden relative rounded-2xl flex max-h-[85vh] max-sm:h-[100vh] justify-between">
      <CardContent className="py-6 px-10 md:p-8 w-full max-h-full overflow-auto scrollbar-hidden">
        <div className="text-left mb-8">
          <h1 className="text-xl font-bold">Configure Your Blockchain Ecosystem</h1>
          <p className="text-md text-muted-foreground mt-2">
            Select up to 2 blockchain networks to work with. These chains will be available across
            all features including contract imports, NFT holders, resources, and persona analytics.
          </p>
        </div>
        <ChainConfigForm
          selectedChainIds={selectedOrganization.supported_chain_ids || []}
          onSave={handleChainConfigSave}
          maxChains={2}
          showTitle={false}
        />
      </CardContent>
    </Card>
  );
}

export default function ChainSelectionPage() {
  const router = useRouter();
  const { logout } = usePrivy();
  const { fetchOrganizations } = useDashboardState();
  const [hasOrganizations, setHasOrganizations] = useState(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  useEffect(() => {
    const checkOrganizations = async () => {
      setIsLoadingOrganizations(true);
      try {
        const orgs = await fetchOrganizations();
        setHasOrganizations(orgs.length > 0);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };
    checkOrganizations();
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 relative">
      {/* Action buttons in top-right corner */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {!isLoadingOrganizations && hasOrganizations && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout();
            router.push('/auth');
          }}
          className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="w-full max-w-sm md:max-w-3xl relative">
        <div className="absolute inset-0 blur-3xl opacity-30  pointer-events-none" />
        <div className="flex justify-center mb-8 z-10 relative">
          <SuiteLogoFull width={200} height={200} />
        </div>
        <ChainSelectionForm />
      </div>
    </div>
  );
}
