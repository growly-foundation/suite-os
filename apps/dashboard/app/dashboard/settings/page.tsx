import { PrimaryButton } from '@/components/buttons/primary-button';
import { OrganizationEditForm } from '@/components/organizations/organization-edit-form';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { PaddingLayout } from '../layout';

export default function OrganizationSettingsPage() {
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
          <OrganizationEditForm />
        </div>
      </PaddingLayout>
    </React.Fragment>
  );
}
