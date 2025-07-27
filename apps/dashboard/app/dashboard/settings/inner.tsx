'use client';

import { PrimaryButton } from '@/components/buttons/primary-button';
import { OrganizationEditForm } from '@/components/organizations/organization-edit-form';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { suiteCore } from '@/core/suite';
import { useDashboardState } from '@/hooks/use-dashboard';
import { AlertDialogAction } from '@radix-ui/react-alert-dialog';
import { Loader, PlusCircle, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { PaddingLayout } from '../layout';

export function OrganizationSettingsPageInner() {
  const router = useRouter();
  const { selectedOrganization, organizationStatus, setSelectedOrganization } = useDashboardState();
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [openDeleteOrganization, setOpenDeleteOrganization] = useState(false);

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;
    setLoadingDelete(true);
    try {
      const isConfirmed = window.confirm(
        `Are you sure you want to delete organization ${selectedOrganization.name}?`
      );
      if (isConfirmed) {
        await suiteCore.db.organizations.delete(selectedOrganization.id);
        setSelectedOrganization(undefined);
        toast.success('Organization deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Failed to delete organization');
    } finally {
      setLoadingDelete(false);
    }
  };

  if (!selectedOrganization || organizationStatus !== 'idle') {
    router.push('/organizations');
    return;
  }
  return (
    <React.Fragment>
      <div className="flex items-center border-b border-b-slate-200 px-4 py-2 justify-between">
        <p className="text-sm text-muted-foreground">Organization Settings</p>
        <div className="flex items-center gap-2">
          <Link href="/onboarding/organization">
            <PrimaryButton>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Organization
            </PrimaryButton>
          </Link>
          <AlertDialog open={openDeleteOrganization} onOpenChange={setOpenDeleteOrganization}>
            <AlertDialogTrigger asChild>
              <Button disabled={loadingDelete} variant="destructive" size="sm">
                {loadingDelete ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2Icon className="h-4 w-4" />
                )}
                {loadingDelete ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your organization and
                  remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex items-center justify-between">
                <AlertDialogCancel
                  className="text-xs"
                  onClick={() => setOpenDeleteOrganization(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="text-xs"
                  onClick={async () => {
                    await handleDeleteOrganization();
                    setOpenDeleteOrganization(false);
                  }}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <PaddingLayout>
        <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
          <OrganizationEditForm existingOrganization={selectedOrganization} />
        </div>
      </PaddingLayout>
    </React.Fragment>
  );
}
