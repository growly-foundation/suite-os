import { suiteCore } from '@/core/suite';
import { usePrivy } from '@privy-io/react-auth';
import React, { useEffect } from 'react';
import { useDashboardState } from '../../hooks/use-dashboard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { delay } from '@/lib/utils';
import { AnimatedLoading } from '../animated-loading';

const ProtectedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setAdmin: setAuthUser } = useDashboardState();
  const { user, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentAdmin = async (email: string) => {
    let adminExists = await suiteCore.db.admins.getOneByFields({ email });
    if (!adminExists) {
      adminExists = await suiteCore.db.admins.create({
        name: `user-${user?.id}`,
        email: email,
      });
    }
    setAuthUser(adminExists);
  };

  useEffect(() => {
    async function createUserIfNotExists() {
      await delay(2000);
      if (!ready) return;
      if (authenticated && user?.email) {
        try {
          await fetchCurrentAdmin(user.email.address);
          setIsLoading(false);
          router.push('/dashboard');
        } catch (error) {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        router.push('/auth');
      }
    }
    createUserIfNotExists();
  }, [authenticated, user, ready]);

  return <React.Fragment>{isLoading ? <AnimatedLoading /> : children}</React.Fragment>;
};

export default ProtectedAuthProvider;
