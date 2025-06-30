'use client';

import { OrganizationEditForm } from '@/components/organizations/organization-edit-form';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboardState } from '@/hooks/use-dashboard';
import { useRouter } from 'next/navigation';

import { SuiteLogoFull } from '@getgrowly/ui';

export function OrganizationForm() {
  const router = useRouter();
  const { admin } = useDashboardState();

  if (!admin) {
    router.push('/onboarding');
    return null;
  }

  return (
    <Card className="overflow-hidden md:overflow-auto position-relative rounded-2xl flex max-h-[85vh] max-sm:h-[100vh] justify-between">
      <CardContent className="py-6 px-10 md:p-8 w-full max-h-full overflow-auto">
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
  return (
    <div className="bg-muted p-6 md:p-10 h-[100vh]">
      <div className="w-full max-w-[80%] max-sm:max-w-full flex flex-col items-center mx-auto">
        <SuiteLogoFull className="w-24 object-contain mb-6" />
        <OrganizationForm />
      </div>
    </div>
  );
}
