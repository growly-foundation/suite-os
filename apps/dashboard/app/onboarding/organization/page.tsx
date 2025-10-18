'use client';

import { OrganizationEditForm } from '@/components/organizations/organization-edit-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SuiteLogoFull } from '@getgrowly/ui';

export function OrganizationForm() {
  const router = useRouter();
  const { admin } = useDashboardState();

  if (!admin) {
    router.push('/onboarding');
    return null;
  }

  return (
    <Card className="overflow-hidden md:overflow-auto scrollbar-hidden position-relative rounded-2xl flex max-h-[85vh] max-sm:h-[100vh] justify-between">
      <CardContent className="py-6 px-10 md:p-8 w-full max-h-full overflow-hidden">
        <OrganizationEditForm />
      </CardContent>
      <img
        src="/banners/onboarding-organization-banner.png"
        alt="Banner"
        style={{ width: '50%', height: '90vh', objectFit: 'cover' }}
        className="dark:brightness-[0.2] dark:grayscale max-md:hidden"
      />
    </Card>
  );
}

export default function OrganizationPage() {
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
    <div className="bg-muted p-6 md:p-10 h-[100vh] relative">
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

      <div className="w-full max-w-[80%] max-sm:max-w-full flex flex-col items-center mx-auto">
        <SuiteLogoFull className="w-24 object-contain mb-6" />
        <OrganizationForm />
      </div>
    </div>
  );
}
