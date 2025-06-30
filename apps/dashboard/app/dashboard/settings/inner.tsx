'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OrganizationEditForm } from '@/components/organizations/organization-edit-form';
import { useDashboardState } from '@/hooks/use-dashboard';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { PaddingLayout } from '../layout';

export function OrganizationSettingsPageInner() {
  const router = useRouter();
  const { selectedOrganization, organizationStatus } = useDashboardState();

  if (!selectedOrganization || organizationStatus !== 'idle') {
    router.push('/organizations');
    return;
  }
  return (
    <React.Fragment>
      <div className="flex items-center border-b border-b-slate-200 px-4 py-2 justify-between">
        <p className="text-sm text-muted-foreground">Organization Settings</p>
        <Link href="/onboarding/organization">
          <PrimaryButton>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Organization
          </PrimaryButton>
        </Link>
      </div>
      <PaddingLayout>
        <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
          <OrganizationEditForm existingOrganization={selectedOrganization} />
        </div>
      </PaddingLayout>
    </React.Fragment>
  );
}
