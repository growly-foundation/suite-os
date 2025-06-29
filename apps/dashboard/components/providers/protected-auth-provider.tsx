'use client';

import { suiteCore } from '@/core/suite';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Admin } from '@getgrowly/core';

import { STORAGE_KEY_SELECTED_ORGANIZATION_ID, useDashboardState } from '../../hooks/use-dashboard';

const AnimatedLoading = dynamic(
  () =>
    import('@/components/animated-components/animated-loading').then(
      module => module.AnimatedLoading
    ),
  { ssr: false }
);

export const useAuth = () => {
  const { setAdmin, setSelectedOrganization, fetchOrganizations, selectedOrganization } =
    useDashboardState();
  const { user, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentAdmin = async (email: string): Promise<Admin> => {
    let adminExists = await suiteCore.db.admins.getOneByFields({ email });
    if (!adminExists) {
      adminExists = await suiteCore.db.admins.create({
        name: `user-${user?.id}`,
        email: email,
      });
    }
    setAdmin(adminExists);
    return adminExists;
  };

  const redirectToCreateOrganization = async (userId: string, redirectedPath: string) => {
    const organizations = await fetchOrganizations();
    if (organizations.length === 0) {
      // Redirect to organization onboarding instead of /organizations
      return router.push('/onboarding/organization');
    } else {
      // Check local storage if there is a selected organization
      const _selectedOrganizationId =
        localStorage.getItem(STORAGE_KEY_SELECTED_ORGANIZATION_ID(userId)) ||
        selectedOrganization?.id;
      if (!_selectedOrganizationId) {
        return router.push('/onboarding/organization');
      }
      // If there is a selected organization, select it.
      const organization = organizations.find(
        organization => organization.id === _selectedOrganizationId
      );
      // If there is no selected organization, select the first organization.
      if (!organization) {
        return router.push('/onboarding/organization');
      }
      setSelectedOrganization(organization);
      return router.push(redirectedPath);
    }
  };

  async function createUserIfNotExists() {
    if (!ready) {
      setIsLoading(false);
      return;
    }
    if (authenticated && user?.email) {
      try {
        const admin = await fetchCurrentAdmin(user.email.address);

        // Check if user needs to go through onboarding
        const isNewUser = admin.name.startsWith('user-');

        if (isNewUser) {
          // New user needs to complete profile onboarding
          router.push('/onboarding/profile');
          setIsLoading(false);
          return;
        }

        // If current route is auth, check organizations
        if (pathname === '/auth') {
          await redirectToCreateOrganization(admin.id, '/dashboard');
        } else if (pathname.startsWith('/onboarding')) {
          // If user is already in onboarding flow, continue there
          setIsLoading(false);
        } else {
          // For other routes, maintain them if user is already onboarded
          await redirectToCreateOrganization(admin.id, pathname);
        }

        setIsLoading(false);
      } catch (error) {
        toast.error(`Failed to identify user: ${error}`);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      router.push('/auth');
    }
  }

  return {
    createUserIfNotExists,
    redirectToCreateOrganization,
    fetchCurrentAdmin,
    isLoading,
  };
};

const ProtectedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, authenticated, ready } = usePrivy();
  const { createUserIfNotExists, isLoading } = useAuth();

  useEffect(() => {
    createUserIfNotExists();
  }, [user, authenticated, ready]);

  return <React.Fragment>{isLoading ? <AnimatedLoading /> : children}</React.Fragment>;
};

export default ProtectedAuthProvider;
