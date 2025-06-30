'use client';

import { useAuth } from '@/components/providers/protected-auth-provider';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AnimatedBusterLoading } from '@getgrowly/ui';

export default function OnboardingRedirect() {
  const router = useRouter();
  const { fetchCurrentAdmin } = useAuth();
  const { authenticated, ready } = usePrivy();
  const { user } = usePrivy();

  useEffect(() => {
    async function checkOnboarding() {
      if (ready && authenticated) {
        if (!user?.email) {
          router.push('/auth');
          return;
        }
        const admin = await fetchCurrentAdmin(user.email.address);
        if (!admin || !admin.name || admin.name.startsWith('user-')) {
          // If the admin doesn't have profile info filled out
          router.push('/onboarding/profile');
        } else {
          // Check if admin has organizations in the next step
          router.push('/dashboard');
        }
      } else if (ready && !authenticated) {
        router.push('/auth');
      }
    }
    checkOnboarding();
  }, [ready, authenticated, user, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl relative">
        <div className="animate-pulse my-12 z-10 relative">
          <div className="flex items-center justify-center">
            <AnimatedBusterLoading width={120} height={120} />
            <div className="text-left" style={{ marginLeft: '20px' }}>
              <h2 className="text-2xl font-semibold">Setting up your account...</h2>
              <p className="text-muted-foreground mt-2">
                Just a moment while we prepare your experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
