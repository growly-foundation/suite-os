'use client';

import { useDashboardState } from '@/hooks/use-dashboard';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { FramerSpotlight, GridBackground } from '@getgrowly/ui';

export default function OnboardingRedirect() {
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { admin } = useDashboardState();

  useEffect(() => {
    if (ready && authenticated) {
      if (!admin || !admin.name || admin.name.startsWith('user-')) {
        // If the user doesn't have profile info filled out
        router.push('/onboarding/profile');
      } else {
        // Check if user has organizations in the next step
        router.push('/onboarding/organization');
      }
    } else if (ready && !authenticated) {
      router.push('/auth');
    }
  }, [ready, authenticated, admin, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl relative">
        <GridBackground />
        <FramerSpotlight />
        <div className="animate-pulse text-center my-12 z-10 relative">
          <h2 className="text-2xl font-semibold">Setting up your account...</h2>
          <p className="text-muted-foreground mt-2">
            Just a moment while we prepare your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
