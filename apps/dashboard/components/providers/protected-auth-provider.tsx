'use client';

import { suiteCore } from '@/core/suite';
import Intercom from '@intercom/messenger-js-sdk';
import { usePrivy } from '@privy-io/react-auth';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Admin } from '@getgrowly/core';

import { STORAGE_KEY_SELECTED_ORGANIZATION_ID, useDashboardState } from '../../hooks/use-dashboard';
import { useIntercomJWT } from '../../hooks/use-intercom-jwt';

const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

const AnimatedLoading = dynamic(
  () =>
    import('@/components/animated-components/animated-loading').then(
      module => module.AnimatedLoading
    ),
  { ssr: false }
);

// eslint-disable-next-line react-refresh/only-export-components
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
      return router.push('/onboarding/organization');
    } else {
      // Check local storage if there is a selected organization
      const _selectedOrganizationId =
        localStorage.getItem(STORAGE_KEY_SELECTED_ORGANIZATION_ID(userId)) ||
        selectedOrganization?.id;
      if (!_selectedOrganizationId) {
        return router.push('/organizations');
      }
      // If there is a selected organization, select it.
      const organization = organizations.find(
        organization => organization.id === _selectedOrganizationId
      );
      // If there is no selected organization, select the first organization.
      if (!organization) {
        return router.push('/organizations');
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
  const { admin } = useDashboardState();

  // Initialize Intercom JWT hook when admin is available
  const {
    jwt,
    fetchJWT,
    error: jwtError,
  } = useIntercomJWT({
    userId: admin?.id || '',
    userEmail: admin?.email || '',
    userName: admin?.name || '',
  });

  useEffect(() => {
    createUserIfNotExists();
  }, [user, authenticated, ready]);

  // Fetch JWT when admin is available
  useEffect(() => {
    if (admin?.id && admin?.email && admin?.name) {
      console.log('FETCHING JWT');
      fetchJWT();
    }
  }, [admin?.id, admin?.email, admin?.name, fetchJWT]);

  // Initialize Intercom with JWT authentication
  useEffect(() => {
    console.log('INTERCOM_APP_ID', INTERCOM_APP_ID);
    console.log('admin', admin);
    console.log('jwt', jwt);
    console.log('jwtError', jwtError);
    if (INTERCOM_APP_ID) {
      if (admin && jwt) {
        console.log('INITIALIZING INTERCOM WITH JWT');
        // Secure Intercom initialization with JWT
        Intercom({
          app_id: INTERCOM_APP_ID,
          intercom_user_jwt: jwt, // JWT token for secure authentication
          session_duration: 86400000,
        });
      } else if (admin && !jwt && !jwtError) {
        console.log('INITIALIZING INTERCOM WITHOUT JWT');
        // Fallback to basic initialization while JWT is loading
        Intercom({
          app_id: INTERCOM_APP_ID,
          user_id: admin.id,
          name: admin.name,
          email: admin.email,
          created_at: moment(admin.created_at).unix(),
        });
      } else if (!admin) {
        console.log('INITIALIZING INTERCOM ANONYMOUSLY');
        // Anonymous user initialization
        Intercom({
          app_id: INTERCOM_APP_ID,
        });
      }
    }
  }, [admin, jwt, jwtError]);

  return <React.Fragment>{isLoading ? <AnimatedLoading /> : children}</React.Fragment>;
};

export default ProtectedAuthProvider;
