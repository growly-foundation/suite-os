'use client';
import { growlySuiteSdk } from '@/core/sdk';
import { usePrivy } from '@privy-io/react-auth';
import React, { useEffect } from 'react';
import { useDashboardState } from '../../hooks/use-dashboard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { delay } from '@/lib/utils';
import Lottie from 'react-lottie';
import animationData from '@/assets/animation/loading.json';

const ProtectedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser: setAuthUser } = useDashboardState();
  const { user, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async (email: string) => {
    let userExists = await growlySuiteSdk.db.user.getByField('email', email);
    if (!userExists) {
      userExists = await growlySuiteSdk.db.user.create({
        name: `user-${user?.id}`,
        email: email,
      });
    }
    setAuthUser(userExists);
  };

  useEffect(() => {
    async function createUserIfNotExists() {
      await delay(2000);
      if (!ready) return;
      if (authenticated && user?.email) {
        try {
          await fetchCurrentUser(user.email.address);
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

  return (
    <React.Fragment>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: animationData,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice',
              },
            }}
            speed={2}
            height={300}
            width={300}
          />
        </div>
      ) : (
        children
      )}
    </React.Fragment>
  );
};

export default ProtectedAuthProvider;
